// Отклики на мою вакансию: список кандидатов с главным сразу на карточке
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetVacancyApplicationsQuery } from '../../store/store'
import type { Application } from '../../../types'
import { Avatar, EmptyState, Loader, ScreenHeader, StatusPill, Tabs, plural } from '../../ui/wk'
import { STATUS_EMPLOYER, ago } from './status'

type F = 'all' | 'new' | 'invited'

export const ApplicantRow: React.FC<{ a: Application; onClick: () => void }> = ({ a, onClick }) => {
	const st = STATUS_EMPLOYER[a.status]
	return (
		<div className='wk-panel wk-press' style={{ padding: 16 }} onClick={onClick}>
			<div className='flex items-start' style={{ gap: 12 }}>
				<Avatar name={a.name} src={a.photoUrl} size={48} />
				<div className='flex-1 min-w-0'>
					<div className='flex items-center justify-between gap-2'>
						<div className='truncate' style={{ fontWeight: 700, fontSize: 16 }}>
							{a.name}
							{a.age ? `, ${a.age}` : ''}
						</div>
						<StatusPill tone={st.tone}>{st.label}</StatusPill>
					</div>
					<div className='wk-xs truncate' style={{ marginTop: 2 }}>
						{[a.subcategoryName || a.categoryName,
							a.experience ? `опыт ${a.experience} ${plural(a.experience, ['год', 'года', 'лет'])}` : 'без опыта',
							a.cityName,
							a.confirmedWorks ? `${a.workerRating ? '★ ' + a.workerRating + ' · ' : ''}✓ ${a.confirmedWorks}` : null,
						]
							.filter(Boolean)
							.join(' · ')}
					</div>
					{a.workPlaces.length > 0 && (
						<div className='wk-clamp2' style={{ fontSize: 13.5, marginTop: 8, color: 'var(--ink2)' }}>
							🏢 {a.workPlaces.map((w) => (w.role ? `${w.place} (${w.role})` : w.place)).join(', ')}
						</div>
					)}
					{a.message && (
						<div className='wk-clamp2' style={{ fontSize: 13.5, marginTop: 6, color: 'var(--muted)' }}>
							💬 «{a.message}»
						</div>
					)}
					<div className='wk-xs' style={{ marginTop: 8 }}>
						{ago(a.createdAt)}
					</div>
				</div>
			</div>
		</div>
	)
}

const ApplicantsPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const { vacancyId } = useParams()
	const navigate = useNavigate()
	const [f, setF] = useState<F>('all')
	const { data = [], isLoading } = useGetVacancyApplicationsQuery({ tid: telegramId, vacancyId: Number(vacancyId) })
	if (isLoading) return <Loader />
	const fresh = data.filter((a) => a.status === 'NEW').length
	const invited = data.filter((a) => a.status === 'INVITED').length
	const list = data.filter((a) => (f === 'new' ? a.status === 'NEW' : f === 'invited' ? a.status === 'INVITED' : true))
	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title='Отклики'
				subtitle={data[0] ? `«${data[0].vacancyTitle}» · контакты кандидатов открыты` : 'Кандидаты, которые откликнулись резюме'}
				onBack={() => navigate(-1)}
			/>
			<Tabs
				className='mt-[18px]'
				value={f}
				onChange={(v) => setF(v as F)}
				items={[
					{ value: 'all', label: `Все · ${data.length}` },
					{ value: 'new', label: `Новые · ${fresh}` },
					{ value: 'invited', label: `Приглашены · ${invited}` },
				]}
			/>
			<div className='wk-stack' style={{ marginTop: 16 }}>
				{list.length === 0 ? (
					<EmptyState
						emoji='📭'
						title={data.length ? 'Здесь пусто' : 'Откликов пока нет'}
						text={data.length ? 'Посмотрите другие вкладки' : 'Пришлём уведомление в бот, как только кто-то откликнется'}
					/>
				) : (
					list.map((a) => <ApplicantRow key={a.id} a={a} onClick={() => navigate(`/application/${a.id}`)} />)
				)}
			</div>
		</div>
	)
}

export default ApplicantsPage
