import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { useToast } from '../../../App'
import { Loader, ScreenHeader } from '../../ui/wk'
import { VacancyForm } from './VacancyForm'
import { ResumeForm } from './ResumeForm'
import {
	useGetCitiesQuery,
	useGetSpheresQuery,
	useCreateVacancyMutation,
	useCreateResumeMutation,
	useUploadMediaBatchMutation,
	useApplyToVacancyMutation,
} from '../../store/store'

const tg = (window as any).Telegram?.WebApp

const CreatePage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const { showToast } = useToast()

	const { type, applyTo } = location.state || { type: 'vac' }
	const [applyToVacancy] = useApplyToVacancyMutation()
	const isVac = type === 'vac' || type === 'job'

	const { data: cities = [], isLoading: isStaticLoading } =
		useGetCitiesQuery(telegramId)
	const { data: spheres = [] } = useGetSpheresQuery(telegramId)

	const [createVacancy] = useCreateVacancyMutation()
	const [createResume] = useCreateResumeMutation()
	const [uploadMediaBatch] = useUploadMediaBatchMutation()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [statusText, setStatusText] = useState('')
	const [photos, setPhotos] = useState<File[]>([])
	const [videos, setVideos] = useState<File[]>([])

	// --- 1. ВТОРИЧНАЯ КНОПКА (ОТМЕНА) ---
	useEffect(() => {
		if (!tg) return
		const secondaryButton = tg.SecondaryButton

		if (tg.isVersionAtLeast('7.0')) {
			secondaryButton.setParams({
				text: 'ОТМЕНА',
				is_visible: true,
				color: tg.themeParams.secondary_bg_color,
				text_color: tg.themeParams.text_color,
			})

			const handleCancel = () => {
				tg.HapticFeedback.impactOccurred('light')
				navigate(-1)
			}

			secondaryButton.offClick(handleCancel)
			secondaryButton.onClick(handleCancel)
			return () => {
				secondaryButton.offClick(handleCancel)
				secondaryButton.hide()
			}
		}
	}, [navigate])

	// --- 2. ЛОГИКА СЖАТИЯ И СОХРАНЕНИЯ ---
	const processFiles = async (
		originalPhotos: File[],
		originalVideos: File[],
	) => {
		const processedPhotos: File[] = []
		if (originalPhotos.length > 0) {
			setStatusText('Оптимизация фото...')
			for (const file of originalPhotos) {
				try {
					const compressed = await imageCompression(file, {
						maxSizeMB: 0.8,
						maxWidthOrHeight: 1280,
					})
					processedPhotos.push(
						new File([compressed], file.name, {
							type: compressed.type,
						}),
					)
				} catch (e) {
					processedPhotos.push(file)
				}
			}
		}
		return { processedPhotos, processedVideos: originalVideos }
	}

	const handleCreate = async (formData: any) => {
		if (isSubmitting) return
		setIsSubmitting(true)
		setStatusText('Создание...')

		try {
			// Создаем запись
			const res = isVac
				? await createVacancy({
						tid: telegramId,
						data: formData,
					}).unwrap()
				: await createResume({
						tid: telegramId,
						data: formData,
					}).unwrap()

			// Обрабатываем медиа
			const { processedPhotos, processedVideos } = await processFiles(
				photos,
				videos,
			)
			const finalFiles = [...processedPhotos, ...processedVideos]

			if (finalFiles.length > 0) {
				setStatusText('Загрузка медиа...')
				await uploadMediaBatch({
					entity: isVac ? 'vacancies' : 'resumes',
					id: res.id,
					tid: telegramId,
					files: finalFiles,
				}).unwrap()
			}

			tg.HapticFeedback.notificationOccurred('success')
			// Пришли из «Откликнуться резюме» без резюме: отклик уходит сразу после создания
			if (!isVac && applyTo) {
				try {
					await applyToVacancy({ tid: telegramId, vacancyId: Number(applyTo), resumeId: res.id }).unwrap()
					showToast('Резюме создано и отклик отправлен')
				} catch (err: any) {
					showToast(err?.data?.message || 'Резюме создано, но отклик не отправился', 'error')
				}
				navigate(`/detail/${applyTo}?type=job`, { replace: true })
				return
			}
			showToast('Успешно опубликовано! 🚀')
			navigate('/profile')
		} catch (e) {
			tg.HapticFeedback.notificationOccurred('error')
			showToast('Ошибка при сохранении', 'error')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isStaticLoading) return <Loader />

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title={isVac ? 'Вакансия' : 'Резюме за 60 секунд'}
				subtitle={
					isVac
						? 'Вакансии с зарплатой и понятным описанием получают в 3 раза больше откликов.'
						: 'Работодатели увидят его в поиске сотрудников и смогут написать вам.'
				}
				onBack={() => navigate(-1)}
			/>

			<div>
				{isVac ? (
					<VacancyForm
						telegramId={telegramId}
						cities={cities}
						spheres={spheres}
						onSubmit={handleCreate}
						onMediaChange={(p, v) => {
							setPhotos(p)
							setVideos(v)
						}}
						loading={isSubmitting}
					/>
				) : (
					<ResumeForm
						telegramId={telegramId}
						cities={cities}
						spheres={spheres}
						onSubmit={handleCreate}
						onMediaChange={(p, v) => {
							setPhotos(p)
							setVideos(v)
						}}
						loading={isSubmitting}
					/>
				)}

				{isSubmitting && (
					<div
						className='fixed inset-0 z-[200] flex items-center justify-center p-6'
						style={{ background: 'rgba(14,14,16,.5)' }}
					>
						<div className='wk-panel flex flex-col items-center' style={{ width: 240, padding: 26 }}>
							<span className='wk-spinner wk-spinner--lg' />
							<div className='wk-h3' style={{ marginTop: 16 }}>
								{statusText}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default CreatePage
