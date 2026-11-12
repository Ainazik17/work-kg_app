// Отклик резюме на вакансию: лист с резюме и парой слов
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../App'
import {
	useApplyToVacancyMutation,
	useGetUserResumesQuery,
	useGetWorkPlacesQuery,
} from '../../store/store'
import { Avatar, Button, Sheet, haptic, plural } from '../../ui/wk'

export const ApplySheet: React.FC<{
	open: boolean
	onClose: () => void
	telegramId: number
	vacancyId: number
	vacancyTitle: string
}> = ({ open, onClose, telegramId, vacancyId, vacancyTitle }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data: resumes = [] } = useGetUserResumesQuery(telegramId, { skip: !open })
	const active = resumes.filter((r) => r.isActive !== false)
	const [picked, setPicked] = useState<number | null>(null)
	const resume = active.find((r) => r.id === picked) || active[0]
	const { data: places = [] } = useGetWorkPlacesQuery(resume?.id as number, { skip: !resume })
	const [message, setMessage] = useState('')
	const [apply, { isLoading }] = useApplyToVacancyMutation()

	const send = async () => {
		if (!resume) return
		try {
			await apply({ tid: telegramId, vacancyId, resumeId: resume.id, message: message.trim() || undefined }).unwrap()
			haptic.notify('success')
			showToast('Отклик отправлен — работодатель увидит ваше резюме')
			setMessage('')
			onClose()
		} catch (e: any) {
			haptic.notify('error')
			showToast(e?.data?.message || 'Не удалось отправить. Проверьте интернет', 'error')
		}
	}

	return (
		<Sheet
			open={open}
			onClose={onClose}
			title='Отклик на вакансию'
			subtitle={`«${vacancyTitle}» · работодатель сразу увидит ваше резюме и контакты`}
		>
			{!resume ? (
				<>
					<p className='wk-body'>
						Резюме ещё нет. Заполните его за 60 секунд — отклик отправится сам.
					</p>
					<Button
						variant='red'
						block
						style={{ marginTop: 16 }}
						onClick={() => {
							onClose()
							navigate('/create', { state: { type: 'res', applyTo: vacancyId } })
						}}
					>
						Создать резюме и откликнуться
					</Button>
				</>
			) : (
				<>
					{active.length > 1 && (
						<div className='wk-chipwrap' style={{ marginBottom: 12 }}>
							{active.map((r) => (
								<button
									key={r.id}
									type='button'
									className={'wk-chip' + (r.id === resume.id ? ' is-active' : '')}
									onClick={() => setPicked(r.id)}
								>
									{r.subcategoryName || r.categoryName || r.name}
								</button>
							))}
						</div>
					)}
					<div className='wk-panel flex items-center' style={{ padding: 14, gap: 12 }}>
						<Avatar name={resume.name} src={resume.media?.[0]?.fileUrl} size={48} />
						<div className='min-w-0'>
							<div style={{ fontWeight: 700 }} className='truncate'>
								{resume.name}
								{resume.age ? `, ${resume.age}` : ''}
							</div>
							<div className='wk-xs truncate'>
								{[resume.subcategoryName || resume.categoryName,
									resume.experience ? `опыт ${resume.experience} ${plural(resume.experience, ['год', 'года', 'лет'])}` : 'без опыта',
									places.length ? `${places.length} ${plural(places.length, ['место', 'места', 'мест'])} работы` : null,
								]
									.filter(Boolean)
									.join(' · ')}
							</div>
						</div>
					</div>
					{places.length === 0 && (
						<button
							type='button'
							className='wk-xs'
							style={{ marginTop: 8, textDecoration: 'underline', textUnderlineOffset: 3 }}
							onClick={() => {
								onClose()
								navigate('/edit', { state: { type: 'res', id: resume.id } })
							}}
						>
							Добавьте «Где работали» — так вас чаще приглашают
						</button>
					)}
					<textarea
						className='wk-input'
						style={{ marginTop: 14, minHeight: 90 }}
						value={message}
						maxLength={500}
						onChange={(e) => setMessage(e.target.value)}
						placeholder='Пара слов работодателю (необязательно): когда можете выйти, почему вам подходит'
					/>
					<Button variant='red' block loading={isLoading} style={{ marginTop: 14 }} onClick={send}>
						Отправить отклик
					</Button>
				</>
			)}
		</Sheet>
	)
}
