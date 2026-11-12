// Профиль → «Подписки на компании»
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetFollowedCompaniesQuery } from '../../store/store'
import { Button, EmptyState, Loader, ScreenHeader } from '../../ui/wk'
import { CompanyCardList } from '../../ui/company'

const FollowingPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { data = [], isLoading } = useGetFollowedCompaniesQuery(telegramId)
	if (isLoading) return <Loader />
	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title='Подписки на компании'
				subtitle='Пришлём уведомление в бот, как только они откроют вакансию.'
				onBack={() => navigate(-1)}
			/>
			<div className='wk-stack' style={{ marginTop: 20 }}>
				{data.length === 0 ? (
					<EmptyState
						emoji='🔔'
						title='Подписок пока нет'
						text='Откройте компанию и нажмите «Подписаться на вакансии»'
						action={
							<Button variant='ink' size='sm' onClick={() => navigate('/companies')}>
								Смотреть компании
							</Button>
						}
					/>
				) : (
					data.map((c) => (
						<CompanyCardList key={c.id} c={c} onClick={() => navigate(`/company/${c.id}`)} />
					))
				)}
			</div>
		</div>
	)
}

export default FollowingPage
