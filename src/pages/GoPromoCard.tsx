import { LocationContext } from '../../App'
import { useContext } from 'react'

export const GeoPromoCard: React.FC = () => {
	const { location, requestLocation, isDenied, openSettings } =
		useContext(LocationContext)

	if (location) return null // Если локация уже есть, не показываем

	return (
		<div
			className='wk-panel flex items-center'
			style={{ gap: 14, marginTop: 12, padding: 16 }}
		>
			<span
				className='flex items-center justify-center shrink-0'
				style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--ok-soft)', fontSize: 22 }}
			>
				📍
			</span>
			<div className='flex-1 min-w-0 text-left'>
				<div style={{ fontWeight: 700 }}>Найти работу рядом?</div>
				<div className='wk-xs'>Покажем вакансии в вашем районе</div>
			</div>
			<button
				onClick={isDenied ? openSettings : requestLocation}
				className='wk-btn wk-btn--ink wk-btn--xs shrink-0'
			>
				{isDenied ? 'Настройки' : 'Включить'}
			</button>
		</div>
	)
}
