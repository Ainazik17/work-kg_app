import React, { useContext, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
	useGetResumeDetailQuery,
	useGetVacancyDetailQuery,
	useGetResumeStatsQuery,
	useGetVacancyStatsQuery,
	useTrackContactClickMutation,
} from '../../src/store/store'
import { DetailRow, LocationContext, MediaViewer, useToast } from '../../App'
import { Media, Vacancy, Resume } from '../../types'
import { ListingView } from '../ui/ListingView'
import { Loader, SheetOption } from '../ui/wk'
import { ChevronRight } from 'lucide-react'

const tg = (window as any).Telegram?.WebApp

export const ProfileDetail: React.FC<{ telegramId: number }> = ({
	telegramId,
}) => {
	const location = useLocation()
	const navigate = useNavigate()
	const { type, data } = location.state || {}
	const { showToast } = useToast()
	const { location: userLocation } = useContext(LocationContext)

	const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

	// --- RTK QUERY ---
	const { data: newData, isLoading: itemLoading } =
		type === 'worker'
			? useGetResumeDetailQuery(
					{ id: data?.id, tid: telegramId, isProfile: true },
					{ skip: !data?.id },
				)
			: useGetVacancyDetailQuery(
					{ id: data?.id, tid: telegramId, isProfile: true },
					{ skip: !data?.id },
				)

	let item: any = newData
	const { data: stats } =
		type === 'worker'
			? useGetResumeStatsQuery(data?.id, { skip: !data?.id })
			: useGetVacancyStatsQuery(data?.id, { skip: !data?.id })

	const [trackContactClick] = useTrackContactClickMutation()

	const isJob = type === 'job' || type === 'vac'
	const vacancy = isJob ? (item as Vacancy) : null
	const resume = !isJob ? (item as Resume) : null

	const handleContactClick = (platform: 'whatsapp' | 'telegram') => {
		if (!item) return
		trackContactClick({
			type: isJob ? 'job' : 'worker',
			id: item.id,
			tid: telegramId,
		})
		showToast(`Переходим в ${platform}...`, 'success')

		const phoneRaw = (item as any).phone || ''
		const phone = phoneRaw.replace(/\D/g, '')

		if (platform === 'whatsapp') {
			const url = `https://wa.me/${phone}`
			if (tg) tg.openLink(url, { try_instant_view: false })
			else window.open(url, '_blank')
		} else {
			let username = item.telegramUsername || (item as any).userName || ''
			username = username.replace(/^@/, '')
			const url = `https://t.me/${username}`
			if (tg) tg.openTelegramLink(url)
			else window.open(url, '_blank')
		}
	}

	const open2GISRoute = () => {
		if (!item?.address) return
		const fullAddress = `${item.cityName}, ${item.address}`.trim()
		const encodedAddress = encodeURIComponent(fullAddress)
		let url = `https://2gis.kg/search/${encodedAddress}`
		if (userLocation?.lat && userLocation?.lng)
			url += `?m=${userLocation.lng},${userLocation.lat}%2F15`
		if (tg) tg.openLink(url)
		else window.open(url, '_blank')
	}

	const isLocked = useMemo(() => {
		const phone = (item as any)?.phone
		if (!phone) return false
		return String(phone).includes('*')
	}, [item])

	const navigateToRelatedSearch = () => {
		if (!item) return
		navigate('/search', {
			state: {
				initialType: isJob ? 'worker' : 'job',
				initialCityId: item.cityId,
				initialSphereId: (item as any).sphereId,
				initialCategoryId: item.categoryId,
				initialSubcategoryId: item.subcategoryId,
			},
		})
	}

	if (itemLoading || !item) return <Loader />

	return (
		<>
			<MediaViewer
				media={selectedMedia}
				onClose={() => setSelectedMedia(null)}
			/>
			<ListingView
				item={item}
				isJob={isJob}
				stats={stats}
				onBack={() => navigate(-1)}
				onWhatsApp={() => handleContactClick('whatsapp')}
				onTelegram={() => handleContactClick('telegram')}
				onRoute={open2GISRoute}
				onMedia={setSelectedMedia}
				extra={
					<SheetOption
						icon={isJob ? '🔍' : '💼'}
						title={
							isJob
								? 'Найти сотрудников в этой категории'
								: 'Посмотреть вакансии в этой сфере'
						}
						subtitle='Рекомендация'
						right={
							<ChevronRight
								size={18}
								strokeWidth={1.8}
								style={{ color: 'var(--muted)' }}
							/>
						}
						onClick={navigateToRelatedSearch}
					/>
				}
			/>
		</>
	)
}

// Вспомогательные иконки (сохранил твой стиль)
const CompanyIcon = () => (
	<svg
		className='w-4 h-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
		/>
	</svg>
)
const RouteIcon = () => (
	<svg
		className='w-3 h-3'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
		/>
	</svg>
)
const ClockIconSmall = () => (
	<svg
		className='w-4 h-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
		/>
	</svg>
)
const ExpIconSmall = () => (
	<svg
		className='w-4 h-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
		/>
	</svg>
)
const LocIconSmall = () => (
	<svg
		className='w-4 h-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
		/>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
		/>
	</svg>
)
const UserIconSmall = () => (
	<svg
		className='w-4 h-4'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
		/>
	</svg>
)
const ViewIcon = () => (
	<svg
		className='w-3.5 h-3.5'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
		/>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
		/>
	</svg>
)
const ClickIcon = () => (
	<svg
		className='w-3.5 h-3.5'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5'
		/>
	</svg>
)
