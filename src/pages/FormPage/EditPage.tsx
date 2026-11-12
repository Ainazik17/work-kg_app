import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { VacancyForm } from './VacancyForm'
import { ResumeForm } from './ResumeForm'
import { useToast } from '../../../App'
import { Loader, ScreenHeader } from '../../ui/wk'
import {
	useGetCitiesQuery,
	useGetSpheresQuery,
	useGetVacancyDetailQuery,
	useGetResumeDetailQuery,
	useUpdateVacancyMutation,
	useUpdateResumeMutation,
	useUploadMediaBatchMutation,
} from '../../store/store'

const tg = (window as any).Telegram?.WebApp

const EditPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const { showToast } = useToast()
	const formRef = useRef<HTMLFormElement>(null)

	const state = location.state || {}
	const type = state.type
	const targetId = state.id || state.existingData?.id
	const isVac = type === 'vac' || type === 'job'
	const entity: 'vacancies' | 'resumes' = isVac ? 'vacancies' : 'resumes'

	const { data: cities = [] } = useGetCitiesQuery(telegramId)
	const { data: spheres = [] } = useGetSpheresQuery(telegramId)

	const { data: vacData, isLoading: vacLoading } = useGetVacancyDetailQuery(
		{ id: targetId, tid: telegramId, isProfile: true },
		{ skip: !isVac || !targetId },
	)
	const { data: resData, isLoading: resLoading } = useGetResumeDetailQuery(
		{ id: targetId, tid: telegramId, isProfile: true },
		{ skip: isVac || !targetId },
	)

	const [updateVacancy] = useUpdateVacancyMutation()
	const [updateResume] = useUpdateResumeMutation()
	const [uploadMediaBatch] = useUploadMediaBatchMutation()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [statusText, setStatusText] = useState('')
	const [newPhotos, setNewPhotos] = useState<File[]>([])
	const [newVideos, setNewVideos] = useState<File[]>([])

	// --- ИНТЕГРАЦИЯ С НАВЫМИ КНОПКАМИ (API v7.0+) ---
	useEffect(() => {
		const mainButton = tg.MainButton
		const secondaryButton = tg.SecondaryButton

		mainButton.setParams({
			text: 'СОХРАНИТЬ ИЗМЕНЕНИЯ',
			color: '#111111', // Стильный черный или основной цвет темы
			text_color: '#ffffff',
			is_active: !isSubmitting,
			is_visible: true,
		})

		const handleMainClick = () => {
			if (formRef.current) {
				formRef.current.requestSubmit()
				tg.HapticFeedback.impactOccurred('medium')
			}
		}

		mainButton.onClick(handleMainClick)

		if (tg.isVersionAtLeast('7.0')) {
			secondaryButton
				.setParams({
					text: 'ОТМЕНИТЬ',
					is_visible: true,
					color: tg.themeParams.secondary_bg_color,
					text_color: tg.themeParams.text_color,
				})
				.onClick(() => navigate(-1))
		}

		return () => {
			mainButton.offClick(handleMainClick)
			mainButton.hide()
			secondaryButton.hide()
		}
	}, [isSubmitting, navigate])

	// Управление прогрессом в кнопке и защитой от закрытия
	useEffect(() => {
		if (isSubmitting) {
			tg.MainButton.showProgress()
			tg.enableClosingConfirmation()
		} else {
			tg.MainButton.hideProgress()
			tg.disableClosingConfirmation()
		}
	}, [isSubmitting])

	const initialData = useMemo(() => {
		const data: any = isVac ? vacData : resData
		if (!data) return null
		return {
			...data,
			cityId: data.city?.id || data.cityId,
			sphereId: data.sphere?.id || data.sphereId,
			categoryId: data.category?.id || data.categoryId,
			subcategoryId: data.subcategory?.id || data.subcategoryId,
			experienceInYear: data.experienceInYear
				? Number(data.experienceInYear)
				: 0,
			experience: data.experience ? Number(data.experience) : 0,
		}
	}, [isVac, vacData, resData])

	const processFiles = async (
		originalPhotos: File[],
		originalVideos: File[],
	) => {
		const processedPhotos: File[] = []
		if (originalPhotos.length > 0) {
			setStatusText('Оптимизация фото...')
			for (const file of originalPhotos) {
				try {
					if (file.size > 1024 * 1024) {
						const compressed = await imageCompression(file, {
							maxSizeMB: 0.8,
							maxWidthOrHeight: 1280,
						})
						processedPhotos.push(
							new File([compressed], file.name, {
								type: compressed.type,
							}),
						)
					} else {
						processedPhotos.push(file)
					}
				} catch (e) {
					processedPhotos.push(file)
				}
			}
		}
		return { processedPhotos, processedVideos: originalVideos }
	}

	const handleUpdate = async (formData: any) => {
		if (!targetId || isSubmitting) return
		setIsSubmitting(true)
		setStatusText('Сохранение...')

		try {
			if (isVac) {
				await updateVacancy({
					id: targetId,
					tid: telegramId,
					data: formData,
				}).unwrap()
			} else {
				await updateResume({
					id: targetId,
					tid: telegramId,
					data: formData,
				}).unwrap()
			}

			if (newPhotos.length > 0 || newVideos.length > 0) {
				const { processedPhotos, processedVideos } = await processFiles(
					newPhotos,
					newVideos,
				)
				const finalFiles = [...processedPhotos, ...processedVideos]

				if (finalFiles.length > 0) {
					setStatusText('Загрузка медиа...')
					await uploadMediaBatch({
						entity: entity,
						id: targetId,
						tid: telegramId,
						files: finalFiles,
					}).unwrap()
				}
			}

			tg.HapticFeedback.notificationOccurred('success')
			showToast('Изменения сохранены! ✨')
			navigate('/profile')
		} catch (e) {
			tg.HapticFeedback.notificationOccurred('error')
			showToast('Ошибка при обновлении', 'error')
		} finally {
			setIsSubmitting(false)
		}
	}

	const isLoading = isVac ? vacLoading : resLoading

	if (isLoading || !initialData) return <Loader />

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title={isVac ? 'Редактировать вакансию' : 'Редактировать резюме'}
				onBack={() => navigate(-1)}
			/>

			<div>
				{isVac ? (
					<VacancyForm
						telegramId={telegramId}
						cities={cities}
						spheres={spheres}
						initialData={initialData}
						onSubmit={handleUpdate}
						onMediaChange={(p, v) => {
							if (p.length > newPhotos.length)
								tg.HapticFeedback.selectionChanged()
							setNewPhotos(p)
							setNewVideos(v)
						}}
						loading={isSubmitting}
					/>
				) : (
					<ResumeForm
						telegramId={telegramId}
						cities={cities}
						spheres={spheres}
						initialData={initialData}
						onSubmit={handleUpdate}
						onMediaChange={(p, v) => {
							if (p.length > newPhotos.length)
								tg.HapticFeedback.selectionChanged()
							setNewPhotos(p)
							setNewVideos(v)
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

export default EditPage
