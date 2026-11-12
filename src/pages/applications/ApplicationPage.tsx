// Отклик глазами работодателя: резюме, история работы, контакты и решение в одном экране
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useToast } from '../../../App'
import { useDecideApplicationMutation, useGetApplicationQuery } from '../../store/store'
import {
	Avatar,
	BackButton,
	Button,
	EmptyState,
	FactTiles,
	Loader,
	Panel,
	StatusPill,
	haptic,
	plural,
} from '../../ui/wk'
import { openTelegram, openWhatsApp } from '../../ui/contact'
import { STATUS_APPLICANT, STATUS_EMPLOYER, ago } from './status'

const ApplicationPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data: a, isLoading, isError } = useGetApplicationQuery({ tid: telegramId, id: Number(id) })
	const [decide, { isLoading: deciding, originalArgs }] = useDecideApplicationMutation()

	if (isLoading) return <Loader />
	if (isError || !a)
		return (
			<div className='wk-screen'>
				<BackButton onClick={() => navigate(-1)} />
				<div style={{ marginTop: 20 }}>
					<EmptyState emoji='📭' title='Отклик не найден' text='Возможно, вакансию удалили' />
				</div>
			</div>
		)

	// Соискатель открыл свой отклик (из уведомления) — короткий статус
	if (!a.forEmployer) {
		const st = STATUS_APPLICANT[a.status]
		return (
			<div className='wk-screen wk-enter text-left'>
				<BackButton onClick={() => navigate(-1)} />
				<h2 className='wk-h2' style={{ marginTop: 18 }}>
					{a.vacancyTitle}
				</h2>
				<div className='wk-meta'>{a.companyName || 'Работодатель'}</div>
				<div style={{ marginTop: 12 }}>
					<StatusPill tone={st.tone}>{st.label}</StatusPill>
				</div>
				{a.status === 'INVITED' && (
					<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 20 }}>
						<Button
							variant='wa'
							onClick={() =>
								openWhatsApp(a.employerPhone, `Здравствуйте! Вы пригласили меня по вакансии «${a.vacancyTitle}» в Work KG`) ||
								showToast('Номер не указан', 'error')
							}
						>
							WhatsApp
						</Button>
						<Button variant='tg' onClick={() => openTelegram(a.employerUsername) || showToast('Telegram не указан', 'error')}>
							Telegram
						</Button>
					</div>
				)}
				<Button variant='line' block style={{ marginTop: 14 }} onClick={() => navigate(`/detail/${a.vacancyId}?type=job`)}>
					Открыть вакансию
				</Button>
			</div>
		)
	}

	const st = STATUS_EMPLOYER[a.status]
	const first = a.name.split(' ')[0]
	const hello = `Здравствуйте, ${first}! Вы откликнулись на вакансию «${a.vacancyTitle}» в Work KG.`

	const set = async (status: 'INVITED' | 'REJECTED') => {
		haptic.impact('medium')
		try {
			await decide({ tid: telegramId, id: a.id, status }).unwrap()
			showToast(
				status === 'INVITED'
					? `${first} получит приглашение и ваши контакты в боте`
					: 'Кандидату придёт вежливый отказ',
			)
		} catch (e: any) {
			showToast(e?.data?.message || 'Не получилось. Проверьте интернет', 'error')
		}
	}

	return (
		<div className='wk-screen wk-enter text-left' style={{ paddingBottom: 220 }}>
			<BackButton onClick={() => navigate(-1)} />

			<button
				type='button'
				className='wk-xs flex items-center gap-1.5'
				style={{ marginTop: 18 }}
				onClick={() => navigate(`/applicants/${a.vacancyId}`)}
			>
				<Briefcase size={14} strokeWidth={1.8} /> Отклик на «{a.vacancyTitle}» · {ago(a.createdAt)}
			</button>

			<div className='flex items-center' style={{ gap: 16, marginTop: 14 }}>
				<Avatar name={a.name} src={a.photoUrl} size={72} />
				<div className='min-w-0'>
					<h1 className='wk-h1' style={{ fontSize: 26 }}>
						{a.name}
					</h1>
					<div className='wk-meta' style={{ marginTop: 2 }}>
						{[
							a.age ? `${a.age} ${plural(a.age, ['год', 'года', 'лет'])}` : null,
							a.gender === 'FEMALE' ? 'Женщина' : a.gender === 'MALE' ? 'Мужчина' : null,
							a.cityName,
						]
							.filter(Boolean)
							.join(' · ')}
					</div>
					<div className='flex items-center flex-wrap' style={{ gap: 8, marginTop: 8 }}>
						<StatusPill tone={st.tone}>{st.label}</StatusPill>
						{a.confirmedWorks > 0 && (
							<span className='wk-xs' style={{ fontWeight: 600, color: 'var(--ok)' }}>
								{a.workerRating ? `★ ${a.workerRating} · ` : ''}
								{a.confirmedWorks} {plural(a.confirmedWorks, ['подтверждённая работа', 'подтверждённые работы', 'подтверждённых работ'])}
							</span>
						)}
					</div>
				</div>
			</div>

			<div style={{ marginTop: 20 }}>
				<FactTiles
					items={[
						{
							label: 'Опыт',
							value: a.experience ? `${a.experience} ${plural(a.experience, ['год', 'года', 'лет'])}` : 'Без опыта',
						},
						{ label: 'Кем', value: a.subcategoryName || a.categoryName || '—' },
						{ label: 'Мест работы', value: a.workPlaces.length || '—' },
					]}
				/>
			</div>

			{a.message && (
				<Panel style={{ padding: 16, marginTop: 14 }}>
					<div className='wk-xs'>Пишет вам</div>
					<p className='wk-body' style={{ marginTop: 4 }}>
						«{a.message}»
					</p>
				</Panel>
			)}

			<h3 className='wk-h3' style={{ marginTop: 26 }}>
				Где работал(а)
			</h3>
			{a.workPlaces.length === 0 ? (
				<p className='wk-meta' style={{ marginTop: 8 }}>
					Не указано. Спросите при звонке — люди часто не дописывают.
				</p>
			) : (
				<div className='wk-history'>
					{a.workPlaces.map((w, i) => (
						<div key={i} className='wk-history__item'>
							<span className='wk-history__dot' />
							<div className='min-w-0'>
								<div style={{ fontWeight: 700 }}>{w.place}</div>
								<div className='wk-xs'>{[w.role, w.period].filter(Boolean).join(' · ') || '—'}</div>
							</div>
						</div>
					))}
				</div>
			)}

			{a.description && (
				<>
					<h3 className='wk-h3' style={{ marginTop: 26 }}>
						О себе
					</h3>
					<p className='wk-body' style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
						{a.description}
					</p>
				</>
			)}

			<div className='wk-bottombar'>
				<div className='wk-bottombar__inner'>
					{a.status === 'INVITED' ? (
						<p className='wk-note' style={{ marginTop: 0, marginBottom: 10, color: 'var(--ok)', fontWeight: 600 }}>
							✓ Вы пригласили {first} — договоритесь о встрече
						</p>
					) : (
						<div className='grid grid-cols-2' style={{ gap: 10, marginBottom: 10 }}>
							<Button
								variant='line'
								size='sm'
								loading={deciding && originalArgs?.status === 'REJECTED'}
								disabled={a.status === 'REJECTED'}
								onClick={() => set('REJECTED')}
							>
								{a.status === 'REJECTED' ? 'Отказано' : 'Отказать'}
							</Button>
							<Button
								variant='ink'
								size='sm'
								loading={deciding && originalArgs?.status === 'INVITED'}
								onClick={() => set('INVITED')}
							>
								Пригласить
							</Button>
						</div>
					)}
					<div className='grid grid-cols-2' style={{ gap: 10 }}>
						<Button variant='wa' onClick={() => openWhatsApp(a.phone, hello) || showToast('Номер не указан', 'error')}>
							WhatsApp
						</Button>
						<Button
							variant='tg'
							onClick={() => openTelegram(a.telegramUsername) || showToast('Telegram не указан', 'error')}
						>
							Telegram
						</Button>
					</div>
					<p className='wk-note'>Контакты открыты: кандидат откликнулся сам</p>
				</div>
			</div>
		</div>
	)
}

export default ApplicationPage
