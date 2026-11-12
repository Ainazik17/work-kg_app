// ProfessionPicker (DESIGN_SPEC 6.5) [09] [10] [21]
import React, { useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { POPULAR_PROFESSIONS, PROFESSIONS } from '../data/professions'
import { Chip, cx, haptic } from './wk'

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').trim()
const capitalize = (s: string) => {
	const t = s.trim().replace(/\s+/g, ' ')
	return t ? t[0].toUpperCase() + t.slice(1) : t
}

type Item = { name: string; sphere: string; hay: string }
const ALL: Item[] = PROFESSIONS.flatMap((s) =>
	s.items.map((p) => ({
		name: p.name,
		sphere: s.sphere,
		hay: norm(`${p.name} ${s.sphere} ${p.keywords}`),
	})),
)
const sphereOf = (name: string) =>
	ALL.find((i) => norm(i.name) === norm(name))?.sphere

export const ProfessionPicker: React.FC<{
	value: string[]
	onChange: (v: string[]) => void
	/** 1 — single-режим */
	max?: number
	placeholder?: string
	error?: boolean
	/** Превышен max — показать тост «Можно выбрать до N» */
	onLimit?: (max: number) => void
}> = ({ value, onChange, max = 5, placeholder = 'Поиск профессии', error, onLimit }) => {
	const [query, setQuery] = useState('')
	const [sphere, setSphere] = useState<string | null>(null)
	const single = max === 1
	const picked = useMemo(() => new Set(value.map(norm)), [value])
	// Последнее значение: два быстрых тапа подряд не должны затирать друг друга
	const latest = useRef(value)
	latest.current = value
	const commit = (next: string[]) => {
		latest.current = next
		onChange(next)
	}

	const toggle = (raw: string) => {
		const name = capitalize(raw)
		if (!name) return
		haptic.select()
		const cur = latest.current
		if (cur.some((v) => norm(v) === norm(name))) {
			commit(cur.filter((v) => norm(v) !== norm(name)))
			return
		}
		if (single) {
			commit([name])
			setQuery('')
			return
		}
		if (cur.length >= max) {
			onLimit?.(max)
			return
		}
		commit([...cur, name])
		setQuery('')
	}

	const q = norm(query)
	const matches = useMemo(() => {
		if (!q) return []
		const words = q.split(/\s+/)
		return ALL.filter((i) => words.every((w) => i.hay.includes(w))).slice(0, 10)
	}, [q])
	const exact = matches.some((m) => norm(m.name) === q)

	const chip = (name: string) => {
		const on = picked.has(norm(name))
		return (
			<Chip key={name} active={on} onClick={() => toggle(name)}>
				{on ? `✓ ${name}` : name}
			</Chip>
		)
	}

	const hideSuggestions = single && value.length > 0 && !q

	return (
		<div>
			{value.length > 0 && (
				<div className='wk-chipwrap items-center' style={{ marginBottom: 10 }}>
					{value.map((v) => (
						<Chip key={v} active onClick={() => toggle(v)} aria-label={`Убрать ${v}`}>
							{v} <span className='wk-chip__x'>×</span>
						</Chip>
					))}
					{!single && (
						<span className='wk-xs'>
							{value.length} из {max}
						</span>
					)}
				</div>
			)}

			<label
				className={cx('wk-input flex items-center gap-2.5', error && 'is-error')}
				style={{ height: 54, padding: '0 15px' }}
			>
				<Search size={20} strokeWidth={1.8} style={{ color: 'var(--muted)', flexShrink: 0 }} />
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							if (!q) return
							// Enter: точное совпадение → единственная подсказка → своя профессия
							const hit =
								matches.find((m) => norm(m.name) === q) ||
								(matches.length === 1 ? matches[0] : undefined)
							toggle(hit ? hit.name : query)
						}
					}}
					placeholder={placeholder}
					className='flex-1 min-w-0 bg-transparent outline-none'
					style={{ fontSize: 16 }}
				/>
			</label>

			{hideSuggestions ? null : q ? (
				<div style={{ marginTop: 12 }}>
					<div className='wk-chipwrap'>
						{matches.map((m) => chip(m.name))}
						{!exact && (
							<button
								type='button'
								className='wk-chip wk-chip--dashed'
								onClick={() => toggle(query)}
							>
								＋ Добавить «{capitalize(query)}»
							</button>
						)}
					</div>
					{matches.length === 0 && (
						<p className='wk-xs' style={{ marginTop: 10 }}>
							Такой профессии нет в списке — добавьте свою, работодатели найдут её
							через поиск
						</p>
					)}
				</div>
			) : sphere ? (
				<div>
					<div className='flex items-center gap-3' style={{ margin: '14px 0 10px' }}>
						<button type='button' className='wk-picker__back' onClick={() => setSphere(null)}>
							← Все сферы
						</button>
						<span style={{ fontSize: 14, fontWeight: 700 }}>{sphere}</span>
					</div>
					<div className='wk-chipwrap'>
						{PROFESSIONS.find((s) => s.sphere === sphere)?.items.map((p) => chip(p.name))}
					</div>
				</div>
			) : (
				<div>
					<div className='wk-picker__label'>Популярное</div>
					<div className='wk-chipwrap'>{POPULAR_PROFESSIONS.map(chip)}</div>
					<div className='wk-picker__label'>Все сферы</div>
					<div className='wk-picker__grid'>
						{PROFESSIONS.map((s) => {
							const n = value.filter((v) => sphereOf(v) === s.sphere).length
							return (
								<button
									type='button'
									key={s.sphere}
									className={cx('wk-picker__sphere', n > 0 && 'is-picked')}
									onClick={() => {
										haptic.select()
										setSphere(s.sphere)
									}}
								>
									<span>{s.sphere}</span>
									<span className='wk-picker__count'>
										{n > 0 ? `✓ ${n}` : s.items.length}
									</span>
								</button>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
