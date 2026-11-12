// Work KG — базовые компоненты дизайна (design/DESIGN_SPEC.md, раздел 1).
// Только вёрстка: данные и логика остаются в страницах.
import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const tg = (window as any).Telegram?.WebApp

export const cx = (...c: (string | false | null | undefined)[]) =>
	c.filter(Boolean).join(' ')

export const haptic = {
	impact: (s: 'light' | 'medium' | 'heavy' = 'light') =>
		tg?.HapticFeedback?.impactOccurred(s),
	select: () => tg?.HapticFeedback?.selectionChanged(),
	notify: (t: 'success' | 'warning' | 'error') =>
		tg?.HapticFeedback?.notificationOccurred(t),
}

// Фирменные градиенты логотипов/обложек из design/src-types.ts
const BRAND_GRADIENTS: [string, string][] = [
	['#2A0A09', '#B4161B'],
	['#1E130C', '#9A6A43'],
	['#0B1626', '#2F5F8F'],
	['#0F0F14', '#4F46E5'],
	['#052E22', '#0E9F6E'],
	['#1F1235', '#7C3AED'],
	['#062A30', '#0891B2'],
]

export const gradientFor = (seed?: string | number | null) => {
	const s = String(seed ?? '')
	let h = 0
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
	const [a, b] = BRAND_GRADIENTS[h % BRAND_GRADIENTS.length]
	return `linear-gradient(140deg, ${a}, ${b})`
}

/** Обложка без фото: блик цвета2 справа сверху + линейный 140° (styleguide «Обложка без фото») */
export const coverGradientFor = (seed?: string | number | null) => {
	const s = String(seed ?? '')
	let h = 0
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
	const [a, b] = BRAND_GRADIENTS[h % BRAND_GRADIENTS.length]
	return `radial-gradient(120% 90% at 100% 0%, ${b}, transparent 60%), linear-gradient(140deg, ${a}, ${b})`
}

export const initials = (name?: string | null, max = 2) => {
	const words = String(name || '')
		.replace(/[«»"'()]/g, '')
		.trim()
		.split(/\s+/)
		.filter(Boolean)
	if (!words.length) return 'W'
	if (words.length === 1) return words[0].slice(0, max).toUpperCase()
	return words
		.slice(0, max)
		.map((w) => w[0])
		.join('')
		.toUpperCase()
}

/** 35000 → «35 000» */
export const fmtNum = (n: number | string | null | undefined) => {
	const v = Number(n)
	if (!isFinite(v)) return String(n ?? '')
	return Math.round(v)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** 62.5 → «62,50» */
export const fmtMoney = (n: number | string) =>
	Number(n || 0)
		.toFixed(2)
		.replace('.', ',')
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** plural(5, ['год','года','лет']) → «лет» */
export const plural = (n: number, forms: [string, string, string]) => {
	const a = Math.abs(n) % 100
	const b = a % 10
	if (a > 10 && a < 20) return forms[2]
	if (b > 1 && b < 5) return forms[1]
	if (b === 1) return forms[0]
	return forms[2]
}

export const yearsText = (n?: number | null) => {
	const v = Number(n || 0)
	if (!v) return 'Без опыта'
	return `от ${v} ${plural(v, ['года', 'лет', 'лет'])}`
}

// ---------- Logo / Avatar ----------
export const Logo: React.FC<{
	name?: string | null
	size?: number
	src?: string | null
	radius?: number
	className?: string
	style?: React.CSSProperties
	onClick?: () => void
}> = ({ name, size = 48, src, radius, className, style, onClick }) => (
	<div
		onClick={onClick}
		className={cx('wk-logo', className)}
		style={{
			width: size,
			height: size,
			fontSize: Math.round(size / 3),
			borderRadius: radius ?? (size >= 68 ? 22 : 16),
			background: gradientFor(name),
			...style,
		}}
	>
		{src ? <img src={src} alt='' /> : initials(name)}
	</div>
)

export const Avatar: React.FC<{
	name?: string | null
	size?: number
	src?: string | null
	onClick?: () => void
}> = ({ name, size = 42, src, onClick }) => (
	<div
		className='wk-avatar'
		onClick={onClick}
		style={{
			width: size,
			height: size,
			fontSize: Math.round(size * 0.39),
			cursor: onClick ? 'pointer' : undefined,
		}}
	>
		{src ? <img src={src} alt='' /> : initials(name, 1)}
	</div>
)

// ---------- Buttons ----------
type BtnVariant = 'red' | 'ink' | 'line' | 'white' | 'wa' | 'tg' | 'soft'
export const Button: React.FC<
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		variant?: BtnVariant
		size?: 'md' | 'sm' | 'xs'
		block?: boolean
		loading?: boolean
	}
> = ({
	variant = 'ink',
	size = 'md',
	block,
	loading,
	className,
	children,
	disabled,
	...rest
}) => (
	<button
		{...rest}
		disabled={disabled || loading}
		aria-busy={loading || undefined}
		className={cx(
			'wk-btn',
			`wk-btn--${variant}`,
			size !== 'md' && `wk-btn--${size}`,
			block && 'wk-btn--block',
			className,
		)}
		style={loading ? { opacity: 1, ...rest.style } : rest.style}
	>
		{loading ? <span className='wk-spinner' /> : children}
	</button>
)

export const IconButton: React.FC<
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		glass?: boolean
		dot?: boolean
		label: string
	}
> = ({ glass, dot, label, className, children, ...rest }) => (
	<button
		type='button'
		aria-label={label}
		{...rest}
		className={cx('wk-iconbtn', glass && 'wk-iconbtn--glass', className)}
	>
		{children}
		{dot && <span className='wk-iconbtn__dot' />}
	</button>
)

export const BackButton: React.FC<{
	onClick: () => void
	glass?: boolean
}> = ({ onClick, glass }) => (
	<IconButton
		label='Назад'
		glass={glass}
		onClick={() => {
			haptic.impact('light')
			onClick()
		}}
	>
		<ChevronLeft size={22} strokeWidth={1.8} />
	</IconButton>
)

/** Шапка внутренних экранов: круглая «назад» + h2 (+ подзаголовок) */
export const ScreenHeader: React.FC<{
	title: string
	subtitle?: React.ReactNode
	onBack?: () => void
	right?: React.ReactNode
}> = ({ title, subtitle, onBack, right }) => (
	<div style={{ marginBottom: subtitle ? 22 : 18 }}>
		<div className='flex items-center gap-3'>
			{onBack && <BackButton onClick={onBack} />}
			<h2 className='wk-h2 flex-1 min-w-0'>{title}</h2>
			{right}
		</div>
		{subtitle && (
			<p className='wk-sub text-left' style={{ marginTop: 12 }}>
				{subtitle}
			</p>
		)}
	</div>
)

// ---------- Tabs / Chips / Segmented ----------
export function Tabs<T extends string>({
	items,
	value,
	onChange,
	className,
}: {
	items: { value: T; label: React.ReactNode }[]
	value: T
	onChange: (v: T) => void
	className?: string
}) {
	return (
		<div className={cx('wk-tabs', className)} role='tablist'>
			{items.map((it) => (
				<button
					key={it.value}
					role='tab'
					aria-selected={it.value === value}
					className={cx('wk-tab', it.value === value && 'is-active')}
					onClick={() => {
						haptic.select()
						onChange(it.value)
					}}
				>
					{it.label}
				</button>
			))}
		</div>
	)
}

export const Chip: React.FC<
	React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
> = ({ active, className, children, ...rest }) => (
	<button
		type='button'
		aria-pressed={active}
		{...rest}
		className={cx('wk-chip', active && 'is-active', className)}
	>
		{children}
	</button>
)

export function Segmented<T extends string | number>({
	options,
	value,
	onChange,
}: {
	options: { value: T; label: React.ReactNode }[]
	value: T
	onChange: (v: T) => void
}) {
	return (
		<div className='wk-seg' role='radiogroup'>
			{options.map((o) => (
				<button
					type='button'
					key={String(o.value)}
					role='radio'
					aria-checked={o.value === value}
					className={cx('wk-seg__item', o.value === value && 'is-active')}
					onClick={() => {
						haptic.select()
						onChange(o.value)
					}}
				>
					{o.label}
				</button>
			))}
		</div>
	)
}

// ---------- Section / Panel / Empty ----------
export const SectionHead: React.FC<{
	title: React.ReactNode
	right?: React.ReactNode
	onRight?: () => void
	first?: boolean
}> = ({ title, right, onRight, first }) => (
	<div className='wk-section' style={first ? { marginTop: 0 } : undefined}>
		<h2 className='wk-h2'>{title}</h2>
		{right != null &&
			(onRight ? (
				<button className='wk-section__more' onClick={onRight}>
					{right}
				</button>
			) : (
				<span className='wk-section__more'>{right}</span>
			))}
	</div>
)

export const Panel: React.FC<
	React.HTMLAttributes<HTMLDivElement> & { press?: boolean }
> = ({ press, className, ...rest }) => (
	<div {...rest} className={cx('wk-panel', press && 'wk-press', className)} />
)

export const EmptyState: React.FC<{
	emoji?: string
	title: string
	text?: string
	action?: React.ReactNode
}> = ({ emoji = '🗂', title, text, action }) => (
	<div className='wk-panel wk-empty'>
		<div className='wk-empty__emoji'>{emoji}</div>
		<div className='wk-empty__title'>{title}</div>
		{text && <div className='wk-empty__text'>{text}</div>}
		{action && <div style={{ marginTop: 14 }}>{action}</div>}
	</div>
)

export const Skeleton: React.FC<{ height: number; radius?: number }> = ({
	height,
	radius,
}) => <div className='wk-skel' style={{ height, borderRadius: radius }} />

export const Loader: React.FC = () => (
	<div className='wk-loader'>
		<span className='wk-spinner wk-spinner--lg' />
	</div>
)

// ---------- Info blocks ----------
export const FactTiles: React.FC<{
	items: { label: string; value: React.ReactNode }[]
}> = ({ items }) => (
	<div className='wk-facts'>
		{items.map((f) => (
			<div className='wk-fact' key={f.label}>
				<div className='wk-fact__label'>{f.label}</div>
				<div className='wk-fact__value'>{f.value}</div>
			</div>
		))}
	</div>
)

export const StatsBlock: React.FC<{
	items: { value: React.ReactNode; label: string; onClick?: () => void }[]
}> = ({ items }) => (
	<div className='wk-stats'>
		{items.map((s) => (
			<div
				key={s.label}
				className={cx('wk-stats__cell', s.onClick && 'wk-press')}
				onClick={s.onClick}
			>
				<div className='wk-stats__num'>{s.value}</div>
				<div className='wk-stats__label'>{s.label}</div>
			</div>
		))}
	</div>
)

export const Perk: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => <span className='wk-perk'>{children}</span>

export const StatusPill: React.FC<{
	tone: 'warn' | 'gig' | 'brand' | 'muted' | 'ok'
	children: React.ReactNode
}> = ({ tone, children }) => (
	<span className={`wk-pill wk-pill--${tone}`}>{children}</span>
)

// ---------- Menu ----------
export const MenuList: React.FC<{
	items: {
		icon: React.ReactNode
		label: string
		value?: React.ReactNode
		valueOk?: boolean
		onClick?: () => void
	}[]
}> = ({ items }) => (
	<div className='wk-menu'>
		{items.map((it) => (
			<button
				key={it.label}
				className='wk-menu__item'
				onClick={() => {
					haptic.select()
					it.onClick?.()
				}}
			>
				<span className='flex' style={{ color: 'var(--ink)' }}>
					{it.icon}
				</span>
				<span className='wk-menu__label'>{it.label}</span>
				{it.value != null && (
					<span
						className={cx(
							'wk-menu__value',
							it.valueOk && 'wk-menu__value--ok',
						)}
					>
						{it.value}
					</span>
				)}
				<ChevronRight
					size={18}
					strokeWidth={1.8}
					style={{ color: 'var(--ink2)' }}
				/>
			</button>
		))}
	</div>
)

// ---------- Bottom sheet ----------
export const Sheet: React.FC<{
	open: boolean
	onClose: () => void
	title?: React.ReactNode
	subtitle?: React.ReactNode
	children: React.ReactNode
}> = ({ open, onClose, title, subtitle, children }) => {
	const startY = useRef<number | null>(null)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
		window.addEventListener('keydown', onKey)
		ref.current?.focus()
		return () => window.removeEventListener('keydown', onKey)
	}, [open, onClose])

	if (!open) return null
	return (
		<div className='wk-sheet-wrap'>
			<div className='wk-sheet-backdrop' onClick={onClose} />
			<div
				ref={ref}
				tabIndex={-1}
				role='dialog'
				aria-modal='true'
				className='wk-sheet'
				onTouchStart={(e) => {
					if ((ref.current?.scrollTop || 0) <= 0)
						startY.current = e.touches[0].clientY
				}}
				onTouchEnd={(e) => {
					if (startY.current == null) return
					if (e.changedTouches[0].clientY - startY.current > 80) onClose()
					startY.current = null
				}}
			>
				<div className='wk-sheet__handle' />
				{title && <h2 className='wk-h2 wk-sheet__title'>{title}</h2>}
				{subtitle && <p className='wk-sheet__sub'>{subtitle}</p>}
				{!subtitle && title && <div style={{ height: 12 }} />}
				{children}
			</div>
		</div>
	)
}

export const SheetOption: React.FC<{
	icon: React.ReactNode
	iconBg?: string
	iconColor?: string
	title: React.ReactNode
	subtitle?: React.ReactNode
	right?: React.ReactNode
	selected?: boolean
	disabled?: boolean
	onClick?: () => void
}> = ({
	icon,
	iconBg = 'var(--track)',
	iconColor = 'var(--ink)',
	title,
	subtitle,
	right,
	selected,
	disabled,
	onClick,
}) => (
	<button
		type='button'
		disabled={disabled}
		className={cx('wk-option', selected && 'is-selected')}
		style={disabled ? { opacity: 0.4 } : undefined}
		onClick={() => {
			haptic.impact('light')
			onClick?.()
		}}
	>
		<span
			className='wk-option__icon'
			style={{ background: iconBg, color: iconColor }}
		>
			{icon}
		</span>
		<span className='flex-1 min-w-0'>
			<span className='wk-option__title block'>{title}</span>
			{subtitle && <span className='wk-option__sub block'>{subtitle}</span>}
		</span>
		{right}
	</button>
)

// ---------- Cover ----------
export const Cover: React.FC<{
	name?: string | null
	src?: string | null
	height: number
	children?: React.ReactNode
	/** false — обложка внутри карточки: без отступа под safe area */
	safeArea?: boolean
	className?: string
}> = ({ name, src, height, children, safeArea = true, className }) => (
	<div
		className={cx('wk-cover', className)}
		style={{
			height: safeArea ? `calc(${height}px + var(--sat, 0px))` : height,
			background: coverGradientFor(name),
		}}
	>
		{src ? (
			<img
				className='wk-cover__img'
				src={src}
				alt=''
				onError={(e) => ((e.currentTarget.style.display = 'none'))}
			/>
		) : (
			<span className='wk-cover__letter'>{initials(name)}</span>
		)}
		<div className='wk-cover__shade' />
		<div className='wk-cover__bar'>{children}</div>
	</div>
)

// ---------- JobCard ----------
export const JobCard = React.forwardRef<
	HTMLDivElement,
	{
		title: string
		company?: React.ReactNode
		logoName?: string | null
		logoSrc?: string | null
		avatar?: boolean
		salary?: React.ReactNode
		meta?: React.ReactNode[]
		badge?: React.ReactNode
		right?: React.ReactNode
		onClick?: () => void
	}
>(
	(
		{ title, company, logoName, logoSrc, avatar, salary, meta, badge, right, onClick },
		ref,
	) => {
		const parts = (meta || []).filter(
			(m) => m !== null && m !== undefined && m !== false && m !== '',
		)
		return (
			<div ref={ref} className='wk-job wk-press' onClick={onClick}>
				<div className='wk-job__row'>
					{avatar ? (
						<Avatar name={logoName} src={logoSrc} size={48} />
					) : (
						<Logo name={logoName} src={logoSrc} size={48} />
					)}
					<div className='flex-1 min-w-0'>
						<div className='wk-job__title wk-clamp2'>{title}</div>
						{company && <div className='wk-job__company'>{company}</div>}
					</div>
					{right ?? badge}
				</div>
				{salary && <div className='wk-job__salary'>{salary}</div>}
				{parts.length > 0 && (
					<div className='wk-job__meta'>
						{parts.map((m, i) => (
							<React.Fragment key={i}>
								{i > 0 && <span>&nbsp;·&nbsp;</span>}
								{m}
							</React.Fragment>
						))}
					</div>
				)}
			</div>
		)
	},
)

/** Текстовое поле с подписью/подсказкой/ошибкой */
export const Field: React.FC<{
	label?: React.ReactNode
	hint?: React.ReactNode
	error?: React.ReactNode
	children: React.ReactNode
	className?: string
}> = ({ label, hint, error, children, className }) => (
	<div className={cx('wk-field', className)}>
		{label && <label className='wk-label'>{label}</label>}
		{children}
		{error ? (
			<p className='wk-error'>{error}</p>
		) : hint ? (
			<p className='wk-hint'>{hint}</p>
		) : null}
	</div>
)

// ---------- Toggle ----------
export const Toggle: React.FC<{
	checked: boolean
	onChange: (v: boolean) => void
	label: React.ReactNode
	hint?: React.ReactNode
}> = ({ checked, onChange, label, hint }) => (
	<button
		type='button'
		role='switch'
		aria-checked={checked}
		className={cx('wk-toggle', checked && 'is-on')}
		onClick={() => {
			haptic.select()
			onChange(!checked)
		}}
	>
		<span className='flex-1 min-w-0'>
			<span className='block' style={{ fontWeight: 600 }}>
				{label}
			</span>
			{hint && <span className='wk-xs block'>{hint}</span>}
		</span>
		<span className='wk-toggle__track'>
			<span className='wk-toggle__knob' />
		</span>
	</button>
)

// ---------- Подработка: форматирование ----------
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

/** 'YYYY-MM-DD' локальной датой (без сдвига UTC) */
export const isoDate = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** «Сегодня» / «Завтра» / «Сб» */
export const gigDayLabel = (workDate: string) => {
	const today = new Date()
	const tomorrow = new Date()
	tomorrow.setDate(today.getDate() + 1)
	if (workDate === isoDate(today)) return 'Сегодня'
	if (workDate === isoDate(tomorrow)) return 'Завтра'
	const [y, m, d] = workDate.split('-').map(Number)
	return WEEKDAYS[new Date(y, m - 1, d).getDay()]
}

/** Время из «15:00, примерно 3 часа» → «15:00» */
export const gigTime = (timeText?: string) =>
	(timeText || '').match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/)?.[0]?.replace('.', ':') || '—'

export const payText = (
	amount: number,
	unit?: 'TOTAL' | 'HOUR' | 'SHIFT' | 'VISIT',
) =>
	`${fmtNum(amount)} сом${unit === 'HOUR' ? ' / час' : unit === 'SHIFT' ? ' / смена' : unit === 'VISIT' ? ' / выезд' : ''}`

export const distanceText = (km?: number | null) =>
	km == null ? null : `${String(Number(km).toFixed(1)).replace('.', ',')} км`

// ---------- GigRow ----------
export const GigRow: React.FC<{
	time: string
	day: string
	title: string
	sub?: React.ReactNode
	pay: React.ReactNode
	urgent?: boolean
	onClick?: () => void
}> = ({ time, day, title, sub, pay, urgent, onClick }) => (
	<button type='button' className='wk-gig wk-press' onClick={onClick}>
		<span className='wk-gig__time'>
			<b>{time}</b>
			<span>{day}</span>
		</span>
		<span className='flex-1 min-w-0'>
			<span className='wk-h3 wk-clamp2 block'>
				{urgent && <span style={{ color: 'var(--gig)' }}>⚡ </span>}
				{title}
			</span>
			{sub && (
				<span className='wk-xs block' style={{ marginTop: 2 }}>
					{sub}
				</span>
			)}
		</span>
		<span className='wk-gig__pay'>{pay}</span>
	</button>
)
