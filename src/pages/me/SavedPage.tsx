// Профиль → «Сохранённые»
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { listingCardProps } from '../../../App'
import { useGetSavedQuery } from '../../store/store'
import { Button, EmptyState, JobCard, Loader, ScreenHeader, StatusPill } from '../../ui/wk'
import { SaveHeart } from '../../ui/save'

const SavedPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { data = [], isLoading } = useGetSavedQuery(telegramId)
	if (isLoading) return <Loader />
	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader title='Сохранённые' subtitle='Вакансии, которые вы отметили сердечком.' onBack={() => navigate(-1)} />
			<div className='wk-stack' style={{ marginTop: 20 }}>
				{data.length === 0 ? (
					<EmptyState
						emoji='🤍'
						title='Пока ничего не сохранено'
						text='Нажмите ♡ на вакансии, чтобы вернуться к ней позже'
						action={
							<Button variant='ink' size='sm' onClick={() => navigate('/search')}>
								Найти вакансии
							</Button>
						}
					/>
				) : (
					data.map((v: any) => (
						<div key={v.id} style={{ opacity: v.isActive === false ? 0.6 : 1 }}>
							<JobCard
								{...listingCardProps(v, 'job')}
								right={
									v.isActive === false ? (
										<StatusPill tone='muted'>Закрыта</StatusPill>
									) : (
										<SaveHeart vacancyId={v.id} />
									)
								}
								onClick={() => navigate(`/detail/${v.id}?type=job`, { state: { type: 'job', data: v } })}
							/>
						</div>
					))
				)}
			</div>
		</div>
	)
}

export default SavedPage
