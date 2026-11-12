// Сердечко «Сохранить вакансию» (DESIGN_SPEC 1: JobCard / вакансия [07])
import React from 'react'
import { Heart } from 'lucide-react'
import { useGetSavedIdsQuery, useToggleSavedMutation } from '../store/store'
import { getTelegramId } from '../lib/me'
import { cx, haptic } from './wk'

export const useSaved = (vacancyId: number) => {
	const tid = getTelegramId()
	const { data: ids = [] } = useGetSavedIdsQuery(tid)
	const [toggle] = useToggleSavedMutation()
	const saved = ids.includes(vacancyId)
	return {
		saved,
		toggle: () => {
			haptic.impact(saved ? 'light' : 'medium')
			toggle({ tid, vacancyId, on: !saved })
		},
	}
}

/** Сердечко на карточке: тап не открывает вакансию */
export const SaveHeart: React.FC<{ vacancyId: number; glass?: boolean }> = ({ vacancyId, glass }) => {
	const { saved, toggle } = useSaved(vacancyId)
	return (
		<button
			type='button'
			aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить'}
			aria-pressed={saved}
			className={cx('wk-heart', glass && 'wk-iconbtn wk-iconbtn--glass', saved && 'is-on')}
			onClick={(e) => {
				e.stopPropagation()
				toggle()
			}}
		>
			<Heart size={glass ? 20 : 22} strokeWidth={1.8} fill={saved ? 'var(--brand)' : 'none'} />
		</button>
	)
}
