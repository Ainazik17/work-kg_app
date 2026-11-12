// Мои отклики (соискатель): статус по каждой вакансии
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../App'
import { useGetMyApplicationsQuery } from '../../store/store'
import { Button, EmptyState, Loader, Logo, ScreenHeader, StatusPill } from '../../ui/wk'
import { openTelegram, openWhatsApp } from '../../ui/contact'
import { STATUS_APPLICANT, ago } from './status'

const MyApplicationsPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data = [], isLoading } = useGetMyApplicationsQuery(telegramId)
	if (isLoading) return <Loader />
	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title='Мои отклики'
				subtitle='Когда работодатель пригласит, пришлём сообщение в бот с его контактами.'
				onBack={() => navigate(-1)}
			/>
			<div className='wk-stack' style={{ marginTop: 20 }}>
				{data.length === 0 ? (
					<EmptyState
						emoji='📨'
						title='Откликов пока нет'
						text='Откройте вакансию и нажмите «Откликнуться резюме»'
						action={
							<Button variant='ink' size='sm' onClick={() => navigate('/search')}>
								Найти вакансии
							</Button>
						}
					/>
				) : (
					data.map((a) => {
						const st = STATUS_APPLICANT[a.status]
						return (
							<div key={a.id} className='wk-job'>
								<div className='wk-job__row wk-press' onClick={() => navigate(`/detail/${a.vacancyId}?type=job`)}>
									<Logo name={a.companyName || a.vacancyTitle} size={48} />
									<div className='flex-1 min-w-0'>
										<div className='wk-job__title wk-clamp2'>{a.vacancyTitle}</div>
										<div className='wk-job__company truncate'>{a.companyName || 'Частное лицо'}</div>
									</div>
									<StatusPill tone={st.tone}>{st.label}</StatusPill>
								</div>
								<div className='wk-job__meta'>
									{[a.vacancySalary, `отклик ${ago(a.createdAt)}`].filter(Boolean).join(' · ')}
								</div>
								{a.status === 'INVITED' && (
									<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 14 }}>
										<Button
											variant='wa'
											size='sm'
											onClick={() =>
												openWhatsApp(a.employerPhone, `Здравствуйте! Вы пригласили меня по вакансии «${a.vacancyTitle}» в Work KG`) ||
												showToast('Номер не указан', 'error')
											}
										>
											WhatsApp
										</Button>
										<Button
											variant='tg'
											size='sm'
											onClick={() => openTelegram(a.employerUsername) || showToast('Telegram не указан', 'error')}
										>
											Telegram
										</Button>
									</div>
								)}
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}

export default MyApplicationsPage
