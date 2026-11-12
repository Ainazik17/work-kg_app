// Компании: VerifiedTick, Rating, Stars, CompanyCardList, CompanyCardWide, сферы (DESIGN_SPEC 1, 3, 4)
import React, { useState } from 'react'
import { Star } from 'lucide-react'
import type { Company } from '../../types'
import { CHIP_SPHERES, COMPANY_SPHERES } from '../data/companySpheres'
import { Button, Chip, Cover, Logo, Sheet, cx, haptic, plural } from './wk'

export const VerifiedTick: React.FC<{ size?: number }> = ({ size = 18 }) => (
	<svg
		className='wk-tick'
		width={size}
		height={size}
		viewBox='0 0 24 24'
		aria-label='Проверенная компания'
		role='img'
	>
		<circle cx='12' cy='12' r='11' fill='var(--tick)' />
		<path
			d='M7.5 12.3l3 3 6-6.3'
			fill='none'
			stroke='#fff'
			strokeWidth='2.4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const fmtRating = (r: number) => r.toFixed(1)

/** ★ 4.8 (64) */
export const Rating: React.FC<{
	value: number | null
	count?: number
	long?: boolean
	size?: number
}> = ({ value, count, long, size = 15 }) =>
	value == null ? (
		<span className='wk-rating is-empty'>нет отзывов</span>
	) : (
		<span className='wk-rating' style={{ fontSize: size }}>
			<Star size={size + 1} fill='var(--star)' stroke='none' />
			<b>{fmtRating(value)}</b>
			{count != null && count > 0 && (
				<span className='wk-rating__count'>
					({count}
					{long ? ` ${plural(count, ['отзыв', 'отзыва', 'отзывов'])}` : ''})
				</span>
			)}
		</span>
	)

export const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 16 }) => (
	<span className='wk-stars' aria-label={`${value} из 5`}>
		{[1, 2, 3, 4, 5].map((i) => (
			<Star
				key={i}
				size={size}
				stroke='none'
				fill={i <= Math.round(value) ? 'var(--star)' : '#DDD'}
			/>
		))}
	</span>
)

export const vacanciesText = (n: number) =>
	n > 0 ? `${n} ${plural(n, ['вакансия', 'вакансии', 'вакансий'])}` : 'Нет открытых вакансий'

export const CompanyName: React.FC<{ c: Pick<Company, 'name' | 'verified'>; size?: number }> = ({
	c,
	size = 18,
}) => (
	<span className='wk-coname'>
		<span className='truncate'>{c.name}</span>
		{c.verified && <VerifiedTick size={Math.round(size * 0.95)} />}
	</span>
)

/** Карточка в списке «Компании» [04] */
export const CompanyCardList: React.FC<{ c: Company; onClick: () => void }> = ({ c, onClick }) => (
	<div className='wk-co wk-press' onClick={onClick} role='link' tabIndex={0}>
		<Cover name={c.name} src={c.coverUrl} height={84} safeArea={false} className='wk-co__cover' />
		<div className='wk-co__body'>
			<Logo name={c.name} size={50} className='wk-co__logo' />
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<div style={{ fontSize: 18, fontWeight: 600 }}>
						<CompanyName c={c} />
					</div>
					{c.type && <div className='wk-co__type truncate'>{c.type}</div>}
				</div>
				<Rating value={c.rating} count={c.reviewsCount} />
			</div>
			<div className='wk-co__foot'>
				<span>{vacanciesText(c.vacanciesCount)}</span>
				{c.paidOnTimePct != null && (
					<span>
						Платит вовремя <b>{c.paidOnTimePct}%</b>
					</span>
				)}
			</div>
		</div>
	</div>
)

/** Широкая карточка «Топ работодатели» на Главной [01] */
export const CompanyCardWide: React.FC<{ c: Company; onClick: () => void }> = ({ c, onClick }) => (
	<div className='wk-cowide wk-press' onClick={onClick} role='link' tabIndex={0}>
		<Cover name={c.name} src={c.coverUrl} height={150} safeArea={false}>
			<span />
		</Cover>
		<div className='wk-cowide__over'>
			<span className='wk-cowide__count'>{vacanciesText(c.vacanciesCount)}</span>
			{c.tagline && <span className='wk-cowide__quote wk-clamp2'>«{c.tagline}»</span>}
		</div>
		<div className='wk-cowide__body'>
			<Logo name={c.name} size={44} />
			<div className='flex-1 min-w-0'>
				<div style={{ fontSize: 16, fontWeight: 600 }}>
					<CompanyName c={c} size={16} />
				</div>
				{c.type && <div className='wk-xs wk-clamp2'>{c.type}</div>}
			</div>
			<Rating value={c.rating} />
		</div>
	</div>
)

/** Ряд сфер: «Все», первые 7, выбранная из «Ещё», «Ещё N ›» + лист «Все сферы» [03] */
export const SphereChips: React.FC<{
	value: string | null
	onChange: (v: string | null) => void
	counts?: Record<string, number>
}> = ({ value, onChange, counts = {} }) => {
	const [open, setOpen] = useState(false)
	const extra = value && !CHIP_SPHERES.includes(value as any) ? value : null
	const rest = COMPANY_SPHERES.length - CHIP_SPHERES.length
	const pick = (v: string | null) => {
		haptic.select()
		onChange(v)
	}
	return (
		<>
			<div className='wk-chiprow' style={{ marginTop: 16 }}>
				<Chip active={!value} onClick={() => pick(null)}>
					Все
				</Chip>
				{CHIP_SPHERES.map((s) => (
					<Chip key={s} active={value === s} onClick={() => pick(value === s ? null : s)}>
						{s}
					</Chip>
				))}
				{extra && (
					<Chip active onClick={() => pick(null)}>
						{extra}
					</Chip>
				)}
				<Chip onClick={() => setOpen(true)}>Ещё {rest} ›</Chip>
			</div>
			<Sheet open={open} onClose={() => setOpen(false)} title='Все сферы' subtitle='Где хотите работать?'>
				<div className='wk-spheres'>
					{COMPANY_SPHERES.map((s) => (
						<button
							key={s}
							type='button'
							className={cx('wk-spheres__item', value === s && 'is-active')}
							onClick={() => {
								pick(s)
								setOpen(false)
							}}
						>
							<span>{s}</span>
							{counts[s] ? <span className='wk-xs'>{counts[s]}</span> : null}
						</button>
					))}
				</div>
				<Button
					variant='line'
					block
					style={{ marginTop: 16 }}
					onClick={() => {
						pick(null)
						setOpen(false)
					}}
				>
					Показать все
				</Button>
			</Sheet>
		</>
	)
}

/** «Надёжные заказчики» на «Подработке»: та же широкая карточка, счётчик — задания */
export const GigCustomerCard: React.FC<{
	c: { name: string; verified: boolean; coverUrl?: string | null; type: string; gigsCount: number; openGigs: unknown[]; rating?: number | null }
	onClick: () => void
}> = ({ c, onClick }) => (
	<div className='wk-cowide wk-press' onClick={onClick} role='link' tabIndex={0}>
		<Cover name={c.name} src={c.coverUrl} height={150} safeArea={false}>
			<span />
		</Cover>
		<div className='wk-cowide__over'>
			<span className='wk-cowide__count'>
				{c.openGigs.length > 0
					? `⚡ ${c.openGigs.length} ${plural(c.openGigs.length, ['задание', 'задания', 'заданий'])} сейчас`
					: 'Сейчас заданий нет'}
			</span>
			<span className='wk-cowide__quote'>
				{c.gigsCount} {plural(c.gigsCount, ['подработка', 'подработки', 'подработок'])} за 3 месяца
			</span>
		</div>
		<div className='wk-cowide__body'>
			<Logo name={c.name} size={44} />
			<div className='flex-1 min-w-0'>
				<div style={{ fontSize: 16, fontWeight: 600 }}>
					<CompanyName c={c} size={16} />
				</div>
				<div className='wk-xs wk-clamp2'>{c.type}</div>
			</div>
			{c.rating != null && <Rating value={c.rating} />}
		</div>
	</div>
)
