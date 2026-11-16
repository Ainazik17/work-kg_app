// Реклама сериала на главном экране: большая обложка + «Смотреть бесплатно».
// Нет опубликованных сериалов — баннер не показываем.
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useGetSeriesListQuery } from '../../store/store'
import { haptic } from '../../ui/wk'

/** «1 серия бесплатно» / «3 серии бесплатно»; нет бесплатных — пустая строка */
export const freeEpisodesText = (n?: number) => {
	if (!n) return ''
	const m10 = n % 10
	const m100 = n % 100
	const word = m10 === 1 && m100 !== 11 ? 'серия' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'серии' : 'серий'
	return `${n} ${word} бесплатно`
}

export const SeriesPromo: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { data: list } = useGetSeriesListQuery(telegramId, { skip: !telegramId })
	const s = list?.[0]
	if (!s) return null

	return (
		<div
			className='wk-press'
			role='button'
			onClick={() => {
				haptic.impact('light')
				navigate(`/series/${s.id}`)
			}}
			style={{
				position: 'relative',
				marginTop: 16,
				borderRadius: 22,
				overflow: 'hidden',
				aspectRatio: '16/9',
				background: 'var(--ink)',
				color: '#fff',
				textAlign: 'left',
				cursor: 'pointer',
			}}
		>
			{s.coverUrl && (
				<img
					src={s.coverUrl}
					alt=''
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
				/>
			)}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(180deg, rgba(0,0,0,.05) 25%, rgba(0,0,0,.8) 100%)',
				}}
			/>
			<span
				style={{
					position: 'absolute',
					top: 12,
					left: 12,
					padding: '4px 10px',
					borderRadius: 999,
					background: 'var(--brand)',
					fontSize: 12,
					fontWeight: 700,
					letterSpacing: '.02em',
				}}
			>
				🎬 СЕРИАЛ
			</span>
			<div style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
				<div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.15 }}>{s.title}</div>
				<div className='flex items-center' style={{ gap: 10, marginTop: 10 }}>
					<span
						className='flex items-center'
						style={{
							gap: 6,
							padding: '8px 14px',
							borderRadius: 999,
							background: '#fff',
							color: 'var(--ink)',
							fontWeight: 700,
							fontSize: 14,
						}}
					>
						<Play size={14} strokeWidth={2} fill='currentColor' />
						{s.hasAccess || !s.freeEpisodesCount ? 'Смотреть' : 'Смотреть бесплатно'}
					</span>
					<span style={{ fontSize: 13, opacity: 0.85 }}>
						{s.episodesCount} сер.{!s.hasAccess && freeEpisodesText(s.freeEpisodesCount) ? ` · ${freeEpisodesText(s.freeEpisodesCount)}` : ''}
					</span>
				</div>
			</div>
		</div>
	)
}
