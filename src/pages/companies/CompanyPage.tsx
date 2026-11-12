// 5. Профиль компании [05] [06] [26]
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Camera, Plus, Share, ShieldCheck, X } from 'lucide-react'
import { listingCardProps, useToast } from '../../../App'
import {
	useDeleteCompanyPhotoMutation,
	useFollowCompanyMutation,
	useGetCompanyQuery,
	useGetCompanyReviewsQuery,
	useGetCompanyVacanciesQuery,
	useUploadCompanyPhotoMutation,
} from '../../store/store'
import type { Company } from '../../../types'
import {
	BackButton,
	Button,
	Cover,
	EmptyState,
	IconButton,
	JobCard,
	Loader,
	Logo,
	Panel,
	Perk,
	Sheet,
	StatsBlock,
	Tabs,
	coverGradientFor,
	cx,
	haptic,
	plural,
} from '../../ui/wk'
import { Rating, Stars, VerifiedTick } from '../../ui/company'

const BOT = import.meta.env.VITE_BOT_USERNAME || 'Workkg_bot'
const MAX_BYTES = 8 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']
type Tab = 'jobs' | 'about' | 'reviews'

const CompanyPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const { id: idParam } = useParams()
	const id = Number(idParam)
	const navigate = useNavigate()
	const [params, setParams] = useSearchParams()
	const tab = (['jobs', 'about', 'reviews'].includes(params.get('tab') || '')
		? params.get('tab')
		: 'jobs') as Tab
	const { showToast } = useToast()
	const { data: c, isLoading, isError, refetch } = useGetCompanyQuery({ id, tid: telegramId })
	const { data: jobs = [] } = useGetCompanyVacanciesQuery({ id, tid: telegramId })
	const { data: reviews = [] } = useGetCompanyReviewsQuery(id)
	const [follow, { isLoading: following }] = useFollowCompanyMutation()

	if (isLoading) return <Loader />
	if (isError || !c)
		return (
			<div className='wk-screen'>
				<BackButton onClick={() => navigate(-1)} />
				<div style={{ marginTop: 20 }}>
					<EmptyState
						emoji='🏢'
						title='Не удалось загрузить'
						text='Проверьте интернет'
						action={
							<Button variant='ink' size='sm' onClick={() => refetch()}>
								Повторить
							</Button>
						}
					/>
				</div>
			</div>
		)

	const share = async () => {
		haptic.impact('light')
		const link = `https://t.me/${BOT}?startapp=company_${c.id}`
		try {
			await navigator.clipboard.writeText(link)
			showToast('Ссылка скопирована')
		} catch {
			showToast(link, 'info')
		}
	}

	const toggleFollow = async () => {
		haptic.impact('medium')
		try {
			await follow({ id: c.id, tid: telegramId, on: !c.following }).unwrap()
			if (!c.following) showToast('Сообщим о новых вакансиях')
		} catch {
			showToast('Не получилось. Проверьте интернет', 'error')
		}
	}

	const reviewsCount = c.reviewsCount || 0

	return (
		<div className='wk-screen wk-screen--flush wk-enter text-left' style={{ paddingBottom: 40 }}>
			<CoverBlock c={c} telegramId={telegramId} onBack={() => navigate(-1)} onShare={share} />
			<Logo name={c.name} size={76} radius={22} className='wk-cprof__logo' />

			<div className='wk-pad'>
				{c.mine && (
					<div className='wk-cprof__mine'>
						Это ваша компания — добавьте фото зала, кухни и команды: с фото пишут в 2 раза чаще
					</div>
				)}

				<h1 className='wk-h1-company flex items-center gap-2' style={{ marginTop: 14 }}>
					<span>{c.name}</span>
					{c.verified && <VerifiedTick size={24} />}
				</h1>
				<div className='wk-meta' style={{ fontSize: 15, marginTop: 4 }}>
					{[c.type, c.cityName || 'Бишкек'].filter(Boolean).join(' · ')}
				</div>

				<div className='flex items-center flex-wrap' style={{ gap: '6px 14px', marginTop: 10 }}>
					<Rating value={c.rating} count={reviewsCount} long />
					{c.paidOnTimePct != null && (
						<span className='wk-paid'>Платит вовремя {c.paidOnTimePct}%</span>
					)}
				</div>
				{c.confirmRatePct != null && (
					<div className='wk-xs' style={{ marginTop: 6 }}>
						Подтверждает отметки сотрудников:{' '}
						<b style={{ color: 'var(--ink)', fontWeight: 700 }}>{c.confirmRatePct}%</b>
					</div>
				)}

				<div style={{ marginTop: 18 }}>
					<StatsBlock
						items={[
							{ value: c.staff || '—', label: 'сотрудников' },
							{ value: c.hiredCount ? c.hiredCount : '—', label: 'наняли здесь' },
							{ value: c.since || new Date().getFullYear(), label: 'с Work KG' },
						]}
					/>
				</div>

				<PhotoStrip c={c} telegramId={telegramId} />

				{c.mine ? (
					<Button
						variant='line'
						size='sm'
						block
						style={{ marginTop: 14 }}
						onClick={() => navigate('/company/edit')}
					>
						Редактировать профиль
					</Button>
				) : (
					<Button
						variant={c.following ? 'line' : 'ink'}
						size='sm'
						block
						loading={following}
						style={{ marginTop: 14 }}
						onClick={toggleFollow}
					>
						{c.following ? '✓ Вы подписаны' : 'Подписаться на вакансии'}
					</Button>
				)}

				<Tabs
					className='mt-[22px]'
					value={tab}
					onChange={(v) => setParams(v === 'jobs' ? {} : { tab: v }, { replace: true })}
					items={[
						{ value: 'jobs', label: `Вакансии · ${jobs.length}` },
						{ value: 'about', label: 'О компании' },
						{ value: 'reviews', label: `Отзывы · ${reviewsCount}` },
					]}
				/>

				<div style={{ marginTop: 16 }}>
					{tab === 'jobs' &&
						(jobs.length === 0 ? (
							<EmptyState
								emoji='💼'
								title='Открытых вакансий нет'
								text={
									c.mine
										? 'Опубликуйте вакансию — подписчики компании получат уведомление'
										: 'Подпишитесь — сообщим, когда появится новая'
								}
								action={
									c.mine ? (
										<Button
											variant='ink'
											size='sm'
											onClick={() => navigate('/create', { state: { type: 'vac' } })}
										>
											Создать вакансию
										</Button>
									) : undefined
								}
							/>
						) : (
							<div className='wk-stack'>
								{jobs.map((v: any) => {
									const p = listingCardProps({ ...v, companyName: v.companyName || c.name }, 'job')
									return (
										<JobCard
											key={v.id}
											{...p}
											company={
												<span className='wk-coname'>
													<span className='truncate'>{v.companyName || c.name}</span>
													{c.verified && <VerifiedTick size={16} />}
												</span>
											}
											onClick={() =>
												navigate(`/detail/${v.id}?type=job`, {
													state: { type: 'job', data: v },
												})
											}
										/>
									)
								})}
							</div>
						))}

					{tab === 'about' && (
						<div>
							{c.about ? (
								<p className='wk-body' style={{ whiteSpace: 'pre-line' }}>
									{c.about}
								</p>
							) : (
								<p className='wk-meta'>
									{c.mine ? 'Расскажите о компании в профиле' : 'Компания пока ничего не рассказала о себе'}
								</p>
							)}
							{c.perks && c.perks.length > 0 && (
								<>
									<h3 className='wk-h3' style={{ marginTop: 24 }}>
										Что даёт компания
									</h3>
									<div className='flex flex-wrap' style={{ gap: 10, marginTop: 12 }}>
										{c.perks.map((p) => (
											<Perk key={p}>{p}</Perk>
										))}
									</div>
								</>
							)}
						</div>
					)}

					{tab === 'reviews' &&
						(reviews.length === 0 ? (
							<EmptyState
								emoji='⭐️'
								title='Отзывов пока нет'
								text='Отзывы оставляют только те, кто работал здесь через Work KG'
							/>
						) : (
							<div className='wk-stack'>
								<Panel style={{ padding: 18 }}>
									<div className='flex items-start justify-between'>
										<div>
											<div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>
												{c.rating?.toFixed(1) ?? '—'}
											</div>
											<div className='wk-xs' style={{ marginTop: 6 }}>
												{reviewsCount}{' '}
												{plural(reviewsCount, [
													'подтверждённый отзыв',
													'подтверждённых отзыва',
													'подтверждённых отзывов',
												])}
											</div>
										</div>
										<Stars value={c.rating || 0} size={20} />
									</div>
									<div className='wk-bars'>
										<Bar label='Платит вовремя' value={c.bars?.paidOnTime} />
										<Bar label='Условия как в вакансии' value={c.bars?.conditions} />
										<Bar label='Отношение к людям' value={c.bars?.attitude} />
									</div>
								</Panel>
								{reviews.map((r) => (
									<div key={r.id} className='wk-review'>
										<div className='flex items-start justify-between gap-3'>
											<div style={{ fontWeight: 600, fontSize: 16 }}>{r.authorRole}</div>
											<Stars value={r.stars} />
										</div>
										{r.tenure && <div className='wk-xs'>{r.tenure}</div>}
										{r.text && (
											<p className='wk-body' style={{ marginTop: 10 }}>
												{r.text}
											</p>
										)}
										{r.disputed ? (
											<div className='wk-review__trust is-disputed'>
												⚖️ Компания оспорила · связывался через Work KG
											</div>
										) : (
											<div className='wk-review__trust'>
												<ShieldCheck size={15} strokeWidth={2} /> Работал(а) здесь — подтверждено
											</div>
										)}
									</div>
								))}
							</div>
						))}
				</div>
			</div>
		</div>
	)
}

const Bar: React.FC<{ label: string; value?: number | null }> = ({ label, value }) =>
	value == null ? null : (
		<div className='wk-bar'>
			<span>{label}</span>
			<span className='wk-bar__track'>
				<span className='wk-bar__fill' style={{ display: 'block', width: `${(value / 5) * 100}%` }} />
			</span>
			<b>{value.toFixed(1)}</b>
		</div>
	)

const checkFile = (f: File, toast: (m: string, t?: any) => void) => {
	if (!TYPES.includes(f.type)) {
		toast('Подходят только JPG, PNG или WEBP', 'error')
		return false
	}
	if (f.size > MAX_BYTES) {
		toast('Фото больше 8 МБ — выберите поменьше', 'error')
		return false
	}
	return true
}

/** Обложка 230 + glass-кнопки; у своей компании — «📷 Обложка» */
const CoverBlock: React.FC<{
	c: Company
	telegramId: number
	onBack: () => void
	onShare: () => void
}> = ({ c, telegramId, onBack, onShare }) => {
	const { showToast } = useToast()
	const input = useRef<HTMLInputElement>(null)
	const [local, setLocal] = useState<string | null>(null)
	const [upload, { isLoading }] = useUploadCompanyPhotoMutation()
	useEffect(() => () => void (local && URL.revokeObjectURL(local)), [local])

	const onFile = async (f?: File) => {
		if (!f || !checkFile(f, showToast)) return
		setLocal(URL.createObjectURL(f))
		try {
			await upload({ tid: telegramId, file: f, cover: true }).unwrap()
			haptic.notify('success')
			showToast('Обложка обновлена')
		} catch (e: any) {
			setLocal(null)
			showToast(e?.data?.message || 'Не удалось загрузить фото', 'error')
		}
	}

	return (
		<div style={{ position: 'relative' }}>
			<Cover name={c.name} src={local || c.coverUrl} height={230}>
				<BackButton glass onClick={onBack} />
				<div className='flex items-center gap-2'>
					{c.mine && (
						<button type='button' className='wk-coverbtn' onClick={() => input.current?.click()}>
							<Camera size={16} strokeWidth={2} /> Обложка
						</button>
					)}
					<IconButton glass label='Поделиться' onClick={onShare}>
						<Share size={20} strokeWidth={1.8} />
					</IconButton>
				</div>
			</Cover>
			{isLoading && (
				<div className='wk-photo__busy' style={{ zIndex: 1 }}>
					<span className='wk-spinner wk-spinner--lg' />
				</div>
			)}
			<input
				ref={input}
				type='file'
				accept={TYPES.join(',')}
				hidden
				onChange={(e) => {
					onFile(e.target.files?.[0])
					e.target.value = ''
				}}
			/>
		</div>
	)
}

/** Лента фото 150×118; у своей компании — «＋ Добавить фото» и удаление */
const PhotoStrip: React.FC<{ c: Company; telegramId: number }> = ({ c, telegramId }) => {
	const { showToast } = useToast()
	const input = useRef<HTMLInputElement>(null)
	const [draft, setDraft] = useState<{ file: File; url: string } | null>(null)
	const [caption, setCaption] = useState('')
	const [pending, setPending] = useState<{ url: string; caption: string } | null>(null)
	const [toDelete, setToDelete] = useState<number | null>(null)
	const [broken, setBroken] = useState<Record<number, boolean>>({})
	const [upload] = useUploadCompanyPhotoMutation()
	const [remove, { isLoading: removing }] = useDeleteCompanyPhotoMutation()
	const photos = c.photos || []

	if (!c.mine && photos.length === 0) return null

	const send = async () => {
		if (!draft) return
		const d = draft
		const cap = caption.trim()
		setDraft(null)
		setCaption('')
		setPending({ url: d.url, caption: cap })
		try {
			await upload({ tid: telegramId, file: d.file, caption: cap }).unwrap()
			haptic.notify('success')
		} catch (e: any) {
			showToast(e?.data?.message || 'Не удалось загрузить фото', 'error')
		} finally {
			setPending(null)
			URL.revokeObjectURL(d.url)
		}
	}

	return (
		<>
			<div className='wk-photos' style={{ marginTop: 14 }}>
				{photos.map((p) => (
					<div
						key={p.id}
						className='wk-photo'
						style={{ background: coverGradientFor(c.name) }}
					>
						{p.url && !broken[p.id] && (
							<img
								src={p.url}
								alt={p.caption || ''}
								loading='lazy'
								onError={() => setBroken((b) => ({ ...b, [p.id]: true }))}
							/>
						)}
						<div className='wk-photo__shade' />
						{p.caption && <span className='wk-photo__cap'>{p.caption}</span>}
						{c.mine && (
							<button
								type='button'
								className='wk-photo__x'
								aria-label='Удалить фото'
								onClick={() => setToDelete(p.id)}
							>
								<X size={14} strokeWidth={2.4} />
							</button>
						)}
					</div>
				))}
				{pending && (
					<div className='wk-photo'>
						<img src={pending.url} alt='' />
						{pending.caption && <span className='wk-photo__cap'>{pending.caption}</span>}
						<div className='wk-photo__busy'>
							<span className='wk-spinner' />
						</div>
					</div>
				)}
				{c.mine && (
					<button
						type='button'
						className={cx('wk-photo', 'wk-photo--add')}
						onClick={() => input.current?.click()}
					>
						<Plus size={18} strokeWidth={2} /> Добавить фото
					</button>
				)}
			</div>
			<input
				ref={input}
				type='file'
				accept={TYPES.join(',')}
				hidden
				onChange={(e) => {
					const f = e.target.files?.[0]
					e.target.value = ''
					if (f && checkFile(f, showToast)) setDraft({ file: f, url: URL.createObjectURL(f) })
				}}
			/>

			<Sheet
				open={!!draft}
				onClose={() => {
					if (draft) URL.revokeObjectURL(draft.url)
					setDraft(null)
				}}
				title='Новое фото'
				subtitle='Подпишите, что на фото — так понятнее, где предстоит работать'
			>
				{draft && (
					<img
						src={draft.url}
						alt=''
						style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16 }}
					/>
				)}
				<input
					className='wk-input'
					style={{ marginTop: 14 }}
					value={caption}
					maxLength={60}
					onChange={(e) => setCaption(e.target.value)}
					placeholder='Например: Зал на Тыналиева, Кухня'
				/>
				<Button variant='red' block style={{ marginTop: 16 }} onClick={send}>
					Добавить фото
				</Button>
			</Sheet>

			<Sheet open={toDelete != null} onClose={() => setToDelete(null)} title='Удалить фото?'>
				<p className='wk-meta'>Фото пропадёт из профиля компании.</p>
				<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 16 }}>
					<Button variant='line' onClick={() => setToDelete(null)}>
						Отмена
					</Button>
					<Button
						variant='ink'
						loading={removing}
						onClick={async () => {
							try {
								await remove({ tid: telegramId, photoId: toDelete! }).unwrap()
								showToast('Фото удалено')
							} catch {
								showToast('Не удалось удалить фото', 'error')
							}
							setToDelete(null)
						}}
					>
						Удалить
					</Button>
				</div>
			</Sheet>
		</>
	)
}

export default CompanyPage
