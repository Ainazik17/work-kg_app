// Резюме → «Где работали»: до 5 мест (место, должность, срок). Работодатель видит это в отклике.
import React from 'react'
import { Plus, X } from 'lucide-react'
import type { WorkPlace } from '../../../types'
import { Chip } from '../../ui/wk'

const MAX = 5
const PERIODS = ['до 3 мес.', '3–6 мес.', 'полгода', '1 год', '2 года', '3+ года']

export const cleanWorkPlaces = (v?: WorkPlace[]) =>
	(v || [])
		.map((w) => ({
			place: (w.place || '').trim(),
			role: (w.role || '').trim() || undefined,
			period: (w.period || '').trim() || undefined,
		}))
		.filter((w) => w.place.length > 0)

export const WorkPlacesField: React.FC<{
	value: WorkPlace[]
	onChange: (v: WorkPlace[]) => void
}> = ({ value, onChange }) => {
	const rows = value || []
	const patch = (i: number, p: Partial<WorkPlace>) =>
		onChange(rows.map((r, j) => (j === i ? { ...r, ...p } : r)))
	return (
		<div>
			{rows.map((r, i) => (
				<div key={i} className='wk-panel' style={{ padding: 14, marginBottom: 10, position: 'relative' }}>
					<button
						type='button'
						aria-label='Убрать место работы'
						onClick={() => onChange(rows.filter((_, j) => j !== i))}
						style={{ position: 'absolute', top: 12, right: 12, color: 'var(--muted)' }}
					>
						<X size={18} strokeWidth={2} />
					</button>
					<input
						className='wk-input'
						value={r.place}
						maxLength={120}
						onChange={(e) => patch(i, { place: e.target.value })}
						placeholder='Где: Navat, кафе «Арзу», ЦУМ'
						style={{ width: 'calc(100% - 28px)' }}
					/>
					<input
						className='wk-input'
						value={r.role || ''}
						maxLength={120}
						onChange={(e) => patch(i, { role: e.target.value })}
						placeholder='Кем: официант, кассир'
						style={{ marginTop: 8 }}
					/>
					<div className='wk-chipwrap' style={{ marginTop: 10 }}>
						{PERIODS.map((p) => (
							<Chip
								key={p}
								active={r.period === p}
								onClick={() => patch(i, { period: r.period === p ? '' : p })}
							>
								{p}
							</Chip>
						))}
					</div>
				</div>
			))}
			{rows.length < MAX && (
				<button
					type='button'
					className='wk-chip wk-chip--dashed'
					onClick={() => onChange([...rows, { place: '', role: '', period: '' }])}
				>
					<Plus size={16} strokeWidth={2} /> {rows.length ? 'Ещё место' : 'Добавить место работы'}
				</button>
			)}
		</div>
	)
}
