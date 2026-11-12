// StarInput (DESIGN_SPEC 7): пять квадратных кнопок-звёзд, тап = оценка
import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cx, haptic } from './wk'

export const StarInput: React.FC<{
	value?: number | null
	onChange: (v: number) => void
	size?: 'md' | 'sm'
	disabled?: boolean
	label?: string
}> = ({ value, onChange, size = 'md', disabled, label = 'Оценка' }) => {
	const [hover, setHover] = useState(0)
	const shown = hover || value || 0
	return (
		<div className={cx('wk-starin', size === 'sm' && 'wk-starin--sm')} role='radiogroup' aria-label={label}>
			{[1, 2, 3, 4, 5].map((i) => (
				<button
					key={i}
					type='button'
					role='radio'
					aria-checked={value === i}
					aria-label={`${i} из 5`}
					disabled={disabled}
					className={cx('wk-starin__btn', i <= shown && 'is-on')}
					onMouseEnter={() => setHover(i)}
					onMouseLeave={() => setHover(0)}
					onClick={() => {
						haptic.select()
						onChange(i)
					}}
				>
					<Star size={size === 'sm' ? 18 : 22} stroke='none' fill={i <= shown ? 'var(--star)' : '#C9C7C0'} />
				</button>
			))}
		</div>
	)
}
