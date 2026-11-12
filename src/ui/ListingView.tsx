// Экран «Вакансия» [07] [27] — общая вёрстка для вакансии и резюме.
// Логика (запросы, трекинг, ссылки) остаётся в страницах и приходит пропсами.
import React from 'react'
import { ChevronRight, Eye, MapPin, MousePointerClick, Play } from 'lucide-react'
import { VerifiedTick } from './company'
import { VoicePlayer } from './voice'
import {
	Avatar,
	BackButton,
	Button,
	Cover,
	FactTiles,
	Logo,
	Perk,
	fmtNum,
	plural,
	yearsText,
} from './wk'

const genderText = (g?: string, any = 'Любой пол') =>
	g === 'MALE' ? 'Мужчина' : g === 'FEMALE' ? 'Женщина' : any

const fmtDate = (d?: string) => {
	if (!d) return 'сегодня'
	const date = new Date(d)
	const today = new Date()
	if (date.toDateString() === today.toDateString()) return 'сегодня'
	return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export const ListingView: React.FC<{
	item: any
	isJob: boolean
	stats?: { viewsCount?: number; contactClicksCount?: number }
	isLocked?: boolean
	onBack: () => void
	onWhatsApp: () => void
	onTelegram: () => void
	onUnlock?: () => void
	onRoute?: () => void
	onMedia?: (m: any) => void
	extra?: React.ReactNode
	note?: React.ReactNode
	/** Компания автора вакансии: ссылка «{Компания} ✓ ›» и тап по логотипу ведут в её профиль */
	company?: { id: number; name: string; verified: boolean; coverUrl?: string | null } | null
	onCompany?: () => void
	/** Главное действие над контактами (например, «Откликнуться резюме») */
	primary?: React.ReactNode
	/** Glass-кнопки справа на обложке: сердечко, «поделиться» */
	coverRight?: React.ReactNode
}> = ({
	item,
	isJob,
	stats,
	isLocked,
	onBack,
	onWhatsApp,
	onTelegram,
	onUnlock,
	onRoute,
	onMedia,
	extra,
	note,
	company,
	onCompany,
	primary,
	coverRight,
}) => {
	const media: any[] = item.media || []
	const photo = media.find((m) => m.mediaType === 'PHOTO')?.fileUrl
	const coverPhoto = photo || (isJob ? company?.coverUrl : null)
	const brandName = isJob ? company?.name || item.companyName || item.title : item.name

	const salary = isJob
		? item.salary
			? String(item.salary)
			: 'Договорная'
		: Number(item.experience)
			? `${item.experience} ${plural(Number(item.experience), ['год', 'года', 'лет'])} опыта`
			: 'Без опыта'

	const facts = isJob
		? [
				{ label: 'График', value: item.schedule || '—' },
				{ label: 'Опыт', value: yearsText(item.experienceInYear) },
				{
					label: 'Где',
					value:
						item.distanceKm != null
							? `${String(Number(item.distanceKm).toFixed(1)).replace('.', ',')} км`
							: item.cityName || '—',
				},
			]
		: [
				{ label: 'Возраст', value: item.age ? `${item.age}` : '—' },
				{ label: 'Опыт', value: yearsText(item.experience) },
				{ label: 'Город', value: item.cityName || '—' },
			]

	const perks: string[] = isJob
		? [
				item.minAge || item.maxAge
					? `🎂 ${item.minAge || 18}–${item.maxAge || 60} лет`
					: '',
				`👤 ${genderText(item.preferredGender)}`,
				item.subcategoryName ? `🏷 ${item.subcategoryName}` : '',
			].filter(Boolean)
		: [
				`👤 ${genderText(item.gender, '—')}`,
				item.categoryName ? `🏷 ${item.categoryName}` : '',
				item.subcategoryName ? `🏷 ${item.subcategoryName}` : '',
			].filter(Boolean)

	return (
		<div
			className='wk-screen--flush wk-enter text-left'
			style={primary ? { paddingBottom: 210 } : undefined}
		>
			<Cover name={brandName} src={coverPhoto} height={190}>
				<BackButton glass onClick={onBack} />
				{coverRight && <div className='flex items-center gap-2'>{coverRight}</div>}
			</Cover>

			<div className='wk-pad'>
				{isJob ? (
					<Logo
						name={brandName}
						size={68}
						className={company ? 'wk-overlap-logo wk-press' : 'wk-overlap-logo'}
						style={company ? { cursor: 'pointer' } : undefined}
						{...(company ? { onClick: onCompany } : {})}
					/>
				) : (
					<div
						className='wk-overlap-logo'
						style={{ borderRadius: '50%', width: 68, display: 'inline-block' }}
					>
						<Avatar name={item.name} src={coverPhoto} size={68} />
					</div>
				)}

				<div
					className='flex items-center gap-1.5'
					style={{ marginTop: 14, fontSize: 14, fontWeight: 600, color: 'var(--ink2)' }}
				>
					{isJob && company ? (
						<button type='button' className='flex items-center gap-1.5' onClick={onCompany}>
							{company.name}
							{company.verified && <VerifiedTick size={16} />}
							<ChevronRight size={16} strokeWidth={2} />
						</button>
					) : isJob ? (
						item.companyName || 'Частное лицо'
					) : (
						[item.cityName, item.categoryName].filter(Boolean).join(' · ')
					)}
				</div>
				<h1 className='wk-h1' style={{ marginTop: 6 }}>
					{isJob ? item.title : item.name}
				</h1>
				<div style={{ marginTop: 10, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>
					{salary}
				</div>

				<div style={{ marginTop: 20 }}>
					<FactTiles items={facts} />
				</div>

				{perks.length > 0 && (
					<>
						<h3 className='wk-h3' style={{ marginTop: 28, marginBottom: 12 }}>
							{isJob ? 'Кого ищут' : 'Коротко'}
						</h3>
						<div className='wk-chipwrap'>
							{perks.map((p) => (
								<Perk key={p}>{p}</Perk>
							))}
						</div>
					</>
				)}

				{media.length > 0 && (
					<>
						<h3 className='wk-h3' style={{ marginTop: 28, marginBottom: 12 }}>
							Фото и видео
						</h3>
						<div className='wk-gallery'>
							{media.map((m: any, i: number) => (
								<div
									key={m.id ?? i}
									className='wk-gallery__tile'
									onClick={() => onMedia?.(m)}
								>
									{m.mediaType === 'VIDEO' ? (
										<>
											<video src={m.fileUrl} muted />
											<span
												className='absolute inset-0 flex items-center justify-center'
												style={{ background: 'rgba(0,0,0,.25)', color: '#fff' }}
											>
												<Play size={26} fill='#fff' />
											</span>
										</>
									) : (
										<img src={m.fileUrl} alt='' />
									)}
								</div>
							))}
						</div>
					</>
				)}

				<h3 className='wk-h3' style={{ marginTop: 28, marginBottom: 10 }}>
					{isJob ? 'О работе' : 'О себе'}
				</h3>
				{item.voiceUrl && (
					<div style={{ marginBottom: 12 }}>
						<VoicePlayer url={item.voiceUrl} duration={item.voiceDuration} />
					</div>
				)}
				<div className='wk-body' style={{ whiteSpace: 'pre-wrap' }}>
					{item.description}
				</div>

				{isJob && item.address && (
					<button
						onClick={onRoute}
						className='flex items-start gap-2 text-left'
						style={{ marginTop: 18, fontSize: 14, color: 'var(--muted)' }}
					>
						<MapPin size={18} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
						<span>
							{item.address} ·{' '}
							<span style={{ color: 'var(--ok)', fontWeight: 600 }}>
								маршрут в 2GIS
							</span>
						</span>
					</button>
				)}

				{extra && <div style={{ marginTop: 24 }}>{extra}</div>}

				<div
					className='flex items-center flex-wrap gap-x-3 gap-y-1'
					style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)' }}
				>
					<span className='inline-flex items-center gap-1'>
						<Eye size={14} strokeWidth={1.8} /> {fmtNum(stats?.viewsCount || 0)}
					</span>
					<span className='inline-flex items-center gap-1'>
						<MousePointerClick size={14} strokeWidth={1.8} />{' '}
						{fmtNum(stats?.contactClicksCount || 0)}
					</span>
					<span>опубликовано {fmtDate(item.createdAt)}</span>
				</div>
			</div>

			<div className='wk-bottombar'>
				<div className='wk-bottombar__inner'>
					{primary && <div style={{ marginBottom: 10 }}>{primary}</div>}
					{isLocked ? (
						<Button variant={primary ? 'line' : 'red'} size={primary ? 'sm' : 'md'} block onClick={onUnlock}>
							Открыть контакты · PRO
						</Button>
					) : (
						<div className='grid grid-cols-2' style={{ gap: 10 }}>
							<Button variant='wa' onClick={onWhatsApp}>
								WhatsApp
							</Button>
							<Button variant='tg' onClick={onTelegram}>
								Telegram
							</Button>
						</div>
					)}
					{note && <p className='wk-note'>{note}</p>}
				</div>
			</div>
		</div>
	)
}
