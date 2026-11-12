// 7. Сделки [11] [12] [13] [14] [24] [28]: «Работали вместе?» одним касанием
import React, { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useToast } from '../../../App'
import {
	useCloseVacancyHiringMutation,
	useDealActionMutation,
	useGetEmployerDealsQuery,
	useGetWorkerDealsQuery,
	useUploadDealProofMutation,
} from '../../store/store'
import type { Deal, DealVacancyRow } from '../../../types'
import {
	Button,
	EmptyState,
	Logo,
	Panel,
	SectionHead,
	Sheet,
	SheetOption,
	Skeleton,
	StatusPill,
	Tabs,
	cx,
	haptic,
	plural,
} from '../../ui/wk'
import { Stars, VerifiedTick } from '../../ui/company'
import { StarInput } from '../../ui/stars'

const hoursLeft = (iso?: string | null) => {
	if (!iso) return null
	const h = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3600000))
	return `${h} ч`
}
const questionsTitle = (n: number) => `Ответьте на ${n} ${plural(n, ['вопрос', 'вопроса', 'вопросов'])}`

const DealsPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const [params, setParams] = useSearchParams()
	const tab = params.get('tab') === 'employer' ? 'employer' : 'worker'
	return (
		<div className='wk-screen wk-enter text-left'>
			<h1 className='wk-h1'>Сделки</h1>
			<p className='wk-meta' style={{ fontSize: 14, marginTop: 6 }}>
				Один вопрос — и работа засчитана
			</p>
			<Tabs
				className='mt-[18px]'
				value={tab}
				onChange={(v) => setParams(v === 'employer' ? { tab: 'employer' } : {}, { replace: true })}
				items={[
					{ value: 'worker', label: 'Я исполнитель' },
					{ value: 'employer', label: 'Я работодатель' },
				]}
			/>
			<div style={{ marginTop: 18 }}>
				{tab === 'worker' ? <WorkerTab telegramId={telegramId} /> : <EmployerTab telegramId={telegramId} />}
			</div>
		</div>
	)
}

// ---------------- Я исполнитель ----------------

const WorkerTab: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data, isLoading } = useGetWorkerDealsQuery(telegramId)
	const [act] = useDealActionMutation()
	const [proofFor, setProofFor] = useState<Deal | null>(null)
	const [gone, setGone] = useState<Set<number>>(new Set())

	if (isLoading || !data)
		return (
			<div className='wk-stack'>
				<Skeleton height={130} radius={26} />
				<Skeleton height={200} radius={22} />
			</div>
		)

	const { summary } = data
	const questions = data.questions.filter((d) => !gone.has(d.id))
	const requests = data.requests.filter((d) => !gone.has(d.id))
	const done = Math.min(summary.confirmedWorks, summary.badgeGoal)
	const left = summary.badgeGoal - done

	const hide = (id: number) => setGone((s) => new Set(s).add(id))

	const answer = async (d: Deal, stars?: number) => {
		hide(d.id)
		try {
			await act({ tid: telegramId, id: d.id, action: 'answer', stars }).unwrap()
			if (stars) {
				haptic.notify('success')
				showToast(`+30 баллов · ${d.otherName} получит «Всё верно?»`)
			} else showToast('Понятно, больше не спросим', 'info')
		} catch (e: any) {
			showToast(e?.data?.message || 'Не получилось. Проверьте интернет', 'error')
		}
	}

	const confirm = async (d: Deal, yes: boolean) => {
		hide(d.id)
		try {
			await act({ tid: telegramId, id: d.id, action: 'confirm', yes }).unwrap()
			if (yes) {
				haptic.notify('success')
				showToast('+30 баллов · работа подтверждена ✓')
			} else showToast('Понятно, отметку убрали', 'info')
		} catch (e: any) {
			showToast(e?.data?.message || 'Не получилось. Проверьте интернет', 'error')
		}
	}

	return (
		<>
			<div className='wk-badge'>
				<div className='flex items-center justify-between gap-3'>
					<div style={{ fontWeight: 700, fontSize: 17 }}>
						{summary.verifiedWorker ? '✓ Проверенный работник' : 'Бейдж «Проверенный работник»'}
					</div>
					<div style={{ opacity: 0.8, whiteSpace: 'nowrap', flexShrink: 0 }}>
						{done} / {summary.badgeGoal}
					</div>
				</div>
				<div className='wk-badge__track'>
					<div className='wk-badge__fill' style={{ width: `${(done / summary.badgeGoal) * 100}%` }} />
				</div>
				<div style={{ fontSize: 13, opacity: 0.8, marginTop: 10 }}>
					{summary.verifiedWorker
						? 'Вас показывают выше в поиске · +30 баллов за каждую подтверждённую работу'
						: `Ещё ${left} ${plural(left, ['подтверждённая работа', 'подтверждённые работы', 'подтверждённых работ'])} — и вы выше в поиске · +30 баллов за каждый ответ`}
				</div>
			</div>

			{questions.length > 0 && (
				<>
					<SectionHead title={questionsTitle(questions.length)} />
					<div className='wk-stack'>
						{questions.map((d) => (
							<Panel key={d.id} style={{ padding: 18 }}>
								<div style={{ fontSize: 15 }}>
									Вы работали с{' '}
									<b className='inline-flex items-center gap-1'>
										{d.otherName}
										{d.otherVerified && <VerifiedTick size={16} />}
									</b>
									?
								</div>
								<div className='wk-xs'>{[d.title, d.whenText].filter(Boolean).join(' · ')}</div>
								<div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 12 }}>Поставьте оценку — это и есть «да»</div>
								<StarInput onChange={(s) => answer(d, s)} label={`Оценка ${d.otherName}`} />
								<button type='button' className='wk-link' style={{ marginTop: 12 }} onClick={() => answer(d)}>
									Нет, не работали
								</button>
							</Panel>
						))}
					</div>
				</>
			)}

			{requests.length > 0 && (
				<>
					<SectionHead title='Подтвердите' />
					<div className='wk-stack'>
						{requests.map((d) => (
							<Panel key={d.id} style={{ padding: 18 }}>
								<div style={{ fontSize: 15 }}>
									<b className='inline-flex items-center gap-1'>
										{d.otherName}
										{d.otherVerified && <VerifiedTick size={16} />}
									</b>{' '}
									отметил(а), что вы у них работаете
								</div>
								<div className='wk-xs'>{d.title}</div>
								<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 14 }}>
									<Button variant='line' size='sm' onClick={() => confirm(d, false)}>
										Не работал
									</Button>
									<Button variant='ink' size='sm' onClick={() => confirm(d, true)}>
										Да, верно
									</Button>
								</div>
								<div className='wk-xs' style={{ marginTop: 10 }}>
									Если не ответите — засчитаем автоматически через {hoursLeft(d.dueAt)}
								</div>
							</Panel>
						))}
					</div>
				</>
			)}

			{questions.length === 0 && requests.length === 0 && (
				<Panel className='text-center' style={{ padding: 22, marginTop: 18 }}>
					<div style={{ fontWeight: 700 }}>Всё отвечено ✓</div>
					<div className='wk-xs' style={{ marginTop: 4 }}>
						Новые вопросы бот пришлёт сам
					</div>
				</Panel>
			)}

			<SectionHead title='Мои работы' right={data.works.length || undefined} />
			{data.works.length === 0 ? (
				<p className='wk-meta'>
					Здесь появятся работы, подтверждённые через Work KG. Откликайтесь на вакансии — после приглашения бот
					спросит «Работали?».
				</p>
			) : (
				<Panel style={{ padding: '4px 18px' }}>
					{data.works.map((d, i) => (
						<div key={d.id} style={{ padding: '14px 0', borderTop: i ? '1px solid var(--line)' : undefined }}>
							<div className='flex items-start justify-between gap-3'>
								<div className='min-w-0'>
									<div className='wk-h3 wk-clamp2'>{d.title}</div>
									<div className='wk-xs'>{[d.otherName, d.whenText].filter(Boolean).join(' · ')}</div>
								</div>
								{d.myStars ? <Stars value={d.myStars} size={14} /> : null}
							</div>
							<WorkTrust d={d} />
							<div className='flex flex-wrap' style={{ gap: 8, marginTop: 8 }}>
								{d.status === 'DISPUTED' && (
									<Button variant='line' size='xs' onClick={() => setProofFor(d)}>
										Добавить доказательство
									</Button>
								)}
								{d.canReview && (
									<Button variant='line' size='xs' onClick={() => navigate(`/deal/${d.id}/review`)}>
										✍️ Оставить отзыв
									</Button>
								)}
							</div>
						</div>
					))}
				</Panel>
			)}

			<ProofSheet deal={proofFor} telegramId={telegramId} onClose={() => setProofFor(null)} />
		</>
	)
}

const WorkTrust: React.FC<{ d: Deal }> = ({ d }) => {
	const map: Record<string, [string, string]> = {
		CONFIRMED: ['✓ Подтверждено', 'var(--ok)'],
		AWAIT_EMPLOYER: ['✓ Подтверждено · ждём ответ работодателя', 'var(--ok)'],
		DISPUTED: ['⚖️ Компания оспорила — отзыв виден с пометкой', '#B45309'],
		PROOF_REVIEW: ['⏳ Доказательство на проверке', 'var(--gig)'],
	}
	const [text, color] = map[d.status] || ['💬 Связывались через Work KG', 'var(--muted)']
	return <div style={{ fontSize: 12.5, fontWeight: 600, color, marginTop: 6 }}>{text}</div>
}

/** [24] «Докажите, что работали» */
const ProofSheet: React.FC<{ deal: Deal | null; telegramId: number; onClose: () => void }> = ({
	deal,
	telegramId,
	onClose,
}) => {
	const { showToast } = useToast()
	const input = useRef<HTMLInputElement>(null)
	const kind = useRef('CHAT')
	const [upload, { isLoading }] = useUploadDealProofMutation()
	const pick = (k: string) => {
		kind.current = k
		input.current?.click()
	}
	return (
		<Sheet
			open={!!deal}
			onClose={onClose}
			title='Докажите, что работали'
			subtitle='Модератор проверит за 24 часа. Компания увидит только итог.'
		>
			<div className='wk-stack'>
				<SheetOption icon='📱' title='Скриншот переписки' subtitle='Из WhatsApp или Telegram' onClick={() => pick('CHAT')} />
				<SheetOption icon='📸' title='Фото со смены' subtitle='Бейдж, форма, рабочее место' onClick={() => pick('PHOTO')} />
				<SheetOption icon='💳' title='Перевод зарплаты' subtitle='Скрин из банковского приложения' onClick={() => pick('PAYMENT')} />
				<SheetOption icon='📄' title='Договор или расчётный лист' subtitle='Если оформляли' onClick={() => pick('CONTRACT')} />
			</div>
			{isLoading && <p className='wk-note'>Загружаем…</p>}
			<input
				ref={input}
				type='file'
				accept='image/*,application/pdf'
				hidden
				onChange={async (e) => {
					const f = e.target.files?.[0]
					e.target.value = ''
					if (!f || !deal) return
					if (f.size > 10 * 1024 * 1024) return showToast('Файл больше 10 МБ — выберите поменьше', 'error')
					try {
						await upload({ tid: telegramId, id: deal.id, kind: kind.current, file: f }).unwrap()
						haptic.notify('success')
						showToast('Отправлено модератору')
						onClose()
					} catch (err: any) {
						showToast(err?.data?.message || 'Не удалось загрузить', 'error')
					}
				}}
			/>
		</Sheet>
	)
}

// ---------------- Я работодатель ----------------

const EmployerTab: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data, isLoading } = useGetEmployerDealsQuery(telegramId)
	const [act] = useDealActionMutation()
	const [disputeFor, setDisputeFor] = useState<Deal | null>(null)
	const [hireFor, setHireFor] = useState<DealVacancyRow | null>(null)
	const [gone, setGone] = useState<Set<number>>(new Set())

	if (isLoading || !data)
		return (
			<div className='wk-stack'>
				<Skeleton height={220} radius={22} />
				<Skeleton height={180} radius={22} />
			</div>
		)

	const requests = data.requests.filter((d) => !gone.has(d.id))
	const hide = (id: number) => setGone((s) => new Set(s).add(id))

	const rate = async (d: Deal, stars: number) => {
		hide(d.id)
		try {
			await act({ tid: telegramId, id: d.id, action: 'rate', stars }).unwrap()
			haptic.notify('success')
			showToast('Спасибо! Работа подтверждена ✓')
		} catch (e: any) {
			showToast(e?.data?.message || 'Не получилось', 'error')
		}
	}

	return (
		<>
			{requests.length > 0 && (
				<div className='wk-stack'>
					{requests.map((d) => (
						<Panel key={d.id} style={{ padding: 18 }}>
							<div className='flex items-start' style={{ gap: 12 }}>
								<Logo name={d.otherName} size={40} radius={12} />
								<div className='min-w-0'>
									<div style={{ fontSize: 15 }}>
										<b>{d.otherName}</b> отметил(а), что работал(а) у вас
									</div>
									<div className='wk-xs'>{d.title}</div>
								</div>
							</div>
							<div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 12 }}>Оцените — это подтвердит работу</div>
							<div className='wk-xs'>Его оценку вы увидите только после своего ответа</div>
							<StarInput onChange={(s) => rate(d, s)} />
							<div className='flex items-center justify-between' style={{ marginTop: 12 }}>
								<button type='button' className='wk-link' onClick={() => setDisputeFor(d)}>
									Он у нас не работал
								</button>
								<span className='wk-xs'>авто через {hoursLeft(d.dueAt)}</span>
							</div>
						</Panel>
					))}
				</div>
			)}

			<SectionHead title='Мои вакансии' first={requests.length === 0} />
			{data.vacancies.length === 0 ? (
				<EmptyState
					emoji='💼'
					title='Вакансий пока нет'
					text='Опубликуйте вакансию — отклики и найм будут здесь'
					action={
						<Button variant='ink' size='sm' onClick={() => navigate('/create', { state: { type: 'vac' } })}>
							Создать вакансию
						</Button>
					}
				/>
			) : (
				<div className='wk-stack'>
					{data.vacancies.map((v) => (
						<Panel key={v.vacancyId} style={{ padding: 18 }}>
							<div className='flex items-start justify-between gap-3'>
								<div className='min-w-0'>
									<div className='wk-clamp2' style={{ fontSize: 17, fontWeight: 600 }}>
										{v.title}
									</div>
									{v.schedule && <div className='wk-xs'>{v.schedule}</div>}
								</div>
								<StatusPill tone={v.closeResult || !v.active ? 'muted' : 'warn'}>{v.statusText}</StatusPill>
							</div>
							{v.wrote.length > 0 ? (
								<button
									type='button'
									className='flex items-center'
									style={{ gap: 12, marginTop: 14 }}
									onClick={() => navigate(`/applicants/${v.vacancyId}`)}
								>
									<span className='wk-avstack'>
										{v.wrote.slice(0, 5).map((p) => (
											<Logo key={p.userId} name={p.name} size={34} radius={12} />
										))}
									</span>
									<span className='wk-meta'>
										{v.wrote.length > 0 && `написали ${v.wrote.length}`}
									</span>
								</button>
							) : (
								<div className='wk-xs' style={{ marginTop: 12 }}>
									Откликов пока нет
								</div>
							)}
							{v.closeResult ? (
								<div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: 'var(--ok)' }}>
									{v.closeResult === 'HIRED' && v.hired.length
										? `✓ Наняли: ${v.hired.join(', ')}`
										: '✓ Закрыта без найма через Work KG'}
								</div>
							) : v.active ? (
								<Button variant='ink' size='sm' block style={{ marginTop: 14 }} onClick={() => setHireFor(v)}>
									Закрыть набор
								</Button>
							) : null}
						</Panel>
					))}
				</div>
			)}
			<p className='wk-xs' style={{ marginTop: 12 }}>
				Каждый отмеченный найм добавляется в «Наняли через Work KG» на профиле компании.
			</p>

			{data.done.length > 0 && (
				<>
					<SectionHead title='Завершённые' right={data.done.length} />
					<Panel style={{ padding: '4px 18px' }}>
						{data.done.map((d, i) => (
							<div
								key={d.id}
								className='flex items-start justify-between gap-3'
								style={{ padding: '14px 0', borderTop: i ? '1px solid var(--line)' : undefined }}
							>
								<div className='min-w-0'>
									<div style={{ fontWeight: 600 }}>{d.otherName}</div>
									<div className='wk-xs'>{[d.title, d.whenText].filter(Boolean).join(' · ')}</div>
									<div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4, color: d.status === 'CONFIRMED' ? 'var(--ok)' : d.status === 'AWAIT_WORKER' ? 'var(--muted)' : '#B45309' }}>
										{d.status === 'CONFIRMED'
											? '✓ Подтверждено'
											: d.status === 'AWAIT_WORKER'
												? `⏳ Ждём подтверждения · авто через ${hoursLeft(d.dueAt)}`
												: d.status === 'PROOF_REVIEW'
													? '⏳ Работник прислал доказательство'
													: '⚖️ Вы оспорили'}
									</div>
									{d.canReview && (
										<Button variant='line' size='xs' style={{ marginTop: 8 }} onClick={() => navigate(`/deal/${d.id}/review`)}>
											✍️ Оценить работника
										</Button>
									)}
								</div>
								{d.otherStars ? <Stars value={d.otherStars} size={14} /> : null}
							</div>
						))}
					</Panel>
				</>
			)}

			<DisputeSheet
				deal={disputeFor}
				onClose={() => setDisputeFor(null)}
				onConfirm={async (d) => {
					hide(d.id)
					setDisputeFor(null)
					try {
						await act({ tid: telegramId, id: d.id, action: 'dispute' }).unwrap()
						showToast('Отметка оспорена — передали модератору', 'info')
					} catch (e: any) {
						showToast(e?.data?.message || 'Не получилось', 'error')
					}
				}}
			/>
			<HireSheet row={hireFor} telegramId={telegramId} onClose={() => setHireFor(null)} />
		</>
	)
}

/** [14] «{Имя} у вас не работал?» */
const DisputeSheet: React.FC<{ deal: Deal | null; onClose: () => void; onConfirm: (d: Deal) => void }> = ({
	deal,
	onClose,
	onConfirm,
}) => {
	const first = deal?.otherName.split(' ')[0] || ''
	return (
		<Sheet open={!!deal} onClose={onClose} title={`${first} у вас не работал?`}>
			<ul className='wk-greybox'>
				<li>Его оценку вы не видели и не увидите до ответа — это нормально.</li>
				<li>
					Отзыв <b>не удалится</b>: он останется с пометкой «Компания оспорила».
				</li>
				<li>
					Если {first} пришлёт доказательства, отзыв станет подтверждённым, а показатель «Подтверждает отметки» на
					профиле компании снизится.
				</li>
			</ul>
			<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 16 }}>
				<Button variant='line' onClick={onClose}>
					Отмена
				</Button>
				<Button variant='ink' onClick={() => deal && onConfirm(deal)}>
					Да, оспорить
				</Button>
			</div>
		</Sheet>
	)
}

/** [13] «Кого наняли?» */
const HireSheet: React.FC<{ row: DealVacancyRow | null; telegramId: number; onClose: () => void }> = ({
	row,
	telegramId,
	onClose,
}) => {
	const { showToast } = useToast()
	const [picked, setPicked] = useState<number[]>([])
	const [close, { isLoading }] = useCloseVacancyHiringMutation()
	const people = useMemo(() => row?.wrote || [], [row])

	const finish = async (result: 'HIRED' | 'NONE' | 'OUTSIDE') => {
		if (!row) return
		if (result === 'HIRED' && picked.length === 0) return
		try {
			await close({ tid: telegramId, vacancyId: row.vacancyId, result, workerIds: result === 'HIRED' ? picked : [] }).unwrap()
			haptic.notify('success')
			showToast(
				result === 'HIRED'
					? `Бот спросит работников «Всё верно?» · +${picked.length} к «Наняли» на профиле`
					: 'Набор закрыт',
			)
			setPicked([])
			onClose()
		} catch (e: any) {
			showToast(e?.data?.message || 'Не получилось', 'error')
		}
	}

	return (
		<Sheet
			open={!!row}
			onClose={() => {
				setPicked([])
				onClose()
			}}
			title='Кого наняли?'
			subtitle={row ? `Эти люди писали вам по «${row.title}» через Work KG` : undefined}
		>
			{people.length === 0 ? (
				<p className='wk-meta'>Через Work KG по этой вакансии никто не откликался.</p>
			) : (
				<div className='wk-stack'>
					{people.map((p) => {
						const on = picked.includes(p.userId)
						return (
							<button
								key={p.userId}
								type='button'
								className={cx('wk-pick', on && 'is-on')}
								aria-pressed={on}
								onClick={() => {
									haptic.select()
									setPicked((s) => (on ? s.filter((x) => x !== p.userId) : [...s, p.userId]))
								}}
							>
								<Logo name={p.name} size={44} radius={14} />
								<span className='flex-1 min-w-0'>
									<span className='block truncate' style={{ fontWeight: 700 }}>
										{p.name}
									</span>
									<span className='wk-xs'>
										{p.rating ? `★ ${p.rating} · ` : ''}
										{p.works} {plural(p.works, ['работа', 'работы', 'работ'])}
									</span>
								</span>
								<span className={cx('wk-check', on && 'is-on')}>{on && <Check size={16} strokeWidth={3} />}</span>
							</button>
						)
					})}
				</div>
			)}
			{people.length > 0 && (
				<Button
					variant='red'
					block
					style={{ marginTop: 16, opacity: picked.length ? 1 : 0.4 }}
					disabled={!picked.length}
					loading={isLoading}
					onClick={() => finish('HIRED')}
				>
					{picked.length ? `Наняли ${picked.length} — закрыть набор` : 'Отметьте, кого наняли'}
				</Button>
			)}
			<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 10 }}>
				<Button variant='line' size='sm' onClick={() => finish('NONE')}>
					Никого
				</Button>
				<Button variant='line' size='sm' onClick={() => finish('OUTSIDE')}>
					Не через Work KG
				</Button>
			</div>
		</Sheet>
	)
}

export default DealsPage
