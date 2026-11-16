import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useContext,
	useRef,
} from 'react'
import {
	HashRouter,
	Routes,
	Route,
	useNavigate,
	useLocation,
	Navigate,
	useSearchParams,
	useParams,
} from 'react-router-dom'
import {
	Home,
	Search,
	Building2,
	Heart,
	Share,
	BellRing,
	Plus,
	Star,
	ChevronRight,
	ChevronDown,
	Zap,
	Gamepad2,
	Gem,
	Gift,
	User as UserLucide,
	Bell,
	BriefcaseBusiness,
	FileText,
	Eye,
	EyeOff,
	Pencil,
	Trash2,
	MapPin,
	MousePointerClick,
	Copy,
	Send,
	Check,
	Rocket,
	Settings,
	Wallet,
	Wrench,
	Clapperboard,
} from 'lucide-react'
import {
	Avatar,
	Button,
	Chip,
	EmptyState,
	JobCard,
	Loader,
	MenuList,
	Panel,
	ScreenHeader,
	SectionHead,
	Segmented,
	Sheet,
	SheetOption,
	Skeleton,
	StatsBlock,
	StatusPill,
	Tabs,
	IconButton,
	GigRow,
	distanceText,
	gigDayLabel,
	gigTime,
	payText,
	cx,
	fmtMoney,
	fmtNum,
	haptic as wkHaptic,
	plural,
	yearsText,
} from './src/ui/wk'
import { ListingView } from './src/ui/ListingView'
import { BANK_SERVICES, formatPhoneKG, formatDate } from './constants'
import { User, Media, Vacancy, Resume, SocialTask } from './types'
import { GamesPage } from './src/pages/games/ui/GamesPage'
import { ProfileDetail } from './src/pages/ProfileDetail'
import CreatePage from './src/pages/FormPage/CreatePage'
import EditPage from './src/pages/FormPage/EditPage'

import {
	useCreatePaymentMutation,
	useDeleteResumeMutation,
	useDeleteVacancyMutation,
	useUpdateResumeStatusMutation,
	useUpdateVacancyStatusMutation,
	useWithdrawPointsMutation,
} from './src/store/store'
import {
	useGetUserQuery,
	useRegisterUserMutation,
	useSyncUserMutation,
	useGetSocialTasksQuery,
	useCheckTaskMutation,
	useGetCitiesQuery,
	useGetSpheresQuery,
	useGetCategoriesQuery,
	useGetSubcategoriesQuery,
	useSearchVacanciesQuery,
	useSearchResumesQuery,
	useGetRecommendedVacanciesQuery,
	useGetUserVacanciesQuery,
	useGetUserResumesQuery,
	useGetVacancyDetailQuery,
	useGetResumeDetailQuery,
	useGetVacancyStatsQuery,
	useGetResumeStatsQuery,
	useTrackContactClickMutation,
	useTrackViewMutation,
	useGetSubscriptionStatusQuery,
	useGetReferralInfoQuery,
	useBoostVacancyMutation,
	useBoostResumeMutation,
	useGetGigsQuery,
	useGetOffersQuery,
	useGetMyGigsQuery,
	useGetMyOfferQuery,
	useGetCompaniesQuery,
	useGetMyCompanyQuery,
	useGetFollowedCompaniesQuery,
	useGetCompanyByVacancyQuery,
	useGetMyApplicationsQuery,
	useGetApplicationCountsQuery,
	useGetTopGigCustomersQuery,
	useGetSavedIdsQuery,
	useGetDealsPendingQuery,
} from './src/store/store'
import { GeoPromoCard } from './src/pages/GoPromoCard'
import { UiKit } from './src/pages/UiKit'
import GigFormPage from './src/pages/gigs/GigFormPage'
import OfferFormPage from './src/pages/gigs/OfferFormPage'
import GigPage from './src/pages/gigs/GigPage'
import OfferPage from './src/pages/gigs/OfferPage'
import CompaniesPage from './src/pages/companies/CompaniesPage'
import CompanyPage from './src/pages/companies/CompanyPage'
import CompanyFormPage from './src/pages/companies/CompanyFormPage'
import FollowingPage from './src/pages/companies/FollowingPage'
import { CompanyCardWide, GigCustomerCard } from './src/ui/company'
import ApplicationPage from './src/pages/applications/ApplicationPage'
import ApplicantsPage from './src/pages/applications/ApplicantsPage'
import MyApplicationsPage from './src/pages/applications/MyApplicationsPage'
import { ApplySheet } from './src/pages/applications/ApplySheet'
import { STATUS_APPLICANT } from './src/pages/applications/status'
import SavedPage from './src/pages/me/SavedPage'
import DealsPage from './src/pages/deals/DealsPage'
import ReviewPage from './src/pages/deals/ReviewPage'
import NotifySettingsPage from './src/pages/me/NotifySettingsPage'
import { SeriesListPage, SeriesPage } from './src/pages/series/SeriesPage'
import { SeriesPromo } from './src/pages/series/SeriesPromo'
import { SaveHeart } from './src/ui/save'
import { shareListing } from './src/ui/contact'

const tg = (window as any).Telegram?.WebApp

// --- SHARED COMPONENTS ---

const useTMA = () => {
	const navigate = useNavigate()

	const haptic = {
		impact: (style: 'light' | 'medium' | 'heavy' = 'light') =>
			tg.HapticFeedback.impactOccurred(style),
		notification: (type: 'success' | 'warning' | 'error') =>
			tg.HapticFeedback.notificationOccurred(type),
		selection: () => tg.HapticFeedback.selectionChanged(),
	}

	const showNativePopup = (
		title: string,
		message: string,
		buttons: any[],
	) => {
		tg.showPopup({ title, message, buttons }, (id: string) => {
			if (id === 'ok') haptic.impact('medium')
		})
	}

	const setHeader = (color: 'bg_color' | 'secondary_bg_color') => {
		if (tg.setHeaderColor) tg.setHeaderColor(color)
	}

	return { tg, haptic, showNativePopup, setHeader }
}
const ToastContext = React.createContext<{
	showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}>({ showToast: () => {} })

export const useToast = () => useContext(ToastContext)

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [toast, setToast] = useState<{
		message: string
		type: 'success' | 'error' | 'info'
	} | null>(null)
	const showToast = useCallback(
		(message: string, type: 'success' | 'error' | 'info' = 'success') => {
			setToast({ message, type })
			setTimeout(() => setToast(null), 2300)
			if (tg?.HapticFeedback) {
				tg.HapticFeedback.notificationOccurred(
					type === 'error' ? 'error' : 'success',
				)
			}
		},
		[],
	)

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			{toast && (
				<div className='wk-toast' role='status' aria-live='polite'>
					<div className='wk-toast__box' key={toast.message}>
						{toast.type !== 'info' && (
							<span
								className='wk-toast__dot'
								style={{
									background:
										toast.type === 'error'
											? 'var(--brand)'
											: 'var(--ok)',
								}}
							/>
						)}
						<span>{toast.message}</span>
					</div>
				</div>
			)}
		</ToastContext.Provider>
	)
}
// --- GEOLOCATION & MAP COMPONENTS ---

export const LocationContext = React.createContext<{
	location: { lat: number; lng: number } | null
	requestLocation: () => void
	openSettings: () => void
	isDenied: boolean
}>({
	location: null,
	requestLocation: () => {},
	openSettings: () => {},
	isDenied: false,
})

const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [location, setLocation] = useState<{
		lat: number
		lng: number
	} | null>(null)
	const [isDenied, setIsDenied] = useState(false)
	const { showToast } = useToast()

	const requestLocation = useCallback(() => {
		// Проверка версии Telegram (LocationManager доступен с 6.9, но лучше 8.0+)
		if (!tg.isVersionAtLeast('8.0') || !tg.LocationManager) {
			showToast('Обновите Telegram для использования геолокации', 'error')
			return
		}

		const handleGetLocation = () => {
			tg.LocationManager.getLocation((data: any) => {
				if (data) {
					setLocation({ lat: data.latitude, lng: data.longitude })
					setIsDenied(false)
					showToast('Местоположение определено!', 'success')
				} else {
					setIsDenied(true)
					showToast('Доступ к геолокации отклонен', 'error')
				}
			})
		}

		if (!tg.LocationManager.isInited) {
			tg.LocationManager.init(() => handleGetLocation())
		} else {
			handleGetLocation()
		}
	}, [showToast])

	const openSettings = useCallback(() => {
		if (tg.isVersionAtLeast('8.0') && tg.LocationManager) {
			if (tg.platform === 'ios' || tg.platform === 'macos') {
				// Воркаунд для iOS
				requestLocation()
			} else {
				tg.LocationManager.openSettings()
			}
		}
	}, [requestLocation])

	return (
		<LocationContext.Provider
			value={{ location, requestLocation, openSettings, isDenied }}
		>
			{children}
		</LocationContext.Provider>
	)
}

// Компонент автокомплита адреса (ИСПОЛЬЗУЕМ МЕТОД ITEMS ВМЕСТО SUGGEST)
// Компонент автокомплита адреса (С ФИЛЬТРОМ ПО БИШКЕКУ)
// Компонент автокомплита адреса (OpenStreetMap - Бесплатно, без ключей)
export const AddressAutocomplete2GIS: React.FC<{
	value: string
	onChange: (data: {
		address: string
		lat: number | null
		lng: number | null
	}) => void
}> = ({ value, onChange }) => {
	const [query, setQuery] = useState(value)
	const [suggestions, setSuggestions] = useState<any[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const timeoutRef = useRef<any>(null)

	const handleSearch = (text: string) => {
		setQuery(text)
		// Если пользователь просто стирает текст, сбрасываем координаты
		onChange({ address: text, lat: null, lng: null })

		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		if (text.length < 3) {
			setSuggestions([])
			return
		}

		setLoading(true)
		timeoutRef.current = setTimeout(async () => {
			try {
				const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=kg&accept-language=ru&limit=5&addressdetails=1`
				const response = await fetch(url)
				const data = await response.json()

				if (data && data.length > 0) {
					const realResults = data.map((item: any) => {
						const address = item.address || {}
						let mainName =
							address.road ||
							address.pedestrian ||
							address.building ||
							item.name ||
							text
						return {
							id: item.place_id,
							name: mainName,
							address_name: [address.city, address.house_number]
								.filter(Boolean)
								.join(', '),
							full_name: item.display_name,
							lat: item.lat, // Берем широту из API
							lon: item.lon, // Берем долготу из API
						}
					})
					setSuggestions(realResults)
				}
			} catch (e) {
				console.error('Ошибка OSM:', e)
			} finally {
				setLoading(false)
				setIsOpen(true)
			}
		}, 600)
	}

	const handleSelect = (item: any) => {
		setQuery(item.full_name)
		// ПЕРЕДАЕМ ОБЪЕКТ С КООРДИНАТАМИ
		onChange({
			address: item.full_name,
			lat: parseFloat(item.lat),
			lng: parseFloat(item.lon),
		})
		setIsOpen(false)
	}

	return (
		<div className='wk-field relative'>
			<label className='wk-label'>Адрес</label>
			<div className='relative'>
				<input
					value={query}
					onChange={(e) => handleSearch(e.target.value)}
					placeholder='Улица, дом или название'
					className='wk-input'
					style={{ paddingLeft: 44, paddingRight: 40 }}
				/>
				<MapPin
					size={20}
					strokeWidth={1.8}
					className='absolute left-[14px] top-1/2 -translate-y-1/2'
					style={{ color: 'var(--muted)' }}
				/>
				{loading && (
					<span
						className='wk-spinner absolute right-[14px] top-1/2 -translate-y-1/2'
						style={{ width: 16, height: 16, borderWidth: 2, color: 'var(--muted)', marginTop: -8 }}
					/>
				)}
			</div>
			<p className='wk-hint'>Поиск по Кыргызстану</p>

			{isOpen && suggestions.length > 0 && (
				<>
					<div
						className='fixed inset-0 z-[60]'
						onClick={() => setIsOpen(false)}
					/>
					<div className='wk-dropdown' style={{ top: 92, zIndex: 70 }}>
						{suggestions.map((item) => (
							<button
								type='button'
								key={item.id}
								onClick={() => handleSelect(item)}
								className='wk-dropdown__item flex-col !items-start !gap-0.5'
							>
								<span style={{ fontWeight: 600 }}>{item.name}</span>
								<span className='wk-xs'>{item.address_name}</span>
							</button>
						))}
					</div>
				</>
			)}
		</div>
	)
}
// Новый компонент для просмотра медиа на весь экран
export const MediaViewer: React.FC<{
	media: Media | null
	onClose: () => void
}> = ({ media, onClose }) => {
	if (!media) return null

	return (
		<div
			className='fixed inset-0 z-[300] bg-black flex items-center justify-center animate-in fade-in duration-300'
			onClick={onClose}
		>
			<button
				onClick={onClose}
				className='absolute top-10 right-6 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md z-[310]'
			>
				✕
			</button>
			<div className='w-full h-full flex items-center justify-center p-2'>
				{media.mediaType === 'VIDEO' ? (
					<video
						src={media.fileUrl}
						controls
						autoPlay
						className='max-w-full max-h-full rounded-lg'
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<img
						src={media.fileUrl}
						alt='Full screen'
						className='max-w-full max-h-full object-contain'
						onClick={(e) => e.stopPropagation()}
					/>
				)}
			</div>
		</div>
	)
}

const Logo = () => (
	<div className='flex items-center gap-2 font-black text-2xl tracking-tight'>
		<div className='flex items-center gap-1 mr-1'>
			<div className='logo-icon-line'></div>
			<div className='logo-icon-line'></div>
		</div>
		<span className='text-[#111111]'>WORK</span>
		<span className='text-[#b91c1c]'>KG</span>
	</div>
)

export const ElegantSelect: React.FC<{
	label?: string
	value: string | number | null
	options: { id: string | number; name: string; icon?: string }[]
	placeholder: string
	onChange: (id: any) => void
	disabled?: boolean
}> = ({ label, value, options, placeholder, onChange, disabled }) => {
	const [isOpen, setIsOpen] = useState(false)
	const selectedOption = options.find((o) => String(o.id) === String(value))

	const renderIcon = (icon?: string, name?: string) => {
		if (!icon) return null
		const isUrl = icon.startsWith('http') || icon.startsWith('data:')
		return (
			<span className='w-6 h-6 flex items-center justify-center shrink-0 overflow-hidden rounded-md'>
				{isUrl ? (
					<img
						src={icon}
						alt={name}
						className='w-full h-full object-contain'
					/>
				) : (
					<span style={{ fontSize: 18 }}>{icon}</span>
				)}
			</span>
		)
	}

	return (
		<div
			className='relative w-full text-left'
			style={disabled ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
		>
			{label && <label className='wk-label'>{label}</label>}
			<button
				type='button'
				onClick={() => !disabled && setIsOpen(!isOpen)}
				className={cx('wk-select', isOpen && 'is-open')}
			>
				{selectedOption &&
					renderIcon(selectedOption.icon, selectedOption.name)}
				<span
					className={cx('wk-select__value', !selectedOption && 'is-empty')}
				>
					{selectedOption ? selectedOption.name : placeholder || 'Выберите'}
				</span>
				<ChevronDown
					size={18}
					strokeWidth={1.8}
					style={{
						color: 'var(--muted)',
						flexShrink: 0,
						transition: 'transform .2s',
						transform: isOpen ? 'rotate(180deg)' : undefined,
					}}
				/>
			</button>

			{isOpen && (
				<>
					<div
						className='fixed inset-0 z-[160]'
						onClick={() => setIsOpen(false)}
					/>
					<div className='wk-dropdown'>
						{options.map((opt) => {
							const active = String(value) === String(opt.id)
							return (
								<button
									type='button'
									key={opt.id}
									onClick={() => {
										onChange(opt.id)
										setIsOpen(false)
									}}
									className={cx(
										'wk-dropdown__item',
										active && 'is-active',
									)}
								>
									{renderIcon(opt.icon, opt.name)}
									<span className='flex-1'>{opt.name}</span>
									{active && (
										<Check size={18} strokeWidth={2} />
									)}
								</button>
							)
						})}
					</div>
				</>
			)}
		</div>
	)
}

const FormField: React.FC<{
	label: string
	hint?: string
	error?: string
	children: React.ReactNode
}> = ({ label, hint, error, children }) => (
	<div className='wk-field text-left'>
		<label className='wk-label'>{label}</label>
		{children}
		{error ? (
			<p className='wk-error'>{error}</p>
		) : hint ? (
			<p className='wk-hint'>{hint}</p>
		) : null}
	</div>
)

const greeting = () => {
	const h = new Date().getHours()
	if (h >= 5 && h < 12) return 'Доброе утро'
	if (h >= 12 && h < 18) return 'Добрый день'
	return 'Добрый вечер'
}

/** Пропсы JobCard из вакансии/резюме — поля API не меняем */
export const listingCardProps = (item: any, type: 'job' | 'worker') => {
	const isJob = type !== 'worker'
	const badge = item.boosted ? (
		<StatusPill tone='warn'>⚡ ТОП</StatusPill>
	) : item.free ? (
		<StatusPill tone='ok'>Бесплатно</StatusPill>
	) : undefined
	if (isJob)
		return {
			title: item.title,
			company: (
				<span className='truncate'>
					{item.companyName || item.company || 'Частное лицо'}
				</span>
			),
			logoName: item.companyName || item.title,
			logoSrc: item.logo || null,
			salary: item.salary ? String(item.salary) : 'Договорная',
			// Сердечко справа, бейдж ТОП/Бесплатно — под ним
			right: item.id ? (
				<div className='flex flex-col items-end' style={{ gap: 4 }}>
					<SaveHeart vacancyId={item.id} />
					{badge}
				</div>
			) : undefined,
			meta: [
				item.schedule,
				item.experienceInYear != null
					? yearsText(item.experienceInYear)
					: null,
				item.distanceKm != null
					? `${String(Number(item.distanceKm).toFixed(1)).replace('.', ',')} км`
					: item.cityName || item.location,
			],
			badge,
		}
	return {
		title: item.name,
		company: (
			<span className='truncate'>
				{[item.categoryName, item.subcategoryName]
					.filter(Boolean)
					.join(' · ') || 'Резюме'}
			</span>
		),
		logoName: item.name,
		logoSrc: item.media?.[0]?.fileUrl || null,
		avatar: true,
		salary: Number(item.experience)
			? `${item.experience} ${plural(Number(item.experience), ['год', 'года', 'лет'])} опыта`
			: 'Без опыта',
		meta: [item.age ? `${item.age} лет` : null, item.cityName],
		badge,
	}
}

const HomePage: React.FC<{ user: User | null }> = ({ user }: any) => {
	const navigate = useNavigate()
	const telegramId = user?.telegramId || 0
	const tgUser = tg?.initDataUnsafe?.user
	const { data: recommendations = [], isLoading } =
		useGetRecommendedVacanciesQuery(
			{ tid: telegramId, limit: 10 },
			{ skip: !telegramId },
		)

	const spheres = [
		{ id: 1, name: 'IT-сфера', icon: '💻' },
		{ id: 2, name: 'Продажи', icon: '🏪' },
		{ id: 3, name: 'Строительство', icon: '🏗' },
		{ id: 4, name: 'Маркетинг', icon: '📈' },
		{ id: 5, name: 'Швейная', icon: '🧵' },
		{ id: 6, name: 'Логистика', icon: '🚚' },
		{ id: 7, name: 'Общепит', icon: '☕️' },
	]

	const handleAction = (
		path: string,
		impact: 'light' | 'medium' | 'heavy' = 'light',
		state?: any,
	) => {
		if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(impact)
		navigate(path, { state })
	}

	const firstName = user?.firstName || tgUser?.first_name || 'Гость'
	const [homeParams, setHomeParams] = useSearchParams()
	const homeTab = homeParams.get('tab') === 'gigs' ? 'gigs' : 'jobs'

	return (
		<div className='wk-screen wk-enter text-left'>
			{/* Шапка */}
			<header className='flex items-center' style={{ gap: 10 }}>
				<Avatar
					name={firstName}
					src={tgUser?.photo_url}
					size={42}
					onClick={() => handleAction('/profile')}
				/>
				<div className='flex-1 min-w-0'>
					<div className='wk-xs'>{greeting()}</div>
					<div className='truncate' style={{ fontWeight: 600 }}>
						{firstName}
					</div>
				</div>
				<IconButton
					label='PRO доступ'
					onClick={() => handleAction('/subscription')}
				>
					<Gem size={20} strokeWidth={1.8} />
				</IconButton>
			</header>

			<h1 className='wk-h1' style={{ marginTop: 26 }}>
				Работа в лучших
				<br />
				местах Бишкека
			</h1>

			<button
				className='wk-search'
				style={{ marginTop: 20 }}
				onClick={() => handleAction('/search')}
			>
				<Search size={20} strokeWidth={1.8} />
				<span className='wk-search__ph'>Должность или компания</span>
			</button>

			{/* Реклама сериала — видна на обеих вкладках главной */}
			<SeriesPromo telegramId={telegramId} />

			<Tabs
				className='mt-[22px]'
				value={homeTab}
				onChange={(v) => setHomeParams(v === 'gigs' ? { tab: 'gigs' } : {}, { replace: true })}
				items={[
					{ value: 'jobs', label: 'Вакансии' },
					{ value: 'gigs', label: 'Подработка' },
				]}
			/>

			{homeTab === 'gigs' ? (
				<GigsTab telegramId={telegramId} />
			) : (
			<>
			{/* Сферы */}
			<div className='wk-chiprow' style={{ marginTop: 16 }}>
				<Chip active onClick={() => handleAction('/search')}>
					Все
				</Chip>
				{spheres.map((s) => (
					<Chip
						key={s.id}
						onClick={() =>
							handleAction('/search', 'light', {
								sphereId: s.id,
								cityId: 1, // Берем город пользователя или 1 по дефолту
							})
						}
					>
						{s.icon} {s.name}
					</Chip>
				))}
			</div>

			<TopEmployers telegramId={telegramId} />

			{/* Резюме за 60 секунд */}
			<div
				className='wk-balance wk-press'
				style={{ marginTop: 24, padding: 18 }}
				onClick={() =>
					handleAction('/create', 'medium', { type: 'res' })
				}
			>
				<div className='flex items-center justify-between gap-3 relative'>
					<div>
						<div style={{ fontSize: 17, fontWeight: 700 }}>
							Резюме за 60 секунд
						</div>
						<div style={{ fontSize: 13.5, opacity: 0.8, marginTop: 4 }}>
							Работодатели увидят его и напишут вам
						</div>
					</div>
					<span
						className='flex items-center justify-center shrink-0'
						style={{
							width: 42,
							height: 42,
							borderRadius: 14,
							background: 'rgba(255,255,255,.18)',
						}}
					>
						<ChevronRight size={20} strokeWidth={1.8} />
					</span>
				</div>
			</div>

			<div className='grid grid-cols-2' style={{ gap: 12, marginTop: 12 }}>
				<Panel press onClick={() => handleAction('/games')} style={{ padding: 16 }}>
					<span
						className='flex items-center justify-center'
						style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gig-soft)', color: 'var(--gig)' }}
					>
						<Gamepad2 size={20} strokeWidth={1.8} />
					</span>
					<div style={{ fontWeight: 700, marginTop: 12 }}>Игры</div>
					<div className='wk-xs'>Отдохни от поиска</div>
				</Panel>
				<Panel press onClick={() => handleAction('/subscription')} style={{ padding: 16 }}>
					<span
						className='flex items-center justify-center'
						style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-soft)', color: 'var(--brand)' }}
					>
						<Gem size={20} strokeWidth={1.8} />
					</span>
					<div style={{ fontWeight: 700, marginTop: 12 }}>PRO</div>
					<div className='wk-xs'>Контакты без лимита</div>
				</Panel>
			</div>

			<GeoPromoCard />

			<SectionHead
				title='Новые вакансии'
				right='Все'
				onRight={() => handleAction('/search')}
			/>

			{isLoading ? (
				<div className='wk-stack'>
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} height={128} />
					))}
				</div>
			) : recommendations.length === 0 ? (
				<p className='wk-meta'>Пока нет вакансий в этой категории</p>
			) : (
				<div className='wk-stack'>
					{recommendations.map((vacancy: any) => (
						<JobCard
							key={vacancy.id}
							{...listingCardProps(vacancy, 'job')}
							onClick={() =>
								handleAction(`/detail/${vacancy.id}`, 'light', {
									type: 'job',
									data: vacancy,
								})
							}
						/>
					))}
				</div>
			)}
			</>
			)}
		</div>
	)
}

/** «Топ работодатели» [01]: горизонтальная лента CompanyCardWide */
const TopEmployers: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { data = [], isLoading } = useGetCompaniesQuery({ tid: telegramId || undefined })
	const top = data.slice(0, 10)
	if (!isLoading && top.length === 0) return null
	return (
		<>
			<SectionHead title='Топ работодатели' right='Все' onRight={() => navigate('/companies')} />
			<div className='wk-corow'>
				{isLoading
					? [0, 1].map((i) => (
							<div key={i} style={{ flex: '0 0 280px' }}>
								<Skeleton height={230} radius={26} />
							</div>
						))
					: top.map((c) => (
							<CompanyCardWide
								key={c.id}
								c={c}
								onClick={() => {
									tg?.HapticFeedback?.impactOccurred('light')
									navigate(`/company/${c.id}`)
								}}
							/>
						))}
			</div>
		</>
	)
}

/** Вкладка «Подработка» на главной [02] */
const GigsTab: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { location: loc } = useContext(LocationContext)
	const { data: gigs = [], isLoading, isError, refetch } = useGetGigsQuery(
		{ tid: telegramId, lat: loc?.lat, lon: loc?.lng },
		{ skip: !telegramId },
	)
	const { data: offers = [] } = useGetOffersQuery({ tid: telegramId }, { skip: !telegramId })
	const others = offers.filter((o) => !o.mine).slice(0, 5)
	const { data: customers = [] } = useGetTopGigCustomersQuery(telegramId || undefined)
	const [customer, setCustomer] = useState<(typeof customers)[number] | null>(null)

	return (
		<>
			<SectionHead title='Сегодня и завтра' right={loc ? 'рядом с вами' : undefined} />
			{isLoading ? (
				<Skeleton height={280} radius={24} />
			) : isError ? (
				<Panel className='text-center'>
					<div className='wk-sub'>Не удалось загрузить. Проверьте интернет</div>
					<Button size='sm' variant='ink' style={{ marginTop: 12 }} onClick={() => refetch()}>
						Повторить
					</Button>
				</Panel>
			) : gigs.length === 0 ? (
				<EmptyState
					emoji='⚡'
					title='Пока нет заданий'
					text='Здесь появятся задания на сегодня и завтра'
				/>
			) : (
				<div className='wk-panel wk-gigs' style={{ padding: '0 18px' }}>
					{gigs.map((g) => (
						<GigRow
							key={g.id}
							time={gigTime(g.timeText)}
							day={gigDayLabel(g.workDate)}
							title={g.title}
							urgent={g.urgent}
							sub={[g.voiceUrl ? '🎧' : null, g.authorName, distanceText(g.distanceKm), g.payUnit === 'HOUR' ? 'оплата в час' : g.payUnit === 'SHIFT' ? 'за смену' : null].filter(Boolean).join(' · ')}
							pay={payText(g.pay)}
							onClick={() => navigate(`/gig/${g.id}`)}
						/>
					))}
				</div>
			)}
			<Button
				variant='line'
				block
				style={{ marginTop: 14 }}
				onClick={() => {
					wkHaptic.impact('medium')
					navigate('/gig/new')
				}}
			>
				<Plus size={18} strokeWidth={2} /> Нужен человек на пару часов?
			</Button>

			{customers.length > 0 && (
				<>
					<SectionHead title='Надёжные заказчики' right='за 3 месяца' />
					<div className='wk-corow'>
						{customers.map((c) => (
							<GigCustomerCard
								key={c.userId}
								c={c}
								onClick={() => {
									wkHaptic.impact('light')
									if (c.companyId) navigate(`/company/${c.companyId}`)
									else setCustomer(c)
								}}
							/>
						))}
					</div>
				</>
			)}
			<Sheet
				open={!!customer}
				onClose={() => setCustomer(null)}
				title={customer?.name}
				subtitle={customer ? `${customer.type} · ${customer.gigsCount} ${plural(customer.gigsCount, ['подработка', 'подработки', 'подработок'])} за 3 месяца` : undefined}
			>
				{customer && customer.openGigs.length === 0 ? (
					<p className='wk-meta'>Сейчас открытых заданий нет — загляните позже.</p>
				) : (
					<div className='wk-panel wk-gigs' style={{ padding: '0 18px' }}>
						{customer?.openGigs.map((g) => (
							<GigRow
								key={g.id}
								time={gigTime(g.timeText)}
								day={gigDayLabel(g.workDate)}
								title={g.title}
								urgent={g.urgent}
								sub={[g.address, g.payUnit === 'HOUR' ? 'оплата в час' : g.payUnit === 'SHIFT' ? 'за смену' : null].filter(Boolean).join(' · ')}
								pay={payText(g.pay)}
								onClick={() => navigate(`/gig/${g.id}`)}
							/>
						))}
					</div>
				)}
			</Sheet>

			{others.length > 0 && (
				<>
					<SectionHead title='Готовы подработать' />
					<div className='wk-stack'>
						{others.map((o) => (
							<JobCard
								key={o.id}
								avatar
								logoName={o.name}
								title={o.name}
								company={<span className='truncate'>{o.skills.join(', ')}</span>}
								salary={payText(o.price, o.priceUnit)}
								meta={[o.district, o.days.join(', ')]}
								onClick={() => navigate(`/offer/${o.id}`)}
							/>
						))}
					</div>
				</>
			)}
		</>
	)
}

const SearchPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const [searchParams, setSearchParams] = useSearchParams()
	const { location: loc } = useContext(LocationContext)

	const s = location.state || {}

	const [type, setType] = useState<'job' | 'worker'>(
		() => (searchParams.get('type') as any) || 'job',
	)
	const [query, setQuery] = useState(() => searchParams.get('query') || '')
	const [cityId, setCityId] = useState(
		() => Number(searchParams.get('cityId')) || 1,
	)

	const [sphereId, setSphereId] = useState<number | null>(
		() => Number(searchParams.get('sphereId')) || s.sphereId || null,
	)
	const [categoryId, setCategoryId] = useState<number | null>(
		() => Number(searchParams.get('catId')) || null,
	)
	const [subcategoryId, setSubcategoryId] = useState<number | null>(
		() => Number(searchParams.get('subId')) || null,
	)

	const { data: cities = [] } = useGetCitiesQuery(telegramId)
	const { data: spheres = [] } = useGetSpheresQuery(telegramId)
	const { data: categories = [] } = useGetCategoriesQuery(
		{ tid: telegramId, sid: sphereId! },
		{ skip: !sphereId },
	)
	const { data: subcategories = [] } = useGetSubcategoriesQuery(
		{ tid: telegramId, cid: categoryId! },
		{ skip: !categoryId },
	)

	const searchArgs = {
		tid: telegramId,
		cityId,
		sphereId,
		categoryId,
		subcategoryId,
		query,
		userLatitude: loc?.lat || null,
		userLongitude: loc?.lng || null,
	}

	const { data: jobResults = [], isFetching: isJobFetching } =
		useSearchVacanciesQuery(searchArgs, { skip: type !== 'job' })
	const { data: workerResults = [], isFetching: isWorkerFetching } =
		useSearchResumesQuery(searchArgs, { skip: type !== 'worker' })

	const results = type === 'job' ? jobResults : workerResults
	const loading = isJobFetching || isWorkerFetching

	useEffect(() => {
		const params: any = { type, cityId }
		if (query) params.query = query
		if (sphereId) params.sphereId = sphereId
		if (categoryId) params.catId = categoryId
		if (subcategoryId) params.subId = subcategoryId
		setSearchParams(params, { replace: true })
	}, [
		type,
		query,
		cityId,
		sphereId,
		categoryId,
		subcategoryId,
		setSearchParams,
	])

	return (
		<div className='wk-screen wk-enter text-left'>
			<div className='flex items-center' style={{ gap: 10 }}>
				<IconButton label='Назад' onClick={() => navigate(-1)}>
					<ChevronRight
						size={22}
						strokeWidth={1.8}
						style={{ transform: 'rotate(180deg)' }}
					/>
				</IconButton>
				<label className='wk-search flex-1' style={{ height: 50 }}>
					<Search size={20} strokeWidth={1.8} />
					<input
						autoFocus={!query && !sphereId}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Должность или компания'
						enterKeyHint='search'
					/>
				</label>
			</div>

			<Tabs
				className='mt-[22px]'
				value={type}
				onChange={(v) => setType(v as 'job' | 'worker')}
				items={[
					{ value: 'job', label: 'Вакансии' },
					{ value: 'worker', label: 'Сотрудники' },
				]}
			/>

			<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 16 }}>
				<ElegantSelect
					placeholder='Город'
					value={cityId}
					options={cities}
					onChange={setCityId}
				/>
				<ElegantSelect
					placeholder='Сфера'
					value={sphereId}
					options={spheres}
					onChange={(id) => {
						setSphereId(id)
						setCategoryId(null)
						setSubcategoryId(null)
					}}
				/>
				{/* Категории и подкатегории */}
				{sphereId && (
					<>
						<ElegantSelect
							placeholder='Категория'
							value={categoryId}
							options={categories}
							onChange={(id) => {
								setCategoryId(id)
								setSubcategoryId(null)
							}}
						/>
						<ElegantSelect
							disabled={!categoryId || subcategories.length === 0}
							placeholder={
								subcategories.length === 0
									? 'Нет подкат.'
									: 'Подкатегория'
							}
							value={subcategoryId}
							options={subcategories}
							onChange={setSubcategoryId}
						/>
					</>
				)}
			</div>

			<SectionHead
				title={type === 'job' ? 'Вакансии' : 'Сотрудники'}
				right={loading ? undefined : fmtNum(results.length)}
			/>

			{loading && results.length === 0 ? (
				<div className='wk-stack'>
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} height={128} />
					))}
				</div>
			) : results.length > 0 ? (
				<div className='wk-stack'>
					{results.map((item) => (
						<SearchResultItem
							key={item.id}
							item={item}
							type={type}
							onClick={(stats: any) =>
								navigate(`/detail/${item.id}`, {
									state: {
										type,
										data: item,
										initialStats: stats,
									},
								})
							}
						/>
					))}
				</div>
			) : (
				<EmptyState
					emoji='🔍'
					title='Ничего не найдено'
					text='Попробуйте другой запрос или сферу'
				/>
			)}
		</div>
	)
}

const viewedIds = new Set<string>()

const SearchResultItem = ({ item, type, onClick }: any) => {
	const { data: stats } =
		type === 'job'
			? useGetVacancyStatsQuery(item.id)
			: useGetResumeStatsQuery(item.id)
	const [trackView] = useTrackViewMutation()
	const impressionRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const trackingKey = `${type}-${item.id}`
		if (viewedIds.has(trackingKey)) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					trackView({
						type: type === 'job' ? 'job' : 'worker',
						id: item.id,
					})
					viewedIds.add(trackingKey)
					observer.disconnect()
				}
			},
			{ threshold: 0.5 },
		)

		if (impressionRef.current) observer.observe(impressionRef.current)
		return () => observer.disconnect()
	}, [item.id, type, trackView])

	const card = listingCardProps(item, type)

	return (
		<JobCard
			ref={impressionRef}
			{...card}
			onClick={() => onClick(stats)}
			meta={[
				...card.meta,
				<span className='wk-job__stats' key='v'>
					<Eye size={14} strokeWidth={1.8} />
					{stats?.viewsCount ?? 0}
				</span>,
				<span className='wk-job__stats' key='c'>
					<MousePointerClick size={14} strokeWidth={1.8} />
					{stats?.contactClicksCount ?? 0}
				</span>,
			]}
		/>
	)
}

const DetailPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const { showToast } = useToast()
	const { location: userLocation } = useContext(LocationContext)
	const params = useParams()
	const [detailSearch] = useSearchParams()

	// Обычно данные приходят из списка через state; из уведомления бота — только id в адресе
	const routeState = location.state || {}
	const type = routeState.type || detailSearch.get('type') || 'job'
	const data = routeState.data || { id: Number(params.id) }

	const { data: newData, isLoading } =
		type === 'worker'
			? useGetResumeDetailQuery({
					id: data.id,
					tid: telegramId,
					isProfile: false,
				})
			: useGetVacancyDetailQuery({
					id: data.id,
					tid: telegramId,
					isProfile: false,
				})
	let item: any = newData

	const { data: stats } =
		type === 'worker'
			? useGetResumeStatsQuery(data.id)
			: useGetVacancyStatsQuery(data.id)

	const [trackContact] = useTrackContactClickMutation()
	const [trackView] = useTrackViewMutation()
	const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

	useEffect(() => {
		if (data?.id)
			trackView({
				type: type === 'worker' ? 'worker' : 'job',
				id: data.id,
			})
	}, [data?.id, type, trackView])

	const handleContactClick = (platform: 'whatsapp' | 'telegram') => {
		if (!item) return

		// Трекаем клик
		trackContact({
			type: type === 'worker' ? 'worker' : 'job',
			id: item.id,
			tid: telegramId,
		})

		showToast(`Переходим в ${platform}...`)

		if (platform === 'whatsapp') {
			// Проверяем наличие телефона, чтобы не было ошибки .replace на null
			const rawPhone = item.phone || ''
			const phone = rawPhone.replace(/\D/g, '')

			if (!phone) {
				showToast('Номер телефона не указан', 'error')
				return
			}

			const url = `https://wa.me/${phone}`
			if (tg) tg.openLink(url, { try_instant_view: false })
			else window.open(url, '_blank')
		} else {
			// Логика для Telegram
			// Очищаем юзернейм от @ и лишних пробелов
			const username = (item.telegramUsername || '').trim().replace(/^@/, '')

			if (!username) {
				showToast('Username не указан', 'error')
				return
			}

			const url = `https://t.me/${username}`

			// ВАЖНО: tg.openTelegramLink лучше подходит для t.me ссылок внутри приложения
			if (tg) {
				tg.openTelegramLink(url)
			} else {
				window.open(url, '_blank')
			}
		}
	}

	const open2GISRoute = () => {
		if (!item?.address) return
		const fullAddress = `${item.cityName}, ${item.address}`.trim()
		const encoded = encodeURIComponent(fullAddress)
		let url = `https://2gis.kg/search/${encoded}`

		if (userLocation?.lat && userLocation?.lng) {
			url += `?m=${userLocation.lng},${userLocation.lat}%2F15`
		}

		if (tg) tg.openLink(url)
		else window.open(url, '_blank')
	}

	const isLocked = useMemo(() => {
		if (!item?.phone) return false
		if (item.free === true) return false
		return String(item.phone).includes('*')
	}, [item?.phone, item?.free])

	const isJob = type === 'job' || type === 'vac'
	const { data: company } = useGetCompanyByVacancyQuery(data.id, { skip: !isJob || !data.id })
	const { data: myApps = [] } = useGetMyApplicationsQuery(telegramId, { skip: !isJob })
	const { data: myVacancies = [] } = useGetUserVacanciesQuery(telegramId, { skip: !isJob })
	const [applyOpen, setApplyOpen] = useState(false)
	const myApp = myApps.find((a) => a.vacancyId === Number(data.id))
	const isMine = myVacancies.some((v: any) => v.id === Number(data.id))
	const vacancy = isJob ? (item as Vacancy) : null
	const resume = !isJob ? (item as Resume) : null

	if (isLoading || !item) return <Loader />

	return (
		<>
			<MediaViewer
				media={selectedMedia}
				onClose={() => setSelectedMedia(null)}
			/>
			{isJob && (
				<ApplySheet
					open={applyOpen}
					onClose={() => setApplyOpen(false)}
					telegramId={telegramId}
					vacancyId={Number(item.id)}
					vacancyTitle={item.title}
				/>
			)}
			<ListingView
				item={item}
				isJob={isJob}
				stats={stats}
				isLocked={isLocked}
				onBack={() => navigate(-1)}
				onWhatsApp={() => handleContactClick('whatsapp')}
				onTelegram={() => handleContactClick('telegram')}
				onUnlock={() => navigate('/subscription')}
				onRoute={open2GISRoute}
				onMedia={setSelectedMedia}
				company={isJob ? company : null}
				onCompany={() => company && navigate(`/company/${company.id}`)}
				coverRight={
					isJob ? (
						<>
							<SaveHeart vacancyId={Number(item.id)} glass />
							<IconButton
								glass
								label='Поделиться'
								onClick={async () => {
									const r = await shareListing(`vac_${item.id}`, `💼 ${item.title} — вакансия в Work KG`)
									if (r === 'copied') showToast('Ссылка скопирована')
								}}
							>
								<Share size={20} strokeWidth={1.8} />
							</IconButton>
						</>
					) : undefined
				}
				primary={
					!isJob ? undefined : isMine ? (
						<Button variant='ink' block onClick={() => navigate(`/applicants/${item.id}`)}>
							Смотреть отклики
						</Button>
					) : myApp ? (
						<Button variant='line' block onClick={() => navigate('/my-applications')}>
							✓ Отклик отправлен · {STATUS_APPLICANT[myApp.status].label}
						</Button>
					) : (
						<Button variant={isLocked ? 'red' : 'ink'} block onClick={() => setApplyOpen(true)}>
							Откликнуться резюме
						</Button>
					)
				}
				note={
					isLocked
						? 'Бесплатно: 3 контакта в день · дальше с PRO'
						: undefined
				}
			/>
		</>
	)
}

const ProfilePage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const [searchParams, setSearchParams] = useSearchParams()
	const tgUserPhoto = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url

	// Текущий таб
	const tabParam = searchParams.get('tab')
	const activeTab: 'resumes' | 'vacancies' | 'gigs' =
		tabParam === 'vacancies' || tabParam === 'gigs' ? tabParam : 'resumes'

	// --- RTK QUERY ДАННЫЕ ---
	const { data: user } = useGetUserQuery(telegramId)
	const { data: resumes = [], isLoading: resLoading } =
		useGetUserResumesQuery(telegramId)
	const { data: vacancies = [], isLoading: vacLoading } =
		useGetUserVacanciesQuery(telegramId)
	const { data: myGigs = [], isLoading: gigsLoading } =
		useGetMyGigsQuery(telegramId)
	const { data: myOffer } = useGetMyOfferQuery(telegramId)
	const { data: myCompany } = useGetMyCompanyQuery(telegramId)
	const { data: followed = [] } = useGetFollowedCompaniesQuery(telegramId)
	const { data: myApplications = [] } = useGetMyApplicationsQuery(telegramId)
	const { data: savedIds = [] } = useGetSavedIdsQuery(telegramId)
	const { data: appCounts = {} } = useGetApplicationCountsQuery(telegramId)

	// --- МУТАЦИИ ---
	const [boostVacancy, { isLoading: isBoostingVac }] =
		useBoostVacancyMutation()
	const [boostResume, { isLoading: isBoostingRes }] = useBoostResumeMutation()
	const [updateVacStatus] = useUpdateVacancyStatusMutation()
	const [updateResStatus] = useUpdateResumeStatusMutation()
	const [deleteVac] = useDeleteVacancyMutation()
	const [deleteRes] = useDeleteResumeMutation()

	const [boostTarget, setBoostTarget] = useState<{
		id: number
		type: 'res' | 'vac'
		name: string
	} | null>(null)
	const isBoosting = isBoostingVac || isBoostingRes

	const handleToggleStatus = async (item: any, type: 'res' | 'vac') => {
		try {
			const newStatus = !item.isActive
			if (type === 'vac') {
				await updateVacStatus({
					id: item.id,
					tid: telegramId,
					isActive: newStatus,
				}).unwrap()
			} else {
				await updateResStatus({
					id: item.id,
					tid: telegramId,
					isActive: newStatus,
				}).unwrap()
			}
			showToast(
				newStatus ? 'Объявление активировано' : 'Объявление скрыто',
				'info',
			)
		} catch (e) {
			showToast('Ошибка при смене статуса', 'error')
		}
	}

	const handleDelete = async (id: number, type: 'res' | 'vac') => {
		if (
			!window.confirm(
				'Вы уверены, что хотите удалить это объявление навсегда?',
			)
		)
			return
		try {
			if (type === 'vac')
				await deleteVac({ id, tid: telegramId }).unwrap()
			else await deleteRes({ id, tid: telegramId }).unwrap()
			showToast('Удалено успешно', 'success')
		} catch (e) {
			showToast('Ошибка при удалении', 'error')
		}
	}

	const handleApplyBoost = async () => {
		if (!boostTarget) return
		try {
			if (boostTarget.type === 'res')
				await boostResume({
					id: boostTarget.id,
					tid: telegramId,
				}).unwrap()
			else
				await boostVacancy({
					id: boostTarget.id,
					tid: telegramId,
				}).unwrap()
			showToast('Объявление поднято в ТОП! 🚀', 'success')
			setBoostTarget(null)
		} catch (e: any) {
			showToast(e.data?.message || 'Недостаточно баллов', 'error')
		}
	}

	const renderCard = (item: any, type: 'res' | 'vac') => (
		<Panel key={item.id} style={{ opacity: item.isActive ? 1 : 0.75 }}>
			<div className='flex items-start gap-3'>
				<div className='flex-1 min-w-0'>
					<div
						className='wk-clamp2'
						style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.015em' }}
					>
						{type === 'res' ? item.name : item.title}
					</div>
					<div className='wk-xs' style={{ marginTop: 3 }}>
						{[item.cityName, item.categoryName].filter(Boolean).join(' · ')}
					</div>
				</div>
				{item.isActive ? (
					<StatusPill tone='ok'>Активно</StatusPill>
				) : (
					<StatusPill tone='muted'>Скрыто</StatusPill>
				)}
			</div>

			{type === 'vac' && (
				<button
					type='button'
					className='wk-applink wk-press'
					onClick={() => navigate(`/applicants/${item.id}`)}
				>
					<span>
						Отклики · <b>{appCounts[item.id]?.total || 0}</b>
					</span>
					{appCounts[item.id]?.fresh ? (
						<StatusPill tone='brand'>+{appCounts[item.id].fresh} новых</StatusPill>
					) : (
						<ChevronRight size={18} strokeWidth={1.8} />
					)}
				</button>
			)}

			<div className='flex items-center' style={{ gap: 8, marginTop: 14 }}>
				<IconButton
					className='wk-iconbtn--plain'
					label={item.isActive ? 'Скрыть' : 'Показать'}
					onClick={() => handleToggleStatus(item, type)}
				>
					{item.isActive ? (
						<EyeOff size={18} strokeWidth={1.8} />
					) : (
						<Eye size={18} strokeWidth={1.8} />
					)}
				</IconButton>
				<IconButton
					className='wk-iconbtn--plain'
					label='Редактировать'
					onClick={() =>
						navigate('/edit', { state: { type, id: item.id } })
					}
				>
					<Pencil size={18} strokeWidth={1.8} />
				</IconButton>
				<IconButton
					className='wk-iconbtn--plain'
					label='Удалить'
					style={{ color: 'var(--brand)' }}
					onClick={() => handleDelete(item.id, type)}
				>
					<Trash2 size={18} strokeWidth={1.8} />
				</IconButton>
			</div>

			<div className='grid grid-cols-2' style={{ gap: 10, marginTop: 14 }}>
				<Button
					variant='line'
					size='sm'
					onClick={() =>
						navigate('/profile-detail', {
							state: {
								type: type === 'res' ? 'worker' : 'job',
								data: item,
							},
						})
					}
				>
					Просмотр
				</Button>
				<Button
					variant='ink'
					size='sm'
					disabled={!item.isActive}
					onClick={() =>
						setBoostTarget({
							id: item.id,
							type,
							name: type === 'res' ? item.name : item.title,
						})
					}
				>
					<Rocket size={16} strokeWidth={1.8} /> Продвинуть
				</Button>
			</div>
		</Panel>
	)

	const list = activeTab === 'resumes' ? resumes : vacancies
	const listLoading =
		activeTab === 'resumes' ? resLoading : activeTab === 'vacancies' ? vacLoading : gigsLoading

	return (
		<div className='wk-screen wk-enter text-left'>
			{/* Информация о пользователе */}
			<div className='flex items-center' style={{ gap: 16 }}>
				<Avatar name={user?.firstName} src={tgUserPhoto} size={72} />
				<div className='min-w-0'>
					<h1
						className='wk-h1 truncate'
						style={{ fontSize: 26 }}
					>
						{user?.firstName || 'Профиль'}
					</h1>
					<div className='wk-meta' style={{ marginTop: 4 }}>
						ID {telegramId}
					</div>
				</div>
			</div>

			<div style={{ marginTop: 22 }}>
				<StatsBlock
					items={[
						{ value: fmtNum(resumes.length), label: 'резюме' },
						{ value: fmtNum(vacancies.length), label: 'вакансий' },
						{
							value: fmtNum(user?.balance || 0),
							label: 'баллов',
							onClick: () => navigate('/bonuses'),
						},
					]}
				/>
			</div>

			<div style={{ marginTop: 14 }}>
				<MenuList
					items={[
						{
							icon: <Wrench size={20} strokeWidth={1.8} />,
							label: 'Мои услуги',
							value: !myOffer ? 'Добавить' : myOffer.isActive ? 'Активно' : 'Скрыто',
							valueOk: !!myOffer?.isActive,
							onClick: () => navigate('/offer/edit'),
						},
						{
							icon: <Building2 size={20} strokeWidth={1.8} />,
							label: 'Моя компания',
							value: myCompany ? myCompany.name : 'Создать',
							onClick: () =>
								navigate(myCompany ? `/company/${myCompany.id}` : '/company/edit'),
						},
						{
							icon: <Send size={20} strokeWidth={1.8} />,
							label: 'Мои отклики',
							value: myApplications.length ? String(myApplications.length) : 'Нет',
							onClick: () => navigate('/my-applications'),
						},
						{
							icon: <Heart size={20} strokeWidth={1.8} />,
							label: 'Сохранённые',
							value: savedIds.length ? String(savedIds.length) : 'Нет',
							onClick: () => navigate('/saved'),
						},
						{
							icon: <Bell size={20} strokeWidth={1.8} />,
							label: 'Подписки на компании',
							value: followed.length ? String(followed.length) : 'Нет',
							onClick: () => navigate('/following'),
						},
						{
							icon: <Clapperboard size={20} strokeWidth={1.8} />,
							label: 'Сериал',
							value: '1-я серия бесплатно',
							onClick: () => navigate('/series'),
						},
						{
							icon: <Gift size={20} strokeWidth={1.8} />,
							label: 'Бонусы',
							value: 'Пригласить друга',
							onClick: () => navigate('/bonuses'),
						},
						{
							icon: <Wallet size={20} strokeWidth={1.8} />,
							label: 'Вывод',
							value: `${fmtNum(user?.balance || 0)} баллов`,
							onClick: () => navigate('/withdraw'),
						},
						{
							icon: <BellRing size={20} strokeWidth={1.8} />,
							label: 'Уведомления',
							value: 'Настроить',
							onClick: () => navigate('/notifications'),
						},
						{
							icon: <Gem size={20} strokeWidth={1.8} />,
							label: 'PRO',
							value: 'Контакты без лимита',
							onClick: () => navigate('/subscription'),
						},
					]}
				/>
			</div>

			<Tabs
				className='mt-[30px]'
				value={activeTab}
				onChange={(v) => setSearchParams({ tab: v })}
				items={[
					{
						value: 'resumes',
						label: `Резюме${resumes.length ? ` · ${resumes.length}` : ''}`,
					},
					{
						value: 'vacancies',
						label: `Вакансии${vacancies.length ? ` · ${vacancies.length}` : ''}`,
					},
					{
						value: 'gigs',
						label: `Задания${myGigs.length ? ` · ${myGigs.length}` : ''}`,
					},
				]}
			/>

			{/* Список объявлений */}
			<div className='wk-stack' style={{ marginTop: 16 }}>
				{listLoading ? (
					[0, 1].map((i) => <Skeleton key={i} height={170} />)
				) : activeTab === 'gigs' ? (
					myGigs.length > 0 ? (
						<div className='wk-panel wk-gigs' style={{ padding: '0 18px' }}>
							{myGigs.map((g) => (
								<GigRow
									key={g.id}
									time={gigTime(g.timeText)}
									day={gigDayLabel(g.workDate)}
									title={g.title}
									urgent={g.urgent}
									sub={g.isActive ? 'В ленте' : 'Снято с публикации'}
									pay={payText(g.pay)}
									onClick={() => navigate(`/gig/${g.id}`)}
								/>
							))}
						</div>
					) : (
						<EmptyState
							emoji='⚡'
							title='Заданий пока нет'
							text='Нужен человек на пару часов? Исполнители рядом получат уведомление'
							action={
								<Button size='sm' variant='ink' onClick={() => navigate('/gig/new')}>
									Создать задание
								</Button>
							}
						/>
					)
				) : list.length > 0 ? (
					list.map((i) =>
						renderCard(i, activeTab === 'resumes' ? 'res' : 'vac'),
					)
				) : (
					<EmptyState
						emoji={activeTab === 'resumes' ? '📄' : '💼'}
						title='Здесь пока пусто'
						text={
							activeTab === 'resumes'
								? 'Резюме за 60 секунд — и работодатели напишут вам'
								: 'Опубликуйте вакансию — соискатели напишут вам'
						}
						action={
							<Button
								size='sm'
								variant='ink'
								onClick={() =>
									navigate('/create', {
										state: {
											type:
												activeTab === 'resumes'
													? 'res'
													: 'vac',
										},
									})
								}
							>
								{activeTab === 'resumes'
									? 'Создать резюме'
									: 'Создать вакансию'}
							</Button>
						}
					/>
				)}
			</div>

			{/* Продвижение */}
			<Sheet
				open={!!boostTarget}
				onClose={() => setBoostTarget(null)}
				title='Продвижение'
				subtitle={
					<>
						Поднимите «
						<b style={{ color: 'var(--ink)' }}>{boostTarget?.name}</b>»
						в ТОП на 24 часа.
					</>
				}
			>
				<Button
					variant='red'
					block
					loading={isBoosting}
					onClick={handleApplyBoost}
				>
					Поднять за 400 баллов
				</Button>
				<p className='wk-note'>
					Баланс: {fmtNum(user?.balance || 0)} баллов
				</p>
			</Sheet>
		</div>
	)
}
export const DetailRow = ({
	icon,
	label,
	value,
}: {
	icon: any
	label: string
	value: string
}) => (
	<div className='flex items-center gap-4 group'>
		{/* Фон иконки: bg-main (белый/черный), рамка прозрачная */}
		<div className='w-10 h-10 rounded-xl bg-main border border-white/5 flex items-center justify-center text-red-700 shadow-sm transition-transform group-hover:scale-105'>
			{icon}
		</div>
		<div className='text-left'>
			{/* Метка: text-hint (серый) */}
			<p className='text-[9px] font-black text-hint uppercase tracking-widest leading-none mb-1'>
				{label}
			</p>
			{/* Значение: text-main (черный в светлой, белый в темной) */}
			<p className='text-xs font-bold text-main leading-none'>{value}</p>
		</div>
	</div>
)
// Small Icons
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

const WithdrawPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()

	// RTK Query: Данные пользователя для баланса
	const { data: user } = useGetUserQuery(telegramId)
	const [withdrawPoints, { isLoading }] = useWithdrawPointsMutation()

	const [amount, setAmount] = useState('')
	const [recipientPhone, setRecipientPhone] = useState('+996')
	const [selectedBankKey, setSelectedBankKey] = useState<string>(
		Object.keys(BANK_SERVICES)[0],
	)

	const somAmount = useMemo(() => {
		const val = parseFloat(amount) || 0
		return (val * 0.05).toFixed(2) // 1 балл = 0.05 сома
	}, [amount])

	const handleWithdraw = async () => {
		const val = Number(amount)
		if (!val || val <= 0) return showToast('Введите сумму', 'error')
		if (user && val > user.balance)
			return showToast('Недостаточно средств', 'error')

		try {
			await withdrawPoints({
				tid: telegramId,
				data: {
					pointsAmount: val,
					serviceId: BANK_SERVICES[selectedBankKey].id,
					recipientPhone: recipientPhone,
				},
			}).unwrap()
			showToast(
				'Запрос на вывод создан. Средства поступят в течение нескольких минут.',
			)
			navigate('/profile')
		} catch (e) {
			showToast('Ошибка при выводе', 'error')
		}
	}

	const balance = user?.balance || 0
	const overBalance = !!user && Number(amount) > balance

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader title='Вывод' onBack={() => navigate(-1)} />

			<div className='text-center' style={{ marginTop: 10 }}>
				<div className='wk-xs'>Вы получите</div>
				<div
					style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.04em', marginTop: 4 }}
				>
					{fmtMoney(somAmount)} сом
				</div>
				<div className='wk-sub'>доступно {fmtNum(balance)} баллов</div>
			</div>

			<div style={{ marginTop: 26 }}>
				<FormField
					label='Баллов к выводу'
					hint='Без комиссии · 100 баллов = 5 сом'
					error={overBalance ? 'Недостаточно баллов' : undefined}
				>
					<div className='relative'>
						<input
							type='number'
							inputMode='numeric'
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder='1 000'
							className={cx('wk-input', overBalance && 'is-error')}
							style={{ paddingRight: 80 }}
						/>
						<button
							type='button'
							className='wk-chip absolute right-2 top-1/2 -translate-y-1/2'
							style={{ height: 34 }}
							onClick={() => setAmount(String(balance))}
						>
							Всё
						</button>
					</div>
				</FormField>

				<div className='wk-field'>
					<label className='wk-label'>Куда</label>
					<div className='grid grid-cols-2' style={{ gap: 10 }}>
						{Object.entries(BANK_SERVICES).map(([key, b]) => {
							const active = key === selectedBankKey
							return (
								<button
									type='button'
									key={key}
									onClick={() => {
										wkHaptic.select()
										setSelectedBankKey(key)
									}}
									className='flex items-center text-left'
									style={{
										gap: 10,
										background: 'var(--card)',
										borderRadius: 16,
										padding: 12,
										boxShadow: 'var(--sh)',
										border: `2px solid ${active ? 'var(--ink)' : 'transparent'}`,
									}}
								>
									<span
										className='relative flex items-center justify-center overflow-hidden shrink-0'
										style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--soft)', fontWeight: 800, fontSize: 14, color: 'var(--ink2)' }}
									>
										{b.name.charAt(0)}
										<img
											src={b.icon}
											alt=''
											className='absolute'
											style={{ width: 22, height: 22, objectFit: 'contain', background: 'var(--soft)', boxShadow: '0 0 0 6px var(--soft)' }}
											onError={(e) => (e.currentTarget.style.display = 'none')}
										/>
									</span>
									<span
										className='truncate'
										style={{ fontSize: 14, fontWeight: 600 }}
									>
										{b.name}
									</span>
								</button>
							)
						})}
					</div>
				</div>

				<FormField
					label='Номер телефона'
					hint='Деньги придут в течение 24 часов'
				>
					<input
						type='tel'
						inputMode='tel'
						value={recipientPhone}
						onChange={(e) =>
							setRecipientPhone(formatPhoneKG(e.target.value))
						}
						placeholder='+996'
						className='wk-input'
					/>
				</FormField>
			</div>

			<Button
				variant='red'
				block
				style={{ marginTop: 28 }}
				loading={isLoading}
				disabled={overBalance}
				onClick={handleWithdraw}
			>
				Вывести {fmtMoney(somAmount)} сом
			</Button>
		</div>
	)
}
// Интерфейс на основе данных из Swagger
interface SubscriptionStatus {
	hasActiveSubscription: boolean
	planType: 'THREE_DAYS' | 'ONE_WEEK' | 'ONE_MONTH' | null
	startDate: string | null
	endDate: string | null
	daysLeft: number
}

export const SubscriptionPage: React.FC<{ telegramId: number }> = ({
	telegramId,
}) => {
	const navigate = useNavigate()
	const { showToast } = useToast()

	const { data: status, isLoading: pageLoading } =
		useGetSubscriptionStatusQuery(telegramId)

	const [createPayment, { isLoading: isMutationLoading, data }] =
		useCreatePaymentMutation()

	const plans = [
		{
			id: 'ONE_WEEK',
			name: '1 Неделя',
			price: '149 сом',
			desc: 'Быстрый старт',
			icon: '🔥',
		},
		{
			id: 'ONE_MONTH',
			name: '1 Месяц',
			price: '290 сом',
			desc: 'Популярный выбор',
			icon: '💎',
		},
		{
			id: 'THREE_MONTHS',
			name: '3 Месяца',
			price: '490 сом',
			desc: 'Максимальная выгода',
			icon: '🚀',
		},
	]

	const buy = async (planId: string) => {
		try {
			const res = await createPayment({
				tid: telegramId,
				planType: planId,
			}).unwrap()
			if (res?.paymentUrl) {
				if (window.Telegram?.WebApp) {
					window.Telegram.WebApp.openLink(res.paymentUrl, {
						try_instant_view: false,
					})
				} else {
					window.location.href = res.paymentUrl
				}
			}
		} catch (e) {
			showToast('Ошибка при формировании оплаты', 'error')
		}
	}

	if (pageLoading) return <Loader />

	const active = !!status?.hasActiveSubscription

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title='PRO'
				subtitle='Пишите работодателям и сотрудникам без лимита'
				onBack={() => navigate(-1)}
			/>

			{/* Статус */}
			<div
				className='wk-balance'
				style={{
					background: active
						? 'linear-gradient(140deg, #052E22, #0E9F6E)'
						: 'linear-gradient(140deg, #0F0F14, #3F3F46)',
				}}
			>
				<div style={{ fontSize: 12.5, opacity: 0.7 }}>Статус</div>
				<div
					style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.03em', marginTop: 4 }}
				>
					{active ? 'PRO активен' : 'Базовый доступ'}
				</div>
				<div style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>
					{active
						? `До ${status?.endDate ? new Date(status.endDate).toLocaleDateString('ru-RU') : '—'} · осталось ${status?.daysLeft} ${plural(status?.daysLeft || 0, ['день', 'дня', 'дней'])}`
						: 'Бесплатно: 3 контакта в день'}
				</div>
			</div>

			{!active && (
				<div
					style={{
						marginTop: 14,
						background: 'var(--brand-soft)',
						color: 'var(--brand)',
						fontSize: 12.5,
						fontWeight: 600,
						borderRadius: 12,
						padding: '8px 12px',
					}}
				>
					🔥 Эта тарификация действует только до 31 декабря
				</div>
			)}

			<SectionHead title='Тарифы' />
			<div className='wk-stack'>
				{plans?.map((p) => {
					const isActivePlan = active && status?.planType === p.id
					const isThisPlanLoading =
						isMutationLoading && data?.planType === p.id
					return (
						<SheetOption
							key={p.id}
							icon={p.icon}
							iconBg={
								p.id === 'ONE_MONTH' ? 'var(--brand-soft)' : 'var(--track)'
							}
							title={
								<span className='flex items-center gap-2'>
									{p.name}
									{p.id === 'ONE_MONTH' && !isActivePlan && (
										<StatusPill tone='brand'>Популярный</StatusPill>
									)}
									{isActivePlan && (
										<StatusPill tone='ok'>Активно</StatusPill>
									)}
								</span>
							}
							subtitle={isActivePlan ? 'Ваш текущий тариф' : p.desc}
							selected={isActivePlan}
							disabled={isMutationLoading && !isThisPlanLoading}
							onClick={() => !isActivePlan && buy(p.id)}
							right={
								isThisPlanLoading ? (
									<span className='wk-spinner' />
								) : (
									<span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
										{p.price}
									</span>
								)
							}
						/>
					)
				})}
			</div>

			<SectionHead title='Что даёт PRO' />
			<Panel className='space-y-4'>
				<BenefitItem
					icon='🔓'
					title='Контакты без лимита'
					desc='Смотрите номера всех работодателей без ограничений'
				/>
				<BenefitItem
					icon='⚡'
					title='Без очереди'
					desc='Мгновенная модерация ваших публикаций'
				/>
			</Panel>
		</div>
	)
}

const BenefitItem = ({
	icon,
	title,
	desc,
}: {
	icon: string
	title: string
	desc: string
}) => (
	<div className='flex items-start' style={{ gap: 14 }}>
		<span
			className='flex items-center justify-center shrink-0'
			style={{ width: 42, height: 42, borderRadius: 14, background: 'var(--soft)', fontSize: 20 }}
		>
			{icon}
		</span>
		<div>
			<div style={{ fontWeight: 600 }}>{title}</div>
			<div className='wk-xs' style={{ marginTop: 2 }}>
				{desc}
			</div>
		</div>
	</div>
)

export const BonusesPage: React.FC<{ telegramId: number }> = ({
	telegramId,
}) => {
	const navigate = useNavigate()
	const { showToast } = useToast()

	// RTK Query: Информация о рефералах
	const {
		data: info,
		isLoading,
		refetch,
	} = useGetReferralInfoQuery(telegramId)

	// Логика конвертации (1 балл = 0.05 сома)
	const totalEarned =
		(info?.referralsCount || 0) * (info?.rewardPerReferral || 0)
	const somEquivalent = (totalEarned * 0.05).toFixed(2)

	const copyToClipboard = (text: string) => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text)
			showToast('Ссылка скопирована!', 'success')
		}
	}

	const handleShare = () => {
		if (!info?.referralLink) return
		const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(info.referralLink)}&text=${encodeURIComponent('Зарабатывай вместе с WORK KG! 💸')}`
		tg.openTelegramLink(shareUrl)
		tg.HapticFeedback.impactOccurred('medium')
	}

	// Задания «Подпишитесь на канал»: открыть канал → «Проверить» (бэкенд: POST /bot/tasks/{id}/check)
	const { data: tasks } = useGetSocialTasksQuery(telegramId)
	const [checkTask] = useCheckTaskMutation()
	const [checking, setChecking] = useState<number | null>(null)
	const [opened, setOpened] = useState<Record<number, boolean>>({})

	const openTask = (task: SocialTask) => {
		setOpened((p) => ({ ...p, [task.id]: true }))
		if (/^https?:\/\/t(elegram)?\.me\//.test(task.link) && tg?.openTelegramLink) tg.openTelegramLink(task.link)
		else if (tg?.openLink) tg.openLink(task.link)
		else window.open(task.link, '_blank')
	}

	const handleTask = async (task: SocialTask) => {
		if (!opened[task.id]) {
			openTask(task)
			return
		}
		setChecking(task.id)
		try {
			const res = await checkTask({ tid: telegramId, taskId: task.id }).unwrap()
			if (res.status === 'DONE') {
				showToast(`Успешно! Начислено ${res.earned} баллов`, 'success')
				refetch()
			} else if (res.status === 'ALREADY_DONE') {
				showToast('Задание уже выполнено', 'info')
			} else if (res.status === 'NOT_SUBSCRIBED') {
				showToast('Сначала подпишитесь на канал', 'error')
				openTask(task)
			} else {
				showToast(res.message || 'Не удалось проверить подписку. Попробуйте позже', 'error')
			}
		} catch (e: any) {
			showToast(e?.data?.message || 'Нет связи с сервером. Попробуйте ещё раз', 'error')
		} finally {
			setChecking(null)
		}
	}

	if (isLoading) return <Loader />

	return (
		<div className='wk-screen wk-enter text-left'>
			<h1 className='wk-h1'>Бонусы</h1>
			<p className='wk-sub' style={{ marginTop: 8 }}>
				Приглашайте друзей и выводите баллы на карту или кошелёк
			</p>

			<div className='wk-balance' style={{ marginTop: 22 }}>
				<div style={{ fontSize: 12.5, opacity: 0.7 }}>
					Заработано на приглашениях
				</div>
				<div
					style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.03em', marginTop: 2 }}
				>
					{fmtNum(totalEarned)}
				</div>
				<div style={{ fontSize: 14, opacity: 0.8 }}>
					баллов ≈ {fmtMoney(somEquivalent)} сом · 100 баллов = 5 сом
				</div>
				<Button
					variant='white'
					block
					style={{ marginTop: 18 }}
					onClick={() => navigate('/withdraw')}
				>
					Вывести
				</Button>
			</div>

			<div style={{ marginTop: 14 }}>
				<StatsBlock
					items={[
						{ value: fmtNum(info?.referralsCount || 0), label: 'приглашено' },
						{ value: `+${fmtNum(info?.rewardPerReferral || 0)}`, label: 'за друга' },
						{ value: fmtMoney(somEquivalent), label: 'сом' },
					]}
				/>
			</div>

			<Panel style={{ marginTop: 14 }}>
				<div className='wk-h3'>
					Пригласите друга — +{fmtNum(info?.rewardPerReferral || 0)} баллов
				</div>
				<div className='wk-xs' style={{ marginTop: 4 }}>
					Когда друг опубликует резюме или вакансию
				</div>
				<div
					className='flex items-center'
					style={{
						gap: 8,
						marginTop: 14,
						background: 'var(--soft)',
						borderRadius: 14,
						padding: '6px 6px 6px 14px',
					}}
				>
					<span className='wk-xs truncate flex-1'>{info?.referralLink}</span>
					<IconButton
						label='Копировать'
						className='wk-iconbtn--plain'
						style={{ background: 'var(--card)', width: 36, height: 36 }}
						onClick={() => info && copyToClipboard(info.referralLink)}
					>
						<Copy size={16} strokeWidth={1.8} />
					</IconButton>
				</div>
				<Button
					variant='ink'
					size='sm'
					block
					style={{ marginTop: 12 }}
					onClick={handleShare}
				>
					<Send size={16} strokeWidth={1.8} /> Поделиться ссылкой
				</Button>
			</Panel>

			{!!tasks?.availableTasks?.length && (
				<>
					<SectionHead title='Задания' />
					{tasks.availableTasks.map((task) => (
						<SheetOption
							key={task.id}
							icon={task.type === 'TELEGRAM' ? '✈️' : '⭐️'}
							title={task.title}
							subtitle={`+${fmtNum(task.reward)} баллов за подписку`}
							onClick={() => handleTask(task)}
							right={
								<span
									className='wk-btn wk-btn--line wk-btn--xs'
									style={{ pointerEvents: 'none' }}
								>
									{checking === task.id ? '…' : opened[task.id] ? 'Проверить' : 'Подписаться'}
								</span>
							}
						/>
					))}
				</>
			)}
		</div>
	)
}
// --- CORE APP ---
const AppContent: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [isPlusOpen, setIsPlusOpen] = useState(false)
	// Лист «Что публикуем?» не должен оставаться открытым после перехода (в т.ч. кнопкой «назад»)
	useEffect(() => setIsPlusOpen(false), [location.pathname])
	const { tg, haptic, setHeader } = useTMA()

	// Определяем ID пользователя Telegram
	const telegramId = tg?.initDataUnsafe?.user?.id || 1810333455

	// --- RTK QUERY ХУКИ ---
	// 1. Получаем данные пользователя
	const {
		data: user,
		isLoading: isUserLoading,
		isError: isUserError,
	} = useGetUserQuery(telegramId)

	// 2. Мутация для регистрации
	const [registerUser] = useRegisterUserMutation()
	const { data: plusCompany } = useGetMyCompanyQuery(telegramId)
	// Счётчик на табе «Сделки»: вопросы без ответа + запросы на подтверждение
	const { data: dealsPending } = useGetDealsPendingQuery(telegramId, { pollingInterval: 60000 })

	// Переход из уведомления бота: ?open=vac_123 | res_123 | gig_123 | svc_123 | company_123 | pro (или start_param Telegram)
	useEffect(() => {
		const open =
			new URLSearchParams(window.location.search).get('open') ||
			tg?.initDataUnsafe?.start_param
		if (!open) return
		const m = /^(vac|res)_(\d+)$/.exec(open)
		if (m) navigate(`/detail/${m[2]}?type=${m[1] === 'vac' ? 'job' : 'worker'}`)
		else if (/^gig_\d+$/.test(open)) navigate(`/gig/${open.slice(4)}`)
		else if (/^svc_\d+$/.test(open)) navigate(`/offer/${open.slice(4)}`)
		else if (/^company_\d+$/.test(open)) navigate(`/company/${open.slice(8)}`)
		else if (/^app_\d+$/.test(open)) navigate(`/application/${open.slice(4)}`)
		else if (open === 'myapps') navigate('/my-applications')
		else if (open === 'notify') navigate('/notifications')
		else if (open === 'deals') navigate('/deals')
		else if (open === 'deals_e') navigate('/deals?tab=employer')
		else if (open === 'saved') navigate('/saved')
		else if (open === 'series') navigate('/series')
		else if (/^series_\d+$/.test(open)) navigate(`/series/${open.slice(7)}`)
		else if (open === 'pro') navigate('/subscription')
	}, [])

	// username мог появиться/смениться после регистрации — без него кнопка «Telegram» у объявлений не работала
	const [syncUser] = useSyncUserMutation()
	useEffect(() => {
		const u = tg?.initDataUnsafe?.user
		if (!user || !u) return
		const fresh = (u.username || '').trim()
		if (fresh !== ((user as any).username || '').trim()) {
			syncUser({ tid: telegramId, data: { username: fresh } })
		}
	}, [user?.telegramId, (user as any)?.username])

	// Логика автоматической регистрации
	useEffect(() => {
		const performRegistration = async () => {
			// Если произошла ошибка загрузки (юзер не найден) и у нас есть данные от TG
			if (isUserError && tg?.initDataUnsafe?.user) {
				try {
					await registerUser({
						telegramId,
						username: tg.initDataUnsafe.user.username || '',
						firstName: tg.initDataUnsafe.user.first_name || '',
						lastName: tg.initDataUnsafe.user.last_name || '',
						language: 'RU',
					}).unwrap()
					// RTK Query автоматически перезапросит getUser после успешной регистрации
					// так как в mutation прописан invalidatesTags: ['User']
				} catch (err) {
					console.error('Registration failed:', err)
				}
			}
		}

		performRegistration()
	}, [isUserError, telegramId, registerUser])

	useEffect(() => {
		if (!tg) return
		tg.ready()
		tg.expand()

		// 1. Отключаем вертикальные свайпы (доступно с версии 7.7)
		if (tg.isVersionAtLeast('7.7')) {
			tg.disableVerticalSwipes()
		}

		// 2. Включаем Fullscreen (доступно с версии 8.0)
		if (tg.isVersionAtLeast('8.0')) {
			try {
				tg.requestFullscreen()
			} catch (e) {
				console.warn('Fullscreen failed', e)
			}
		}

		// 3. Защита от потери данных (всегда полезно)
		tg.enableClosingConfirmation()

		// 4. Синхронизация системных отступов
		const syncSafeAreas = () => {
			const root = document.documentElement
			if (tg.isVersionAtLeast('7.0') && tg.safeAreaInset) {
				root.style.setProperty('--sat', `${tg.safeAreaInset.top}px`)
				root.style.setProperty('--sab', `${tg.safeAreaInset.bottom}px`)
			}
		}
		tg.onEvent('safeAreaChanged', syncSafeAreas)
		syncSafeAreas()

		// 5. Обработка темы
		// Дизайн Work KG светлый: фон и шапка Telegram в цвет --bg
		const handleTheme = () => {
			document.body.style.backgroundColor = '#F6F5F2'
			if (tg.setHeaderColor) tg.setHeaderColor('#F6F5F2')
			if (tg.setBackgroundColor) tg.setBackgroundColor('#F6F5F2')
			if (tg.setBottomBarColor) tg.setBottomBarColor('#F6F5F2')
		}
		tg.onEvent('themeChanged', handleTheme)
		handleTheme()

		return () => tg.offEvent('safeAreaChanged', syncSafeAreas)
	}, [])

	useEffect(() => {
		if (!tg) return

		// Приводим к string, чтобы убрать ошибку TS2367
		const currentPath = location.pathname as string

		// 1. Управление кнопкой "Назад"
		if (currentPath === '/' || currentPath === '/home') {
			tg.BackButton.hide()
		} else {
			tg.BackButton.show()
			const onBack = () => {
				haptic.impact('light')
				navigate(-1)
			}
			tg.BackButton.onClick(onBack)
			// Важно: удаляем обработчик при размонтировании или смене пути
			return () => tg.BackButton.offClick(onBack)
		}
	}, [location.pathname])

	useEffect(() => {
		if (!tg) return

		const currentPath = location.pathname as string

		// 2. Управление кнопкой "Настройки" (SettingsButton)
		if (currentPath === '/profile') {
			tg.SettingsButton.show()
			const onSettingsClick = () => {
				haptic.impact('medium')
				tg.showAlert(
					'Настройки профиля будут доступны в следующем обновлении',
				)
			}
			tg.SettingsButton.onClick(onSettingsClick)
			return () => tg.SettingsButton.offClick(onSettingsClick)
		} else {
			tg.SettingsButton.hide()
		}
	}, [location.pathname])
	// Логика Свайпов (Назад/Вперед)
	useEffect(() => {
		let touchStartX = 0
		let touchStartY = 0
		const edgeThreshold = 70
		const swipeThreshold = 60

		const handleTouchStart = (e: TouchEvent) => {
			touchStartX = e.touches[0].clientX
			touchStartY = e.touches[0].clientY
		}

		const handleTouchEnd = (e: TouchEvent) => {
			const touchEndX = e.changedTouches[0].clientX
			const touchEndY = e.changedTouches[0].clientY
			const screenWidth = window.innerWidth
			const diffX = touchEndX - touchStartX
			const diffY = Math.abs(touchEndY - touchStartY)

			if (diffY > Math.abs(diffX) || diffY > 60) return

			// Свайп ВПРАВО (Назад)
			if (touchStartX < edgeThreshold && diffX > swipeThreshold) {
				if (
					location.pathname !== '/' &&
					location.pathname !== '/home'
				) {
					navigate(-1)
				}
			}
			// Свайп ВЛЕВО (Вперед)
			if (
				touchStartX > screenWidth - edgeThreshold &&
				diffX < -swipeThreshold
			) {
				navigate(1)
			}
		}

		window.addEventListener('touchstart', handleTouchStart, {
			passive: true,
		})
		window.addEventListener('touchend', handleTouchEnd, { passive: true })
		return () => {
			window.removeEventListener('touchstart', handleTouchStart)
			window.removeEventListener('touchend', handleTouchEnd)
		}
	}, [navigate, location.pathname])

	const showNav = ['/', '/search', '/companies', '/deals', '/profile', '/bonuses', '/games'].includes(
		location.pathname,
	)

	// Если данные еще грузятся — показываем лоадер
	if (isUserLoading) return <Loader />

	const path = location.pathname
	const openCreate = (type: 'vac' | 'res') => {
		setIsPlusOpen(false)
		navigate('/create', { state: { type } })
	}

	return (
		<div className='min-h-screen flex flex-col overflow-x-hidden' style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
			<main
				style={{ paddingTop: path === '/games' ? 'var(--sat)' : 0 }}
				className='flex-1 w-full max-w-xl mx-auto'
			>
				<Routes>
					<Route
						path='/'
						element={<HomePage user={user || null} />}
					/>
					<Route
						path='/search'
						element={<SearchPage telegramId={telegramId} />}
					/>
					<Route path='/games' element={<GamesPage />} />
					<Route
						path='/create'
						element={<CreatePage telegramId={telegramId} />}
					/>
					<Route
						path='/edit'
						element={<EditPage telegramId={telegramId} />}
					/>
					<Route
						path='/profile'
						element={<ProfilePage telegramId={telegramId} />}
					/>
					<Route
						path='/bonuses'
						element={<BonusesPage telegramId={telegramId} />}
					/>
					<Route
						path='/withdraw'
						element={<WithdrawPage telegramId={telegramId} />}
					/>
					<Route
						path='/subscription'
						element={<SubscriptionPage telegramId={telegramId} />}
					/>
					<Route
						path='/detail/:id'
						element={<DetailPage telegramId={telegramId} />}
					/>
					<Route
						path='/profile-detail'
						element={<ProfileDetail telegramId={telegramId} />}
					/>
					<Route
						path='/gig/new'
						element={<GigFormPage telegramId={telegramId} />}
					/>
					<Route
						path='/gig/:id'
						element={<GigPage telegramId={telegramId} />}
					/>
					<Route
						path='/offer/edit'
						element={<OfferFormPage telegramId={telegramId} />}
					/>
					<Route
						path='/offer/:id'
						element={<OfferPage telegramId={telegramId} />}
					/>
					<Route
						path='/companies'
						element={<CompaniesPage telegramId={telegramId} />}
					/>
					<Route
						path='/company/edit'
						element={<CompanyFormPage telegramId={telegramId} />}
					/>
					<Route
						path='/company/:id'
						element={<CompanyPage telegramId={telegramId} />}
					/>
					<Route
						path='/application/:id'
						element={<ApplicationPage telegramId={telegramId} />}
					/>
					<Route
						path='/applicants/:vacancyId'
						element={<ApplicantsPage telegramId={telegramId} />}
					/>
					<Route
						path='/my-applications'
						element={<MyApplicationsPage telegramId={telegramId} />}
					/>
					<Route path='/saved' element={<SavedPage telegramId={telegramId} />} />
					<Route path='/series' element={<SeriesListPage telegramId={telegramId} />} />
					<Route path='/series/:id' element={<SeriesPage telegramId={telegramId} />} />
					<Route path='/deals' element={<DealsPage telegramId={telegramId} />} />
					<Route path='/deal/:id/review' element={<ReviewPage telegramId={telegramId} />} />
					<Route path='/notifications' element={<NotifySettingsPage telegramId={telegramId} />} />
					<Route
						path='/following'
						element={<FollowingPage telegramId={telegramId} />}
					/>
					{import.meta.env.DEV && (
						<Route path='/ui-kit' element={<UiKit />} />
					)}
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</main>
			{showNav && (
				<nav className='wk-tabbar' aria-label='Навигация'>
					<NavTab
						active={path === '/'}
						icon={<Home size={22} strokeWidth={1.8} />}
						label='Главная'
						onClick={() => navigate('/')}
					/>
					<NavTab
						active={path === '/companies'}
						icon={<Building2 size={22} strokeWidth={1.8} />}
						label='Компании'
						onClick={() => navigate('/companies')}
					/>
					<button
						aria-label='Создать'
						onClick={() => {
							haptic.impact('medium')
							setIsPlusOpen(true)
						}}
						className='wk-tabbar__plus'
					>
						<Plus size={22} strokeWidth={2} />
					</button>
					<NavTab
						active={path === '/deals'}
						icon={<BriefcaseBusiness size={22} strokeWidth={1.8} />}
						label='Сделки'
						badge={dealsPending?.count}
						onClick={() => navigate('/deals')}
					/>
					<NavTab
						active={path === '/profile'}
						icon={<UserLucide size={22} strokeWidth={1.8} />}
						label='Профиль'
						onClick={() => navigate('/profile')}
					/>
				</nav>
			)}
			<Sheet
				open={isPlusOpen}
				onClose={() => setIsPlusOpen(false)}
				title='Что публикуем?'
			>
				<div className='wk-stack'>
					<SheetOption
						icon={<BriefcaseBusiness size={22} strokeWidth={1.8} />}
						iconBg='var(--ink)'
						iconColor='#fff'
						title='Вакансия'
						subtitle='Ищу сотрудника в штат'
						onClick={() => openCreate('vac')}
					/>
					<SheetOption
						icon={<FileText size={22} strokeWidth={1.8} />}
						title='Резюме'
						subtitle='Ищу постоянную работу'
						onClick={() => openCreate('res')}
					/>
					<SheetOption
						icon={<Zap size={22} strokeWidth={1.8} />}
						iconBg='var(--gig-soft)'
						iconColor='var(--gig)'
						title='Разовое задание'
						subtitle='Нужен человек на пару часов или день'
						onClick={() => {
							setIsPlusOpen(false)
							navigate('/gig/new')
						}}
					/>
					<SheetOption
						icon={<Wrench size={22} strokeWidth={1.8} />}
						iconBg='var(--ok-soft)'
						iconColor='var(--ok)'
						title='Мои услуги'
						subtitle='Готов к подработке'
						onClick={() => {
							setIsPlusOpen(false)
							navigate('/offer/edit')
						}}
					/>
					<SheetOption
						icon={<Building2 size={22} strokeWidth={1.8} />}
						iconBg='#E8F1FD'
						iconColor='var(--tick)'
						title={plusCompany ? 'Моя компания' : 'Компания'}
						subtitle={
							plusCompany
								? `${plusCompany.name} · фото, описание, отзывы`
								: 'Профиль работодателя с фото и отзывами'
						}
						onClick={() => {
							setIsPlusOpen(false)
							navigate(plusCompany ? `/company/${plusCompany.id}` : '/company/edit')
						}}
					/>
				</div>
			</Sheet>
		</div>
	)
}

const NavTab = ({ active, icon, label, onClick, badge }: any) => {
	const handleClick = () => {
		tg?.HapticFeedback?.selectionChanged()
		onClick()
	}
	return (
		<button
			onClick={handleClick}
			aria-current={active ? 'page' : undefined}
			className={cx('wk-tabbar__item', active && 'is-active')}
		>
			{icon}
			<span>{label}</span>
			{badge > 0 && <span className='wk-tabbar__badge'>{badge > 9 ? '9+' : badge}</span>}
		</button>
	)
}

const HomeIcon = () => (
	<svg
		className='w-6 h-6'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		/>
	</svg>
)
const SearchIcon = () => (
	<svg
		className='w-6 h-6'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
		/>
	</svg>
)
const StarIcon = () => (
	<svg
		className='w-6 h-6'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2.5'
			d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12V3c0-1.105-.895-2-2-2h-4c-1.105 0-2 .895-2 2v2M6 5v1M6 5H5C3.895 5 3 5.895 3 7v10c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2h-1M18 5v1'
		/>
	</svg>
)
const PlusIcon = () => (
	<svg
		className='w-8 h-8'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='3'
			d='M12 6v12m6-6H6'
		/>
	</svg>
)
const UserIcon = () => (
	<svg
		className='w-6 h-6'
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
const BellIcon = () => (
	<svg
		className='w-6 h-6 text-slate-800'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='2'
			d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
		/>
	</svg>
)
const SearchIconSmall = () => (
	<svg
		className='w-5 h-5'
		fill='none'
		stroke='currentColor'
		viewBox='0 0 24 24'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='3'
			d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
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

const App: React.FC = () => (
	<HashRouter>
		<ToastProvider>
			<LocationProvider>
				<AppContent />
			</LocationProvider>
		</ToastProvider>
	</HashRouter>
)
export default App

// import React, {
// 	useState,
// 	useEffect,
// 	useCallback,
// 	useMemo,
// 	useContext,
// 	useRef,
// } from 'react'
// import {
// 	HashRouter,
// 	Routes,
// 	Route,
// 	useNavigate,
// 	useLocation,
// 	Navigate,
// } from 'react-router-dom'
// import { apiService } from './apiService'
// import { geminiService } from './geminiService'
// import { LOCALES, BANK_SERVICES, formatPhoneKG } from './constants'
// import {
// 	User,
// 	Resume,
// 	Vacancy,
// 	City,
// 	Sphere,
// 	Category,
// 	Subcategory,
// 	ReferralInfo,
// 	AccessStatus,
// } from './types'

// const tg = (window as any).Telegram?.WebApp

// // --- SHARED COMPONENTS ---

// const ToastContext = React.createContext<{
// 	showToast: (message: string, type?: 'success' | 'error') => void
// }>({ showToast: () => {} })

// const useToast = () => useContext(ToastContext)

// const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
// 	children,
// }) => {
// 	const [toast, setToast] = useState<{
// 		message: string
// 		type: 'success' | 'error'
// 	} | null>(null)
// 	const showToast = useCallback(
// 		(message: string, type: 'success' | 'error' = 'success') => {
// 			setToast({ message, type })
// 			setTimeout(() => setToast(null), 3000)
// 		},
// 		[],
// 	)

// 	return (
// 		<ToastContext.Provider value={{ showToast }}>
// 			{children}
// 			{toast && (
// 				<div className='fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm'>
// 					<div
// 						className={`p-4 rounded-2xl shadow-2xl flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'brand-gradient text-white' : 'bg-rose-600 text-white'}`}
// 					>
// 						<div className='text-sm font-bold'>{toast.message}</div>
// 					</div>
// 				</div>
// 			)}
// 		</ToastContext.Provider>
// 	)
// }

// export const ElegantSelect: React.FC<{
// 	label?: string
// 	value: string | number | null
// 	options: { id: string | number; name: string; icon?: string }[]
// 	placeholder: string
// 	onChange: (id: any) => void
// 	disabled?: boolean
// }> = ({ label, value, options, placeholder, onChange, disabled }) => {
// 	const [isOpen, setIsOpen] = useState(false)
// 	const selectedOption = options.find((o) => o.id === value)

// 	const renderIcon = (icon?: string, name?: string) => {
// 		if (!icon) return null
// 		const isUrl = icon.startsWith('http') || icon.startsWith('data:')
// 		return (
// 			<div className='w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden rounded-lg'>
// 				{isUrl ? (
// 					<img
// 						src={icon}
// 						alt={name}
// 						className='w-full h-full object-contain'
// 					/>
// 				) : (
// 					<span className='text-xl'>{icon}</span>
// 				)}
// 			</div>
// 		)
// 	}

// 	return (
// 		<div
// 			className={`relative w-full ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}
// 		>
// 			{label && (
// 				<label className='block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 px-1 text-left'>
// 					{label}
// 				</label>
// 			)}
// 			<button
// 				type='button'
// 				onClick={() => !disabled && setIsOpen(!isOpen)}
// 				className={`w-full flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm active:bg-slate-50 transition-all ${isOpen ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-slate-100'}`}
// 			>
// 				<div className='flex items-center gap-3 overflow-hidden'>
// 					{selectedOption &&
// 						renderIcon(selectedOption.icon, selectedOption.name)}
// 					<span
// 						className={`font-bold text-sm truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}
// 					>
// 						{selectedOption ? selectedOption.name : placeholder}
// 					</span>
// 				</div>
// 				<svg
// 					className={`w-5 h-5 text-indigo-300 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
// 					fill='none'
// 					stroke='currentColor'
// 					viewBox='0 0 24 24'
// 				>
// 					<path
// 						strokeLinecap='round'
// 						strokeLinejoin='round'
// 						strokeWidth='2.5'
// 						d='M19 9l-7 7-7-7'
// 					/>
// 				</svg>
// 			</button>

// 			{isOpen && (
// 				<>
// 					<div
// 						className='fixed inset-0 z-[160] bg-black/5'
// 						onClick={() => setIsOpen(false)}
// 					/>
// 					<div className='absolute top-full left-0 right-0 mt-2 z-[170] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto no-scrollbar'>
// 						{options.map((opt) => (
// 							<button
// 								key={opt.id}
// 								onClick={() => {
// 									onChange(opt.id)
// 									setIsOpen(false)
// 								}}
// 								className={`w-full flex items-center gap-4 p-4 text-left border-b border-slate-50 last:border-0 active:bg-indigo-50 ${String(value) === String(opt.id) ? 'bg-indigo-50/50' : ''}`}
// 							>
// 								{renderIcon(opt.icon, opt.name)}
// 								<span
// 									className={`font-bold text-sm flex-1 ${String(value) === String(opt.id) ? 'text-indigo-600' : 'text-slate-700'}`}
// 								>
// 									{opt.name}
// 								</span>
// 								{String(value) === String(opt.id) && (
// 									<span className='ml-auto text-indigo-600 font-bold text-lg'>
// 										✓
// 									</span>
// 								)}
// 							</button>
// 						))}
// 					</div>
// 				</>
// 			)}
// 		</div>
// 	)
// }

// const BottomSheet: React.FC<{
// 	isOpen: boolean
// 	onClose: () => void
// 	title: string
// 	description?: string
// 	children: React.ReactNode
// }> = ({ isOpen, onClose, title, description, children }) => {
// 	if (!isOpen) return null
// 	return (
// 		<div className='fixed inset-0 z-[150] flex items-end justify-center'>
// 			<div
// 				className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm'
// 				onClick={onClose}
// 			/>
// 			<div className='relative w-full max-w-xl bg-white rounded-t-[2.5rem] shadow-2xl p-8 pb-12 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[85vh]'>
// 				<div className='w-12 h-1 bg-slate-100 rounded-full mx-auto mb-8 flex-shrink-0' />
// 				<div className='text-center mb-8 flex-shrink-0'>
// 					<h2 className='text-2xl font-black text-slate-900 leading-tight'>
// 						{title}
// 					</h2>
// 					{description && (
// 						<p className='text-slate-500 text-sm mt-2 font-medium'>
// 							{description}
// 						</p>
// 					)}
// 				</div>
// 				<div className='space-y-3'>{children}</div>
// 				<button
// 					onClick={onClose}
// 					className='w-full mt-6 py-2 text-slate-400 text-xs font-bold uppercase tracking-widest flex-shrink-0'
// 				>
// 					Закрыть
// 				</button>
// 			</div>
// 		</div>
// 	)
// }

// const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({
// 	label,
// 	children,
// }) => (
// 	<div className='space-y-2'>
// 		<label className='text-[10px] font-black text-indigo-300 uppercase tracking-widest px-1'>
// 			{label}
// 		</label>
// 		{children}
// 	</div>
// )

// // --- PAGES ---

// const HomePage: React.FC<{ user: User | null }> = ({ user }) => {
// 	const navigate = useNavigate()
// 	const spheres = [
// 		{ id: 1, name: 'IT', icon: '💻' },
// 		{ id: 2, name: 'Horeca', icon: '☕️' },
// 		{ id: 3, name: 'Магазины', icon: '🏪' },
// 		{ id: 4, name: 'Логистика', icon: '🚚' },
// 		{ id: 5, name: 'Ремонт', icon: '🛠' },
// 		{ id: 6, name: 'Бьюти', icon: '💅' },
// 	]

// 	return (
// 		<div className='pb-40 animate-in fade-in duration-500 bg-white min-h-screen'>
// 			<header className='px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-indigo-50/50'>
// 				<div className='flex items-center gap-2'>
// 					<div className='text-2xl font-black tracking-tighter uppercase italic brand-text-gradient'>
// 						AVA
// 					</div>
// 				</div>
// 				<button className='w-10 h-10 bg-indigo-50/50 flex items-center justify-center rounded-xl relative active:scale-95 transition-transform'>
// 					<BellIcon />
// 					<div className='absolute top-3 right-3 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white'></div>
// 				</button>
// 			</header>

// 			<div className='px-6 mb-5 mt-4'>
// 				<div className='brand-gradient p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl brand-shadow'>
// 					<div className='space-y-1'>
// 						<h3 className='text-lg font-black uppercase tracking-tighter'>
// 							Быстрый старт 🚀
// 						</h3>
// 						<p className='text-[10px] text-indigo-100 font-bold uppercase'>
// 							Заполни профиль за 1 минуту
// 						</p>
// 					</div>
// 					<button
// 						onClick={() =>
// 							navigate('/create', { state: { type: 'res' } })
// 						}
// 						className='bg-white text-indigo-600 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95'
// 					>
// 						Начать
// 					</button>
// 				</div>
// 			</div>
// 			<div className='px-6 mb-8'>
// 				<div
// 					onClick={() => navigate('/subscription')}
// 					className='bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden active:scale-[0.98] transition-all'
// 				>
// 					<div className='absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full'></div>
// 					<div className='space-y-1 text-left relative z-10'>
// 						<h3 className='text-lg font-black uppercase tracking-tighter text-amber-400'>
// 							FASTJOB PRO 💎
// 						</h3>
// 						<p className='text-[10px] text-indigo-200 font-bold uppercase'>
// 							Открой все контакты сразу
// 						</p>
// 					</div>
// 					<span className='bg-white/10 p-3 rounded-full relative z-10 text-xl'>
// 						✨
// 					</span>
// 				</div>
// 			</div>
// 			<div className='overflow-x-auto no-scrollbar flex gap-4 px-6 mb-8 mt-2'>
// 				{spheres.map((s) => (
// 					<div
// 						key={s.id}
// 						onClick={() =>
// 							navigate('/search', { state: { initialSphere: s } })
// 						}
// 						className='flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group'
// 					>
// 						<div className='w-16 h-16 bg-white border border-indigo-50 shadow-sm rounded-2xl flex items-center justify-center text-2xl transition-all group-active:scale-95 group-active:bg-indigo-50 group-hover:border-indigo-200'>
// 							{s.icon}
// 						</div>
// 						<span className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
// 							{s.name}
// 						</span>
// 					</div>
// 				))}
// 			</div>

// 			<div className='px-6 mb-10'>
// 				<div className='relative' onClick={() => navigate('/search')}>
// 					<div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-indigo-400'>
// 						<SearchIconSmall />
// 					</div>
// 					<input
// 						readOnly
// 						placeholder='Кофейни, рестораны, вакансии...'
// 						className='w-full bg-indigo-50/30 border-none h-14 pl-12 pr-4 rounded-2xl text-sm font-medium focus:outline-none placeholder:text-indigo-300'
// 					/>
// 				</div>
// 			</div>

// 			<div className='px-6 space-y-6'>
// 				<div className='flex justify-between items-center'>
// 					<h3 className='text-lg font-black text-slate-900'>
// 						Рекомендуем
// 					</h3>
// 					<button
// 						onClick={() => navigate('/search')}
// 						className='text-[11px] font-black brand-text-gradient uppercase'
// 					>
// 						Все предложения →
// 					</button>
// 				</div>

// 				{[1, 2].map((i) => (
// 					<div
// 						key={i}
// 						onClick={() =>
// 							navigate('/detail', {
// 								state: {
// 									type: 'job',
// 									data: {
// 										id: i,
// 										title:
// 											i === 1
// 												? 'Ресторан "Барашек"'
// 												: 'Кофейня "AVA"',
// 										cityName: 'Бишкек',
// 										categoryName: 'Ресторан',
// 										description:
// 											'Семейный современный ресторан событийного формата...',
// 										salary: '80 000 сом',
// 										isActive: true,
// 										phone: '0555000000',
// 									},
// 								},
// 							})
// 						}
// 						className='bg-white border border-indigo-50 rounded-[2.5rem] overflow-hidden shadow-sm active:scale-[0.98] transition-all mb-4 hover:border-indigo-100'
// 					>
// 						<div className='h-44 bg-slate-200 relative'>
// 							<img
// 								src={`https://picsum.photos/seed/${i + 800}/800/600`}
// 								className='w-full h-full object-cover'
// 								alt='Venue'
// 							/>
// 							<div className='absolute top-4 left-4 brand-gradient backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/20'>
// 								Проверено
// 							</div>
// 						</div>
// 						<div className='p-6'>
// 							<div className='flex items-center gap-2 mb-2 text-indigo-300 font-bold text-[9px] uppercase tracking-widest'>
// 								<span>🕒 10:00-22:45</span>
// 								<span>
// 									• 🍴 {i === 1 ? 'Ресторан' : 'Кофейня'}
// 								</span>
// 							</div>
// 							<h4 className='text-xl font-black text-slate-900 mb-1'>
// 								{i === 1
// 									? 'Ресторан "Барашек"'
// 									: 'Кофейня "AVA"'}
// 							</h4>
// 							<div className='flex justify-between items-center mt-4 pt-4 border-t border-indigo-50'>
// 								<span className='brand-text-gradient font-black text-sm'>
// 									{i === 1 ? '80 000 сом' : '65 000 сом'}
// 								</span>
// 								<span className='text-[10px] font-bold text-slate-300 uppercase'>
// 									📍 Бишкек
// 								</span>
// 							</div>
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	)
// }

// export const SubscriptionPage: React.FC<{ telegramId: number }> = ({
// 	telegramId,
// }) => {
// 	const [loading, setLoading] = useState<string | null>(null)
// 	const { showToast } = useToast()
// 	const navigate = useNavigate()
// 	const plans = [
// 		{
// 			id: 'THREE_DAYS',
// 			name: '3 Дня',
// 			price: '169 сом',
// 			desc: 'Быстрый старт',
// 			icon: '🔥',
// 		},
// 		{
// 			id: 'ONE_WEEK',
// 			name: '7 Дней',
// 			price: '273 сом',
// 			desc: 'Популярный выбор',
// 			icon: '💎',
// 		},
// 		{
// 			id: 'ONE_MONTH',
// 			name: '30 Дней',
// 			price: '802 сом',
// 			desc: 'Максимальная выгода',
// 			icon: '🚀',
// 		},
// 	]

// 	const buy = async (id: string) => {
// 		setLoading(id)
// 		try {
// 			const res = await apiService.createPayment(telegramId, id)
// 			if (res?.paymentUrl) {
// 				if (tg)
// 					tg.openLink(res.paymentUrl, {
// 						try_instant_view: false,
// 					})
// 				else window.location.href = res.paymentUrl
// 			}
// 		} catch (e) {
// 			showToast('Ошибка оплаты', 'error')
// 		} finally {
// 			setLoading(null)
// 		}
// 	}

// 	return (
// 		<div className='px-5 space-y-8 pb-32 animate-in fade-in duration-500 bg-white min-h-screen'>
// 			<header className='flex items-center gap-4 py-8'>
// 				<button
// 					onClick={() => navigate(-1)}
// 					className='w-12 h-12 bg-indigo-50/50 rounded-2xl flex items-center justify-center text-indigo-600 active:scale-90 transition-transform'
// 				>
// 					<svg
// 						className='w-6 h-6'
// 						fill='none'
// 						stroke='currentColor'
// 						viewBox='0 0 24 24'
// 					>
// 						<path
// 							strokeLinecap='round'
// 							strokeLinejoin='round'
// 							strokeWidth='3'
// 							d='M15 19l-7-7 7-7'
// 						/>
// 					</svg>
// 				</button>
// 				<div className='text-left'>
// 					<h2 className='text-2xl font-black text-slate-900 leading-tight'>
// 						FASTJOB PRO
// 					</h2>
// 					<p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
// 						Уровни доступа
// 					</p>
// 				</div>
// 			</header>

// 			<div className='bg-slate-900 p-10 rounded-[3rem] text-white text-center shadow-2xl relative overflow-hidden'>
// 				<div className='absolute top-0 right-0 w-60 h-60 bg-indigo-500/30 blur-[100px] rounded-full'></div>
// 				<div className='absolute bottom-0 left-0 w-40 h-40 bg-amber-400/10 blur-[80px] rounded-full'></div>
// 				<h2 className='text-4xl font-black italic tracking-tighter mb-2 relative z-10'>
// 					ПРЕМИУМ ДОСТУП
// 				</h2>
// 				<p className='text-xs font-black text-indigo-300 uppercase tracking-[0.4em] relative z-10 opacity-80'>
// 					Unlimited Opportunities
// 				</p>
// 			</div>

// 			{/* Free Tier Info */}
// 			<div className='bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] flex items-center justify-between'>
// 				<div className='text-left'>
// 					<div className='flex items-center gap-2 mb-1'>
// 						<span className='text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-widest'>
// 							Базовый
// 						</span>
// 						<span className='text-lg'>🌱</span>
// 					</div>
// 					<h3 className='text-xl font-black text-slate-900'>
// 						Бесплатно
// 					</h3>
// 					<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
// 						Лимит: 3 контакта в день
// 					</p>
// 				</div>
// 				<div className='bg-white p-4 rounded-2xl shadow-sm border border-slate-50'>
// 					<span className='text-sm font-black text-slate-300'>✓</span>
// 				</div>
// 			</div>

// 			<div className='grid grid-cols-1 gap-5'>
// 				{plans.map((p) => (
// 					<button
// 						key={p.id}
// 						onClick={() => buy(p.id)}
// 						disabled={loading !== null}
// 						className='group bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between text-left active:scale-[0.97] transition-all shadow-xl shadow-slate-200/30 hover:border-indigo-200'
// 					>
// 						<div className='flex-1 pr-4'>
// 							<div className='flex items-center gap-2 mb-2'>
// 								<span
// 									className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${p.id === 'ONE_WEEK' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}
// 								>
// 									{p.name}
// 								</span>
// 								<span className='text-2xl'>{p.icon}</span>
// 							</div>
// 							<h3 className='text-3xl font-black text-slate-900'>
// 								{p.price}
// 							</h3>
// 							<p className='text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-70'>
// 								{p.desc}
// 							</p>
// 						</div>
// 						<div className='bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors p-5 rounded-3xl'>
// 							{loading === p.id ? (
// 								<div className='w-7 h-7 border-[3px] border-indigo-600 border-t-transparent group-hover:border-white group-hover:border-t-transparent rounded-full animate-spin'></div>
// 							) : (
// 								<svg
// 									className='w-7 h-7'
// 									fill='none'
// 									stroke='currentColor'
// 									viewBox='0 0 24 24'
// 								>
// 									<path
// 										strokeLinecap='round'
// 										strokeLinejoin='round'
// 										strokeWidth='3'
// 										d='M12 6v12m6-6H6'
// 									/>
// 								</svg>
// 							)}
// 						</div>
// 					</button>
// 				))}
// 			</div>

// 			<div className='p-8 bg-indigo-50/50 rounded-[3rem] space-y-6 border border-indigo-100'>
// 				<h4 className='text-[11px] font-black text-indigo-400 uppercase tracking-[0.25em] text-center'>
// 					Привилегии PRO подписки
// 				</h4>
// 				<div className='grid grid-cols-1 gap-5'>
// 					<BenefitItem
// 						icon='🔓'
// 						title='Контакты без лимита'
// 						desc='Смотрите номера всех работодателей без ограничений'
// 					/>
// 					<BenefitItem
// 						icon='🔝'
// 						title='Приоритет в выдаче'
// 						desc='Ваше резюме всегда будет первым в списке'
// 					/>
// 					<BenefitItem
// 						icon='⚡'
// 						title='Без очереди'
// 						desc='Мгновенная модерация ваших публикаций'
// 					/>
// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// const BenefitItem = ({
// 	icon,
// 	title,
// 	desc,
// }: {
// 	icon: string
// 	title: string
// 	desc: string
// }) => (
// 	<div className='flex items-start gap-4'>
// 		<div className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-50 shrink-0'>
// 			{icon}
// 		</div>
// 		<div className='text-left'>
// 			<div className='text-sm font-black text-slate-900 leading-tight'>
// 				{title}
// 			</div>
// 			<div className='text-[11px] text-slate-400 font-bold mt-1'>
// 				{desc}
// 			</div>
// 		</div>
// 	</div>
// )

// const SearchPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
// 	const location = useLocation()
// 	const navigate = useNavigate()
// 	const [type, setType] = useState<'job' | 'worker'>('job')
// 	const [query, setQuery] = useState('')

// 	const [selectedCityId, setSelectedCityId] = useState<number>(1)
// 	const [selectedSphereId, setSelectedSphereId] = useState<number | null>(
// 		location.state?.initialSphere?.id || null,
// 	)
// 	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
// 		null,
// 	)
// 	const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
// 		number | null
// 	>(null)

// 	const [cities, setCities] = useState<City[]>([])
// 	const [spheres, setSpheres] = useState<Sphere[]>([])
// 	const [categories, setCategories] = useState<Category[]>([])
// 	const [subcategories, setSubcategories] = useState<Subcategory[]>([])

// 	const [results, setResults] = useState<any[]>([])
// 	const [loading, setLoading] = useState(false)
// 	const { showToast } = useToast()

// 	useEffect(() => {
// 		apiService.getCities(telegramId).then(setCities)
// 		apiService.getSpheres(telegramId).then(setSpheres)
// 	}, [telegramId])

// 	useEffect(() => {
// 		if (selectedSphereId) {
// 			apiService
// 				.getCategories(telegramId, selectedSphereId)
// 				.then(setCategories)
// 		} else {
// 			setCategories([])
// 		}
// 		setSelectedCategoryId(null)
// 		setSelectedSubcategoryId(null)
// 	}, [selectedSphereId, telegramId])

// 	useEffect(() => {
// 		if (selectedCategoryId) {
// 			apiService
// 				.getSubcategories(telegramId, selectedCategoryId)
// 				.then(setSubcategories)
// 		} else {
// 			setSubcategories([])
// 		}
// 		setSelectedSubcategoryId(null)
// 	}, [selectedCategoryId, telegramId])

// 	const handleSearch = useCallback(async () => {
// 		setLoading(true)
// 		try {
// 			const cityId = selectedCityId || 1
// 			const catId = selectedCategoryId || 0
// 			const subId = selectedSubcategoryId || 0

// 			const res: any[] =
// 				type === 'job'
// 					? await apiService.searchVacancies(
// 							telegramId,
// 							cityId,
// 							catId,
// 							subId,
// 						)
// 					: await apiService.searchResumes(
// 							telegramId,
// 							cityId,
// 							catId,
// 							subId,
// 						)

// 			let filtered = res
// 			if (query) {
// 				filtered = filtered.filter((i: any) =>
// 					(i.title || i.name || '')
// 						.toLowerCase()
// 						.includes(query.toLowerCase()),
// 				)
// 			}
// 			setResults(filtered)
// 		} catch (e) {
// 			showToast('Ошибка при поиске', 'error')
// 		} finally {
// 			setLoading(false)
// 		}
// 	}, [
// 		type,
// 		query,
// 		selectedCityId,
// 		selectedCategoryId,
// 		selectedSubcategoryId,
// 		telegramId,
// 		showToast,
// 	])

// 	useEffect(() => {
// 		handleSearch()
// 	}, [handleSearch])

// 	return (
// 		<div className='bg-white min-h-screen pb-40 animate-in fade-in duration-500'>
// 			<header className='p-6 pt-12 space-y-6 sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-indigo-50'>
// 				<div className='flex items-center gap-4'>
// 					<button
// 						onClick={() => navigate(-1)}
// 						className='w-10 h-10 bg-indigo-50/50 rounded-xl flex items-center justify-center active:scale-95 transition-transform text-indigo-600'
// 					>
// 						←
// 					</button>
// 					<div className='flex-1 relative'>
// 						<div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-indigo-400'>
// 							<SearchIconSmall />
// 						</div>
// 						<input
// 							value={query}
// 							onChange={(e) => setQuery(e.target.value)}
// 							placeholder='Название или ключи...'
// 							className='w-full bg-indigo-50/30 h-12 pl-12 pr-4 rounded-2xl text-sm font-medium focus:outline-none ring-2 ring-transparent focus:ring-indigo-100 transition-all'
// 						/>
// 					</div>
// 				</div>

// 				<div className='flex bg-indigo-50/50 p-1 rounded-2xl'>
// 					<button
// 						onClick={() => setType('job')}
// 						className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${type === 'job' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-300'}`}
// 					>
// 						Вакансии
// 					</button>
// 					<button
// 						onClick={() => setType('worker')}
// 						className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${type === 'worker' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-300'}`}
// 					>
// 						Сотрудники
// 					</button>
// 				</div>

// 				<div className='space-y-4'>
// 					<div className='grid grid-cols-2 gap-3'>
// 						<ElegantSelect
// 							placeholder='Выберите город'
// 							value={selectedCityId}
// 							options={cities.map((c) => ({
// 								id: c.id,
// 								name: c.name,
// 							}))}
// 							onChange={(id) => setSelectedCityId(id)}
// 						/>
// 						<ElegantSelect
// 							placeholder='Выберите сферу'
// 							value={selectedSphereId}
// 							options={spheres.map((s) => ({
// 								id: s.id,
// 								name: s.name,
// 								icon: s.icon,
// 							}))}
// 							onChange={(id) => setSelectedSphereId(id)}
// 						/>
// 					</div>

// 					{selectedSphereId && (
// 						<div className='grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300'>
// 							<ElegantSelect
// 								placeholder='Категория'
// 								value={selectedCategoryId}
// 								options={categories.map((c) => ({
// 									id: c.id,
// 									name: c.name,
// 								}))}
// 								onChange={(id) => setSelectedCategoryId(id)}
// 							/>
// 							<ElegantSelect
// 								disabled={
// 									!selectedCategoryId ||
// 									subcategories.length === 0
// 								}
// 								placeholder={
// 									subcategories.length === 0
// 										? 'Нет подкатегорий'
// 										: 'Подкатегория'
// 								}
// 								value={selectedSubcategoryId}
// 								options={subcategories.map((s) => ({
// 									id: s.id,
// 									name: s.name,
// 								}))}
// 								onChange={(id) => setSelectedSubcategoryId(id)}
// 							/>
// 						</div>
// 					)}
// 				</div>
// 			</header>

// 			<div className='px-6 py-4 space-y-4'>
// 				{loading ? (
// 					<div className='p-20 flex justify-center'>
// 						<div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
// 					</div>
// 				) : results.length > 0 ? (
// 					results.map((item) => (
// 						<SearchResultItem
// 							key={item.id}
// 							item={item}
// 							type={type}
// 							onClick={(stats: any) =>
// 								navigate('/detail', {
// 									state: {
// 										type,
// 										data: item,
// 										initialStats: stats,
// 									},
// 								})
// 							}
// 						/>
// 					))
// 				) : (
// 					<div className='p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]'>
// 						Ничего не найдено
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	)
// }

// const SearchResultItem = ({ item, type, onClick }: any) => {
// 	const [stats, setStats] = useState<any>(null)
// 	const impressionRef = useRef<HTMLDivElement>(null)

// 	useEffect(() => {
// 		const fetchStats = async () => {
// 			try {
// 				const res =
// 					type === 'vac' || type === 'job'
// 						? await apiService.getVacancyStats(item.id)
// 						: await apiService.getResumeStats(item.id)
// 				setStats(res)
// 			} catch (e) {
// 				console.error(e)
// 			}
// 		}
// 		fetchStats()
// 	}, [item.id, type])

// 	useEffect(() => {
// 		const trackingKey = `${type}-${item.id}`
// 		const observer = new IntersectionObserver(
// 			(entries) => {
// 				if (entries[0].isIntersecting && !viewedIds.has(trackingKey)) {
// 					viewedIds.add(trackingKey)
// 					apiService.trackView(
// 						type === 'vac' || type === 'job' ? 'job' : 'worker',
// 						item.id,
// 					)
// 					setStats((prev: any) =>
// 						prev
// 							? {
// 									...prev,
// 									viewsCount: (prev.viewsCount || 0) + 1,
// 								}
// 							: prev,
// 					)
// 					observer.disconnect()
// 				}
// 			},
// 			{ threshold: 0.5 },
// 		)

// 		if (impressionRef.current) observer.observe(impressionRef.current)
// 		return () => observer.disconnect()
// 	}, [item.id, type])

// 	return (
// 		<div
// 			ref={impressionRef}
// 			onClick={() => onClick(stats)}
// 			className='bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-2'
// 		>
// 			<div className='flex justify-between items-start mb-3'>
// 				<div className='text-left'>
// 					<span className='text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-lg'>
// 						{type === 'job' || type === 'vac'
// 							? 'Вакансия'
// 							: 'Резюме'}
// 					</span>
// 					<h3 className='text-lg font-black text-slate-900 mt-1'>
// 						{type === 'job' || type === 'vac'
// 							? item.title
// 							: item.name}
// 					</h3>
// 				</div>
// 				<div className='text-xs font-black text-emerald-600 text-right'>
// 					{type === 'job' || type === 'vac'
// 						? `${item.salary} 💵`
// 						: `${item.experience}г. опыта`}
// 				</div>
// 			</div>
// 			<p className='text-sm text-slate-500 line-clamp-2 font-medium mb-4 text-left'>
// 				{item.description}
// 			</p>
// 			<div className='pt-4 border-t border-slate-50 flex items-center justify-between'>
// 				<div className='flex items-center gap-3'>
// 					<div className='flex items-center gap-1 text-[10px] font-black text-slate-400'>
// 						<ViewIcon />
// 						<span>{stats?.viewsCount ?? 0}</span>
// 					</div>
// 					<div className='flex items-center gap-1 text-[10px] font-black text-slate-400'>
// 						<ClickIcon />
// 						<span>{stats?.contactClicksCount ?? 0}</span>
// 					</div>
// 					<div className='flex items-center gap-1 text-[10px] font-black text-indigo-400 text-left'>
// 						<svg
// 							className='w-3 h-3'
// 							fill='none'
// 							stroke='currentColor'
// 							viewBox='0 0 24 24'
// 						>
// 							<path
// 								strokeLinecap='round'
// 								strokeLinejoin='round'
// 								strokeWidth='3'
// 								d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
// 							/>
// 						</svg>
// 						<span>
// 							{type === 'job' || type === 'vac'
// 								? (stats?.responseCount ?? 0)
// 								: (stats?.invitationCount ?? 0)}
// 						</span>
// 					</div>
// 				</div>
// 				<div className='text-[10px] font-bold text-slate-300'>
// 					📍 {item.cityName}
// 				</div>
// 			</div>
// 		</div>
// 	)
// }
// const CreatePage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
// 	const location = useLocation()
// 	const navigate = useNavigate()
// 	const { type, existingData } = location.state || { type: 'vac' }
// 	const { showToast } = useToast()
// 	const [loading, setLoading] = useState(false)

// 	const [cities, setCities] = useState<City[]>([])
// 	const [spheres, setSpheres] = useState<Sphere[]>([])
// 	const [categories, setCategories] = useState<Category[]>([])
// 	const [subcategories, setSubcategories] = useState<Subcategory[]>([])

// 	const [formData, setFormData] = useState<any>(
// 		existingData || {
// 			title: '',
// 			name: '',
// 			description: '',
// 			salary: '',
// 			cityId: 0,
// 			sphereId: 0,
// 			categoryId: 0,
// 			subcategoryId: 0,
// 			phone: '',
// 			companyName: '',
// 			// Новые поля для вакансии:
// 			schedule: '',
// 			address: '',
// 			minAge: 18,
// 			maxAge: 45,
// 			preferredGender: 'ANY',
// 			// Поля для резюме:
// 			age: 18,
// 			gender: 'MALE',
// 			experience: 0,
// 			experienceInYear: 0,
// 			isActive: true,
// 		},
// 	)

// 	useEffect(() => {
// 		apiService.getCities(telegramId).then(setCities)
// 		apiService.getSpheres(telegramId).then(setSpheres)
// 	}, [telegramId])

// 	useEffect(() => {
// 		if (formData.sphereId) {
// 			apiService
// 				.getCategories(telegramId, formData.sphereId)
// 				.then(setCategories)
// 		}
// 		setFormData((prev: any) => ({
// 			...prev,
// 			categoryId: existingData?.categoryId || prev.categoryId,
// 		}))
// 	}, [formData.sphereId, telegramId, existingData])

// 	useEffect(() => {
// 		if (formData.categoryId) {
// 			apiService
// 				.getSubcategories(telegramId, formData.categoryId)
// 				.then(setSubcategories)
// 		}
// 	}, [formData.categoryId, telegramId])

// 	const handleAction = async () => {
// 		const isVac = type === 'vac' || type === 'job'
// 		const isUpdate = !!existingData?.id
// 		setLoading(true)
// 		try {
// 			if (isVac) {
// 				const payload = {
// 					title: formData.title,
// 					description: formData.description,
// 					salary: formData.salary,
// 					companyName: formData.companyName,
// 					phone: formData.phone,
// 					cityId: Number(formData.cityId),
// 					categoryId: Number(formData.categoryId),
// 					subcategoryId: Number(formData.subcategoryId),
// 					experienceInYear: Number(formData.experienceInYear),
// 					schedule: formData.schedule,
// 					address: formData.address,
// 					minAge: Number(formData.minAge),
// 					maxAge: Number(formData.maxAge),
// 					preferredGender: formData.preferredGender,
// 					isActive: true,
// 				}
// 				if (isUpdate)
// 					await apiService.updateVacancy(
// 						existingData.id,
// 						telegramId,
// 						payload,
// 					)
// 				else await apiService.createVacancy(telegramId, payload)
// 			} else {
// 				const payload = {
// 					name: formData.name,
// 					age: Number(formData.age),
// 					gender: formData.gender,
// 					cityId: Number(formData.cityId),
// 					categoryId: Number(formData.categoryId),
// 					subcategoryId: Number(formData.subcategoryId),
// 					experience: Number(formData.experience),
// 					description: formData.description,
// 					isActive: true,
// 				}
// 				if (isUpdate)
// 					await apiService.updateResume(
// 						existingData.id,
// 						telegramId,
// 						payload,
// 					)
// 				else await apiService.createResume(telegramId, payload)
// 			}
// 			showToast(isUpdate ? 'Успешно обновлено!' : 'Успешно опубликовано!')
// 			navigate('/profile')
// 		} catch (e) {
// 			showToast('Ошибка API', 'error')
// 		} finally {
// 			setLoading(false)
// 		}
// 	}

// 	const inputClass =
// 		'w-full bg-indigo-50/30 border-none h-14 px-6 rounded-2xl text-sm font-bold focus:outline-none ring-2 ring-transparent focus:ring-indigo-100 transition-all placeholder:text-indigo-200 text-slate-900'

// 	return (
// 		<div className='bg-white min-h-screen pb-40 animate-in fade-in duration-500'>
// 			<header className='p-6 pt-12 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-indigo-50'>
// 				<button
// 					onClick={() => navigate(-1)}
// 					className='w-10 h-10 bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-600'
// 				>
// 					←
// 				</button>
// 				<h2 className='text-2xl font-black text-slate-900 leading-tight'>
// 					{existingData
// 						? 'Редактирование'
// 						: type === 'vac'
// 							? 'Новая Вакансия'
// 							: 'Новое Резюме'}
// 				</h2>
// 			</header>

// 			<div className='px-6 py-6 space-y-6'>
// 				<FormField
// 					label={
// 						type === 'vac' || type === 'job'
// 							? 'Название вакансии'
// 							: 'Ваше Имя'
// 					}
// 				>
// 					<input
// 						value={
// 							type === 'vac' || type === 'job'
// 								? formData.title
// 								: formData.name
// 						}
// 						onChange={(e) =>
// 							setFormData({
// 								...formData,
// 								[type === 'vac' || type === 'job'
// 									? 'title'
// 									: 'name']: e.target.value,
// 							})
// 						}
// 						placeholder='Введите заголовок...'
// 						className={inputClass}
// 					/>
// 				</FormField>

// 				<ElegantSelect
// 					label='Город'
// 					placeholder='Выберите город'
// 					value={formData.cityId}
// 					options={cities.map((c) => ({ id: c.id, name: c.name }))}
// 					onChange={(id) => setFormData({ ...formData, cityId: id })}
// 				/>

// 				<div className='space-y-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100'>
// 					<ElegantSelect
// 						label='Сфера'
// 						placeholder='Выберите сферу'
// 						value={formData.sphereId}
// 						options={spheres.map((s) => ({
// 							id: s.id,
// 							name: s.name,
// 						}))}
// 						onChange={(id) =>
// 							setFormData({
// 								...formData,
// 								sphereId: id,
// 								categoryId: 0,
// 								subcategoryId: 0,
// 							})
// 						}
// 					/>
// 					{formData.sphereId > 0 && (
// 						<ElegantSelect
// 							label='Категория'
// 							placeholder='Выберите категорию'
// 							value={formData.categoryId}
// 							options={categories.map((c) => ({
// 								id: c.id,
// 								name: c.name,
// 							}))}
// 							onChange={(id) =>
// 								setFormData({
// 									...formData,
// 									categoryId: id,
// 									subcategoryId: 0,
// 								})
// 							}
// 						/>
// 					)}
// 					{formData.categoryId > 0 && subcategories.length > 0 && (
// 						<ElegantSelect
// 							label='Подкатегория'
// 							placeholder='Выберите подкатегорию'
// 							value={formData.subcategoryId}
// 							options={subcategories.map((s) => ({
// 								id: s.id,
// 								name: s.name,
// 							}))}
// 							onChange={(id) =>
// 								setFormData({ ...formData, subcategoryId: id })
// 							}
// 						/>
// 					)}
// 				</div>

// 				{type === 'vac' || type === 'job' ? (
// 					<>
// 						<div className='grid grid-cols-2 gap-4'>
// 							<FormField label='Зарплата'>
// 								<input
// 									value={formData.salary}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											salary: e.target.value,
// 										})
// 									}
// 									placeholder='80 000 сом'
// 									className={inputClass}
// 								/>
// 							</FormField>
// 							<FormField label='График работы'>
// 								<input
// 									value={formData.schedule}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											schedule: e.target.value,
// 										})
// 									}
// 									placeholder='2/2, 09:00-18:00'
// 									className={inputClass}
// 								/>
// 							</FormField>
// 						</div>

// 						<FormField label='Адрес работы'>
// 							<input
// 								value={formData.address}
// 								onChange={(e) =>
// 									setFormData({
// 										...formData,
// 										address: e.target.value,
// 									})
// 								}
// 								placeholder='ул. Киевская, 120'
// 								className={inputClass}
// 							/>
// 						</FormField>

// 						<div className='grid grid-cols-2 gap-4'>
// 							<FormField label='Возраст ОТ'>
// 								<input
// 									type='number'
// 									value={formData.minAge}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											minAge: e.target.value,
// 										})
// 									}
// 									className={inputClass}
// 								/>
// 							</FormField>
// 							<FormField label='Возраст ДО'>
// 								<input
// 									type='number'
// 									value={formData.maxAge}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											maxAge: e.target.value,
// 										})
// 									}
// 									className={inputClass}
// 								/>
// 							</FormField>
// 						</div>

// 						<ElegantSelect
// 							label='Предпочтительный пол'
// 							placeholder='Выберите пол'
// 							value={formData.preferredGender}
// 							options={[
// 								{ id: 'MALE', name: 'Мужской', icon: '👨' },
// 								{ id: 'FEMALE', name: 'Женский', icon: '👩' },
// 								{ id: 'ANY', name: 'Не важно', icon: '👫' },
// 							]}
// 							onChange={(id) =>
// 								setFormData({
// 									...formData,
// 									preferredGender: id,
// 								})
// 							}
// 						/>

// 						<div className='grid grid-cols-2 gap-4'>
// 							<FormField label='Компания'>
// 								<input
// 									value={formData.companyName}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											companyName: e.target.value,
// 										})
// 									}
// 									placeholder='Название фирмы'
// 									className={inputClass}
// 								/>
// 							</FormField>
// 							<FormField label='Опыт (лет)'>
// 								<input
// 									type='number'
// 									value={formData.experienceInYear}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											experienceInYear: e.target.value,
// 										})
// 									}
// 									className={inputClass}
// 								/>
// 							</FormField>
// 						</div>

// 						<FormField label='Телефон / TG'>
// 							<input
// 								value={formData.phone}
// 								onChange={(e) =>
// 									setFormData({
// 										...formData,
// 										phone: e.target.value,
// 									})
// 								}
// 								placeholder='0555...'
// 								className={inputClass}
// 							/>
// 						</FormField>
// 					</>
// 				) : (
// 					<>
// 						<div className='grid grid-cols-2 gap-4'>
// 							<FormField label='Возраст'>
// 								<input
// 									type='number'
// 									value={formData.age}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											age: e.target.value,
// 										})
// 									}
// 									className={inputClass}
// 								/>
// 							</FormField>
// 							<FormField label='Опыт (лет)'>
// 								<input
// 									type='number'
// 									value={formData.experience}
// 									onChange={(e) =>
// 										setFormData({
// 											...formData,
// 											experience: e.target.value,
// 										})
// 									}
// 									className={inputClass}
// 								/>
// 							</FormField>
// 						</div>
// 						<ElegantSelect
// 							label='Пол'
// 							placeholder='Выберите пол'
// 							value={formData.gender}
// 							options={[
// 								{ id: 'MALE', name: 'Мужской', icon: '👨' },
// 								{ id: 'FEMALE', name: 'Женский', icon: '👩' },
// 							]}
// 							onChange={(id) =>
// 								setFormData({ ...formData, gender: id })
// 							}
// 						/>
// 					</>
// 				)}

// 				<FormField label='Описание'>
// 					<textarea
// 						value={formData.description}
// 						onChange={(e) =>
// 							setFormData({
// 								...formData,
// 								description: e.target.value,
// 							})
// 						}
// 						className='w-full bg-indigo-50/30 border-none min-h-[160px] p-6 rounded-3xl text-sm font-medium focus:outline-none resize-none ring-2 ring-transparent focus:ring-indigo-100 transition-all'
// 					/>
// 				</FormField>

// 				<button
// 					onClick={handleAction}
// 					disabled={loading}
// 					className='w-full py-6 brand-gradient text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl brand-shadow'
// 				>
// 					{loading
// 						? 'Обработка...'
// 						: existingData
// 							? 'Сохранить изменения'
// 							: 'Опубликовать'}
// 				</button>
// 			</div>
// 		</div>
// 	)
// }

// const ProfilePage: React.FC<{ telegramId: number; user: User | null }> = ({
// 	telegramId,
// 	user,
// }) => {
// 	const navigate = useNavigate()
// 	const { showToast } = useToast()
// 	const [activeTab, setActiveTab] = useState<'resumes' | 'vacancies'>(
// 		'resumes',
// 	)
// 	const [resumes, setResumes] = useState<any[]>([])
// 	const [vacancies, setVacancies] = useState<any[]>([])
// 	const [loading, setLoading] = useState(true)
// 	const [boostTarget, setBoostTarget] = useState<{
// 		id: number
// 		type: 'res' | 'vac'
// 		name: string
// 	} | null>(null)
// 	const [isBoosting, setIsBoosting] = useState(false)

// 	const fetchAll = useCallback(async () => {
// 		setLoading(true)
// 		try {
// 			const [r, v] = await Promise.all([
// 				apiService.getUserResumes(telegramId),
// 				apiService.getUserVacancies(telegramId),
// 			])
// 			const [rFull, vFull] = await Promise.all([
// 				Promise.all(
// 					r.map(async (i) => ({
// 						...i,
// 						stats: await apiService.getResumeStats(i.id),
// 						boost: await apiService.getResumeBoostStatus(i.id),
// 					})),
// 				),
// 				Promise.all(
// 					v.map(async (i) => ({
// 						...i,
// 						stats: await apiService.getVacancyStats(i.id),
// 						boost: await apiService.getVacancyBoostStatus(i.id),
// 					})),
// 				),
// 			])
// 			setResumes(rFull)
// 			setVacancies(vFull)
// 		} catch (e) {
// 			showToast('Ошибка загрузки', 'error')
// 		} finally {
// 			setLoading(false)
// 		}
// 	}, [telegramId, showToast])

// 	useEffect(() => {
// 		fetchAll()
// 	}, [fetchAll])

// 	const handleApplyBoost = async () => {
// 		if (!boostTarget) return
// 		setIsBoosting(true)
// 		try {
// 			if (boostTarget.type === 'res')
// 				await apiService.boostResumePoints(boostTarget.id, telegramId)
// 			else await apiService.boostVacancyPoints(boostTarget.id, telegramId)
// 			showToast('Поднято в ТОП! 🚀')
// 			setBoostTarget(null)
// 			fetchAll()
// 		} catch (e) {
// 			showToast('Недостаточно баллов', 'error')
// 		} finally {
// 			setIsBoosting(false)
// 		}
// 	}

// 	const renderCard = (item: any, type: 'res' | 'vac') => (
// 		<div
// 			key={item.id}
// 			className={`bg-white p-6 rounded-[2.5rem] border shadow-sm transition-all ${item.isActive ? 'border-slate-100' : 'border-slate-200 opacity-70 grayscale'}`}
// 		>
// 			<div className='flex justify-between items-start mb-5'>
// 				<div>
// 					<div className='flex items-center gap-2 mb-2'>
// 						<span
// 							className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
// 						>
// 							{item.isActive ? 'Активно' : 'Скрыто'}
// 						</span>
// 						{item.boost?.isBoosted && (
// 							<span className='text-[9px] font-black uppercase px-2 py-1 rounded-md bg-indigo-600 text-white animate-pulse'>
// 								🔥 В ТОПЕ
// 							</span>
// 						)}
// 					</div>
// 					<h4 className='font-black text-slate-900 text-lg leading-tight'>
// 						{type === 'res' ? item.name : item.title}
// 					</h4>
// 				</div>
// 				<div className='flex items-center gap-1.5'>
// 					<button
// 						onClick={() =>
// 							navigate('/create', {
// 								state: {
// 									type: type === 'res' ? 'res' : 'vac',
// 									existingData: item,
// 								},
// 							})
// 						}
// 						className='w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl transition-colors'
// 					>
// 						✏️
// 					</button>
// 					<button
// 						onClick={() =>
// 							setBoostTarget({
// 								id: item.id,
// 								type,
// 								name: type === 'res' ? item.name : item.title,
// 							})
// 						}
// 						className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${item.boost?.isBoosted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-indigo-50 text-indigo-600'}`}
// 					>
// 						🚀
// 					</button>
// 				</div>
// 			</div>
// 			<div className='bg-slate-50 p-4 rounded-3xl mb-6 grid grid-cols-3 divide-x divide-slate-200'>
// 				<div className='flex flex-col items-center px-2'>
// 					<div className='flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase mb-1'>
// 						<ViewIcon /> Глаза
// 					</div>
// 					<span className='text-sm font-black text-slate-900'>
// 						{item.stats?.viewsCount || 0}
// 					</span>
// 				</div>
// 				<div className='flex flex-col items-center px-2'>
// 					<div className='flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase mb-1'>
// 						<ClickIcon /> Клики
// 					</div>
// 					<span className='text-sm font-black text-slate-900'>
// 						{item.stats?.contactClicksCount || 0}
// 					</span>
// 				</div>
// 				<div className='flex flex-col items-center px-2'>
// 					<div className='flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase mb-1'>
// 						🎯 Цель
// 					</div>
// 					<span className='text-sm font-black text-emerald-600'>
// 						{type === 'vac'
// 							? item.stats?.responseCount
// 							: item.stats?.invitationCount || 0}
// 					</span>
// 				</div>
// 			</div>
// 			<div className='grid grid-cols-2 gap-3'>
// 				<button
// 					onClick={() =>
// 						(type === 'res'
// 							? apiService.toggleResumeStatus(
// 									telegramId,
// 									item.id,
// 									item.isActive,
// 								)
// 							: apiService.toggleVacancyStatus(
// 									telegramId,
// 									item.id,
// 									item.isActive,
// 								)
// 						).then(fetchAll)
// 					}
// 					className='py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest'
// 				>
// 					{item.isActive ? 'Скрыть' : 'Показать'}
// 				</button>
// 				<button
// 					onClick={() =>
// 						navigate('/detail', {
// 							state: {
// 								type: type === 'res' ? 'worker' : 'job',
// 								data: item,
// 							},
// 						})
// 					}
// 					className='py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest'
// 				>
// 					Просмотр
// 				</button>
// 			</div>
// 		</div>
// 	)

// 	return (
// 		<div className='px-5 space-y-6 py-12 pb-40 min-h-screen bg-slate-50'>
// 			<div className='bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4'>
// 				<div className='flex items-center gap-4'>
// 					<div className='w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center font-black text-indigo-600 text-2xl'>
// 						{user?.firstName?.charAt(0)}
// 					</div>
// 					<div>
// 						<h3 className='text-xl font-black text-slate-900'>
// 							{user?.firstName}
// 						</h3>
// 						<p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
// 							ID: {telegramId}
// 						</p>
// 					</div>
// 				</div>
// 				<div className='pt-4 border-t border-slate-50 flex justify-between items-center'>
// 					<div>
// 						<span className='text-[10px] font-black text-slate-400 uppercase block'>
// 							Баланс
// 						</span>
// 						<span className='text-lg font-black text-emerald-600'>
// 							{user?.balance || 0} PTSfff
// 						</span>
// 					</div>
// 					<button
// 						onClick={() => navigate('/withdraw')}
// 						className='text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-4 py-2 rounded-xl'
// 					>
// 						Вывод
// 					</button>
// 				</div>
// 			</div>
// 			<div className='flex bg-white p-1.5 rounded-2xl border border-slate-100'>
// 				<button
// 					onClick={() => setActiveTab('resumes')}
// 					className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'resumes' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}
// 				>
// 					Мои Резюме
// 				</button>
// 				<button
// 					onClick={() => setActiveTab('vacancies')}
// 					className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'vacancies' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}
// 				>
// 					Мои Вакансии
// 				</button>
// 			</div>
// 			{loading ? (
// 				<div className='animate-pulse space-y-4'>
// 					{[1, 2].map((i) => (
// 						<div
// 							key={i}
// 							className='h-64 bg-white rounded-[2.5rem]'
// 						/>
// 					))}
// 				</div>
// 			) : (
// 				<div className='space-y-4'>
// 					{(activeTab === 'resumes' ? resumes : vacancies).map((i) =>
// 						renderCard(i, activeTab === 'resumes' ? 'res' : 'vac'),
// 					)}
// 				</div>
// 			)}

// 			{boostTarget && (
// 				<div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center transition-all duration-300'>
// 					<div
// 						className='absolute inset-0'
// 						onClick={() => setBoostTarget(null)}
// 					/>
// 					<div className='w-full max-w-md bg-white rounded-t-[3rem] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom duration-300 relative z-[101] shadow-2xl mb-[70px]'>
// 						<div className='text-center space-y-2'>
// 							<div className='w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-4' />
// 							<h3 className='text-2xl font-black text-slate-900 leading-tight'>
// 								Продвижение 🚀
// 							</h3>
// 							<p className='text-sm text-slate-500 font-medium px-4'>
// 								Поднимите «
// 								<span className='text-slate-900 font-bold'>
// 									{boostTarget.name}
// 								</span>
// 								» в топ списка.
// 							</p>
// 						</div>
// 						<div className='space-y-3'>
// 							<button
// 								disabled={isBoosting}
// 								onClick={handleApplyBoost}
// 								className='w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50'
// 							>
// 								{isBoosting ? '...' : 'Поднять за 50 PTS'}
// 							</button>
// 							<button
// 								onClick={() =>
// 									apiService
// 										.createPayment(telegramId, 'BOOST_1')
// 										.then((r) => tg.openLink(r.paymentUrl))
// 								}
// 								className='w-full py-5 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest'
// 							>
// 								Поднять за 99 сом
// 							</button>
// 							<button
// 								onClick={() => setBoostTarget(null)}
// 								className='w-full py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest'
// 							>
// 								Закрыть
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	)
// }

// const viewedIds = new Set<string>()

// const DetailPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
// 	const location = useLocation()
// 	const navigate = useNavigate()
// 	const { type, data, initialStats } = location.state || {}

// 	const item = data

// 	const { showToast } = useToast()
// 	const [stats, setStats] = useState<any>(initialStats || null)

// 	useEffect(() => {
// 		const fetchFreshStats = async () => {
// 			if (!item) return
// 			try {
// 				const freshStats =
// 					type === 'worker'
// 						? await apiService.getResumeStats(item.id)
// 						: await apiService.getVacancyStats(item.id)
// 				setStats(freshStats)
// 			} catch (e) {
// 				console.error('Ошибка получения статов:', e)
// 			}
// 		}
// 		fetchFreshStats()
// 	}, [item, type])

// 	const handleContactClick = (platform: 'whatsapp' | 'telegram') => {
// 		apiService.trackContactClick(
// 			type === 'worker' ? 'worker' : 'job',
// 			item.id,
// 			telegramId,
// 		)
// 		showToast(`Переходим в ${platform}...`, 'success')
// 		if (platform === 'whatsapp') {
// 			tg.openLink(`https://wa.me/${item.phone.replace(/\D/g, '')}`)
// 		} else {
// 			const username =
// 				item.telegramUsername ||
// 				item.userName ||
// 				item.phone.replace(/\D/g, '')
// 			tg.openTelegramLink(`https://t.me/${username}`)
// 		}
// 	}

// 	if (!item) return <Navigate to='/' replace />

// 	return (
// 		<div className='pb-32 animate-in fade-in duration-500 bg-white min-h-screen text-slate-900'>
// 			<header className='px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-slate-100'>
// 				<button
// 					onClick={() => navigate(-1)}
// 					className='w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-all'
// 				>
// 					<svg
// 						className='w-5 h-5'
// 						fill='none'
// 						stroke='currentColor'
// 						viewBox='0 0 24 24'
// 					>
// 						<path
// 							strokeLinecap='round'
// 							strokeLinejoin='round'
// 							strokeWidth='2.5'
// 							d='M15 19l-7-7 7-7'
// 						/>
// 					</svg>
// 				</button>
// 				<div className='flex items-center gap-3'>
// 					<span className='px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg'>
// 						ID: {item.id}
// 					</span>
// 					<button
// 						onClick={() =>
// 							tg.openTelegramLink(
// 								`https://t.me/share/url?url=https://t.me/work_random_bot?start=${item.id}&text=${encodeURIComponent(item.title || item.name)}`,
// 							)
// 						}
// 						className='w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400'
// 					>
// 						<svg
// 							className='w-4 h-4'
// 							fill='none'
// 							stroke='currentColor'
// 							viewBox='0 0 24 24'
// 						>
// 							<path
// 								strokeLinecap='round'
// 								strokeLinejoin='round'
// 								strokeWidth='2.5'
// 								d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
// 							/>
// 						</svg>
// 					</button>
// 				</div>
// 			</header>

// 			<div className='px-6 pt-6 space-y-8'>
// 				<section className='space-y-4 text-left'>
// 					<div className='space-y-2'>
// 						<div className='flex items-center gap-2'>
// 							<span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
// 								{item.cityName} • {item.categoryName}
// 								{item.subcategoryName
// 									? ` • ${item.subcategoryName}`
// 									: ''}
// 							</span>
// 							{item.isActive !== false && (
// 								<span className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse'></span>
// 							)}
// 						</div>
// 						<h1 className='text-3xl font-black text-slate-900 leading-tight'>
// 							{type === 'worker' ? item.name : item.title}
// 						</h1>
// 						{item.companyName && (
// 							<p className='text-sm font-bold text-indigo-600 flex items-center gap-2'>
// 								<svg
// 									className='w-4 h-4'
// 									fill='none'
// 									stroke='currentColor'
// 									viewBox='0 0 24 24'
// 								>
// 									<path
// 										strokeLinecap='round'
// 										strokeLinejoin='round'
// 										strokeWidth='2.5'
// 										d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
// 									/>
// 								</svg>
// 								{item.companyName}
// 							</p>
// 						)}
// 					</div>
// 					<div className='inline-flex items-center px-6 py-3 bg-emerald-50 text-emerald-700 text-xl font-black rounded-2xl border border-emerald-100 shadow-sm'>
// 						{item.salary ||
// 							(item.experience !== undefined
// 								? `${item.experience}г. опыта`
// 								: 'ЗП не указана')}
// 					</div>
// 				</section>

// 				{(item.portfolio?.length > 0 ||
// 					item.videoPortfolio?.length > 0) && (
// 					<section className='space-y-4'>
// 						<h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-left'>
// 							Галерея работ
// 						</h4>
// 						<div className='flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-1'>
// 							{item.videoPortfolio?.map(
// 								(vid: string, idx: number) => (
// 									<div
// 										key={`vid-${idx}`}
// 										className='flex-shrink-0 w-[85%] sm:w-80 h-56 bg-black rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 snap-center'
// 									>
// 										<video
// 											src={vid}
// 											controls
// 											className='w-full h-full object-cover'
// 										/>
// 									</div>
// 								),
// 							)}
// 							{item.portfolio?.map((img: string, idx: number) => (
// 								<div
// 									key={`img-${idx}`}
// 									className='flex-shrink-0 w-[85%] sm:w-80 h-56 bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 snap-center relative group'
// 								>
// 									<img
// 										src={img}
// 										alt={`Work ${idx}`}
// 										className='w-full h-full object-cover transition-transform duration-500 group-active:scale-110'
// 									/>
// 								</div>
// 							))}
// 						</div>
// 					</section>
// 				)}

// 				<section className='bg-slate-50/80 rounded-[2.5rem] p-4 space-y-4 border border-slate-100'>
// 					<h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-left'>
// 						Ключевые детали
// 					</h4>
// 					<div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 px-4'>
// 						<DetailRow
// 							icon={<ClockIconSmall />}
// 							label='График работы'
// 							value={item.schedule || 'Не указано'}
// 						/>
// 						<DetailRow
// 							icon={<ExpIconSmall />}
// 							label='Требуемый опыт'
// 							value={
// 								item.experienceInYear !== undefined
// 									? `${item.experienceInYear} лет`
// 									: item.experience !== undefined
// 										? `${item.experience} лет`
// 										: 'Без опыта'
// 							}
// 						/>
// 						<DetailRow
// 							icon={<LocIconSmall />}
// 							label='Адрес / Район'
// 							value={item.address || 'Центр города'}
// 						/>
// 						<DetailRow
// 							icon={<UserIconSmall />}
// 							label='Возраст и Пол'
// 							value={`${item.minAge || item.age || 18}-${item.maxAge || 65} • ${item.preferredGender === 'ANY' ? 'Любой' : item.preferredGender || 'Любой'}`}
// 						/>
// 					</div>
// 				</section>

// 				<section className='space-y-4'>
// 					<h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-left'>
// 						Подробное описание
// 					</h4>
// 					<div className='text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-sm text-left px-2'>
// 						{item.description}
// 					</div>
// 				</section>

// 				<section className='flex items-center justify-between px-2 pt-4 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
// 					<div className='flex items-center gap-4'>
// 						<span className='flex items-center gap-1.5'>
// 							<ViewIcon /> {stats?.viewsCount || 0}
// 						</span>
// 						<span className='flex items-center gap-1.5'>
// 							<ClickIcon /> {stats?.contactClicksCount || 0}
// 						</span>
// 					</div>
// 					<span>
// 						{item.createdAt
// 							? new Date(item.createdAt).toLocaleDateString()
// 							: 'Сегодня'}
// 					</span>
// 				</section>
// 			</div>

// 			<div className='fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50'>
// 				<div className='max-w-xl mx-auto grid grid-cols-2 gap-3'>
// 					<button
// 						onClick={() => handleContactClick('whatsapp')}
// 						className='h-16 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3'
// 					>
// 						WhatsApp
// 					</button>
// 					<button
// 						onClick={() => handleContactClick('telegram')}
// 						className='h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3'
// 					>
// 						Telegram
// 					</button>
// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// const DetailRow = ({
// 	icon,
// 	label,
// 	value,
// }: {
// 	icon: any
// 	label: string
// 	value: string
// }) => (
// 	<div className='flex items-center gap-4 group'>
// 		<div className='w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm transition-transform group-hover:scale-105'>
// 			{icon}
// 		</div>
// 		<div className='text-left'>
// 			<p className='text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1'>
// 				{label}
// 			</p>
// 			<p className='text-xs font-bold text-slate-900 leading-none'>
// 				{value}
// 			</p>
// 		</div>
// 	</div>
// )

// // Small Icons
// const ClockIconSmall = () => (
// 	<svg
// 		className='w-4 h-4'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
// 		/>
// 	</svg>
// )
// const ExpIconSmall = () => (
// 	<svg
// 		className='w-4 h-4'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
// 		/>
// 	</svg>
// )
// const LocIconSmall = () => (
// 	<svg
// 		className='w-4 h-4'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
// 		/>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
// 		/>
// 	</svg>
// )
// const UserIconSmall = () => (
// 	<svg
// 		className='w-4 h-4'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
// 		/>
// 	</svg>
// )

// const WithdrawPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
// 	const navigate = useNavigate()
// 	const { showToast } = useToast()
// 	const [user, setUser] = useState<User | null>(null)
// 	const [amount, setAmount] = useState('')
// 	const [recipientPhone, setRecipientPhone] = useState('')
// 	const [selectedBankKey, setSelectedBankKey] = useState<string>(
// 		Object.keys(BANK_SERVICES)[0],
// 	)
// 	const [loading, setLoading] = useState(false)

// 	useEffect(() => {
// 		apiService.getUser(telegramId).then(setUser)
// 	}, [telegramId])

// 	const somAmount = useMemo(() => {
// 		const val = parseFloat(amount) || 0
// 		// 100 баллов = 5 сомов (1 балл = 0.05 сома)
// 		return (val * 0.05).toFixed(2)
// 	}, [amount])

// 	const handleWithdraw = async () => {
// 		const val = Number(amount)
// 		if (!val || val <= 0) return showToast('Введите сумму', 'error')
// 		if (!recipientPhone) return showToast('Введите номер телефона', 'error')
// 		if (user && val > user.balance)
// 			return showToast('Недостаточно средств', 'error')
// 		setLoading(true)
// 		try {
// 			await apiService.withdrawPoints(telegramId, {
// 				pointsAmount: val,
// 				serviceId: BANK_SERVICES[selectedBankKey].id,
// 				recipientPhone: recipientPhone,
// 			})
// 			showToast('Заявка на вывод создана!')
// 			navigate('/profile')
// 		} catch (e: any) {
// 			const errorMessage =
// 				e.response?.data?.message || e.message || 'Ошибка вывода'
// 			console.log(e)

// 			showToast('dsadsa', 'error')
// 		} finally {
// 			setLoading(false)
// 		}
// 	}

// 	return (
// 		<div className='bg-white min-h-screen pb-40 animate-in fade-in duration-500'>
// 			<header className='p-6 pt-12 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-indigo-50'>
// 				<button
// 					onClick={() => navigate(-1)}
// 					className='w-10 h-10 bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-600'
// 				>
// 					←
// 				</button>
// 				<h2 className='text-2xl font-black text-slate-900 leading-tight'>
// 					Вывод средств
// 				</h2>
// 			</header>
// 			<div className='px-6 py-8 space-y-8'>
// 				<div className='brand-gradient p-8 rounded-[2.5rem] text-white shadow-xl brand-shadow text-left'>
// 					<div className='text-[10px] font-black uppercase opacity-80 mb-1'>
// 						Ваш баланс
// 					</div>
// 					<div className='text-4xl font-black'>
// 						{user?.balance || 0} PTS
// 					</div>
// 				</div>

// 				<ElegantSelect
// 					label='Выберите Банк'
// 					placeholder='Выберите банк'
// 					value={selectedBankKey}
// 					options={Object.entries(BANK_SERVICES).map(([key, b]) => ({
// 						id: key,
// 						name: b.name,
// 						icon: b.icon,
// 					}))}
// 					onChange={(key) => setSelectedBankKey(key)}
// 				/>

// 				<div className='space-y-6'>
// 					<FormField label='Сумма баллов (PTS)'>
// 						<div className='relative'>
// 							<input
// 								type='number'
// 								value={amount}
// 								onChange={(e) => setAmount(e.target.value)}
// 								placeholder='100'
// 								className='w-full bg-indigo-50/30 border-none h-20 px-8 rounded-[2rem] text-3xl font-black focus:outline-none placeholder:text-indigo-100 transition-all pr-40'
// 							/>
// 							<div className='absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-indigo-50 flex flex-col items-end'>
// 								<span className='text-[9px] font-black text-slate-400 uppercase leading-none mb-1'>
// 									К получению
// 								</span>
// 								<span className='text-lg font-black text-emerald-600 leading-none'>
// 									{somAmount} СОМ
// 								</span>
// 							</div>
// 						</div>
// 					</FormField>

// 					<FormField label='Номер телефона для зачисления'>
// 						<input
// 							type='tel'
// 							value={recipientPhone}
// 							onChange={(e) =>
// 								setRecipientPhone(formatPhoneKG(e.target.value))
// 							}
// 							placeholder='+996'
// 							className='w-full bg-indigo-50/30 border-none h-16 px-6 rounded-2xl text-lg font-bold focus:outline-none placeholder:text-indigo-200'
// 						/>
// 					</FormField>
// 				</div>

// 				<button
// 					onClick={handleWithdraw}
// 					disabled={loading}
// 					className='w-full py-6 brand-gradient text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl brand-shadow active:scale-95 transition-transform disabled:opacity-50'
// 				>
// 					{loading ? 'Загрузка...' : 'Подтвердить вывод'}
// 				</button>

// 				<p className='text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest px-8 leading-relaxed'>
// 					Заявка будет обработана в течение 24 часов. <br /> Курс: 100
// 					PTS = 5 СОМ
// 				</p>
// 			</div>
// 		</div>
// 	)
// }

// export const BonusesPage: React.FC<{ telegramId: number }> = ({
// 	telegramId,
// }) => {
// 	const [info, setInfo] = useState<ReferralInfo | null>(null)
// 	const [loading, setLoading] = useState(true)
// 	const { showToast } = useToast()
// 	const navigate = useNavigate()

// 	useEffect(() => {
// 		apiService
// 			.apiGetReferralInfo(telegramId)
// 			.then(setInfo)
// 			.finally(() => setLoading(false))
// 	}, [telegramId])

// 	const totalEarned =
// 		(info?.referralsCount || 0) * (info?.rewardPerReferral || 0)
// 	console.log(info, 'info')

// 	const copyToClipboard = (text: string) => {
// 		navigator.clipboard.writeText(text)
// 		tg?.HapticFeedback?.notificationOccurred('success')
// 		showToast('Ссылка скопирована!', 'success')
// 	}

// 	const handleShare = () => {
// 		if (!info?.referralLink) return
// 		console.log()

// 		tg?.HapticFeedback?.impactOccurred('medium')
// 		const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(info.referralLink)}&text=${encodeURIComponent('Зарабатывай баллы вместе со мной! 💸')}`
// 		tg?.openTelegramLink(shareUrl)
// 	}

// 	const handleTask = async (taskId: string) => {
// 		tg?.HapticFeedback?.impactOccurred('light')
// 		showToast('Проверяем подписку...', 'success')
// 		try {
// 			const res = await apiService.checkSocialTask(telegramId, taskId)
// 			if (res.success) {
// 				tg?.HapticFeedback?.notificationOccurred('success')
// 				showToast(`Успешно! Начислено ${res.earned} баллов`, 'success')
// 				const updated = await apiService.apiGetReferralInfo(telegramId)
// 				setInfo(updated)
// 			} else {
// 				tg?.HapticFeedback?.notificationOccurred('error')
// 				showToast('Сначала подпишитесь на канал', 'error')
// 			}
// 		} catch (e) {
// 			showToast('Ошибка проверки', 'error')
// 		}
// 	}

// 	if (loading)
// 		return (
// 			<div className='flex items-center justify-center min-h-[60vh]'>
// 				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600'></div>
// 			</div>
// 		)

// 	return (
// 		<div className='px-5 space-y-6 py-6 pb-24 animate-in fade-in duration-500'>
// 			{/* ГЛАВНЫЙ БАННЕР */}
// 			<div className='brand-gradient p-8 rounded-[2.5rem] text-white shadow-2xl brand-shadow flex flex-col items-center text-center space-y-4'>
// 				<span className='text-5xl animate-bounce'>🎁</span>
// 				<div>
// 					<h2 className='text-2xl font-black'>Партнерка</h2>
// 					<p className='text-indigo-50 opacity-80 text-[10px] font-black uppercase tracking-[0.2em]'>
// 						Твой пассивный доход
// 					</p>
// 				</div>
// 				<div className='bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20'>
// 					<span className='text-3xl font-black'>{totalEarned}</span>
// 					<span className='text-xs font-bold uppercase ml-2'>
// 						баллов
// 					</span>
// 				</div>
// 			</div>

// 			{/* СТАТИСТИКА */}
// 			<div className='grid grid-cols-2 gap-4'>
// 				<div className='bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center'>
// 					<span className='text-[10px] font-black text-slate-400 uppercase block mb-1'>
// 						Приглашено
// 					</span>
// 					<span className='text-2xl font-black text-slate-900'>
// 						{info?.referralsCount || 0}
// 					</span>
// 					<span className='text-[10px] text-emerald-600 font-bold block'>
// 						человек
// 					</span>
// 				</div>
// 				<div className='bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center'>
// 					<span className='text-[10px] font-black text-slate-400 uppercase block mb-1'>
// 						Бонус за друга
// 					</span>
// 					<span className='text-2xl font-black text-slate-900'>
// 						{info?.rewardPerReferral || 0}
// 					</span>
// 					<span className='text-[10px] text-slate-400 font-bold block uppercase'>
// 						баллов
// 					</span>
// 				</div>
// 			</div>

// 			{/* ССЫЛКА */}
// 			<div className='bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4'>
// 				<h4 className='text-xs font-black text-slate-400 uppercase tracking-widest text-center'>
// 					Твоя реферальная ссылка
// 				</h4>
// 				<div className='flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
// 					<span className='text-[11px] font-medium text-slate-500 truncate flex-1 pl-2 italic'>
// 						{info?.referralLink}
// 					</span>
// 					<button
// 						onClick={() =>
// 							info && copyToClipboard(info.referralLink)
// 						}
// 						className='bg-white text-slate-900 p-3 rounded-xl shadow-sm active:scale-90 transition-all border border-slate-100'
// 					>
// 						📋
// 					</button>
// 					<button
// 						onClick={handleShare}
// 						className='bg-indigo-600 text-white px-4 py-3 rounded-xl active:scale-95 transition-all font-black text-[10px] uppercase'
// 					>
// 						Поделиться
// 					</button>
// 				</div>
// 			</div>

// 			{/* ЗАДАНИЯ */}
// 			<div className='space-y-4'>
// 				<h4 className='text-xs font-black text-slate-400 uppercase tracking-widest px-2'>
// 					Бонусы за подписки
// 				</h4>
// 				<div className='bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between'>
// 					<div className='flex items-center gap-4'>
// 						<div className='w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-xl'>
// 							✈️
// 						</div>
// 						<div className='text-left'>
// 							<h5 className='text-sm font-black text-slate-900'>
// 								Наш канал
// 							</h5>
// 							<p className='text-[10px] text-sky-600 font-bold uppercase'>
// 								+50 баллов
// 							</p>
// 						</div>
// 					</div>
// 					<button
// 						onClick={() => handleTask('tg_sub')}
// 						className='text-xs font-black text-indigo-600 bg-indigo-50 px-5 py-3 rounded-xl active:scale-95'
// 					>
// 						Проверить
// 					</button>
// 				</div>
// 			</div>

// 			{/* КАК ЭТО РАБОТАЕТ */}
// 			<div className='bg-slate-50 p-8 rounded-[3rem] space-y-4 border border-slate-100'>
// 				<h4 className='font-black text-slate-900 uppercase text-[10px] tracking-widest text-left'>
// 					Как это работает?
// 				</h4>
// 				<div className='space-y-6'>
// 					{[
// 						{
// 							icon: '🔗',
// 							t: 'Отправь ссылку',
// 							d: 'Поделись ссылкой в Telegram',
// 						},
// 						{
// 							icon: '👤',
// 							t: 'Друг заходит',
// 							d: 'Друг открывает приложение',
// 						},
// 						{
// 							icon: '💰',
// 							t: 'Получай баллы',
// 							d: 'Баллы начисляются мгновенно',
// 						},
// 					].map((step, i) => (
// 						<div key={i} className='flex gap-4'>
// 							<div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm'>
// 								{step.icon}
// 							</div>
// 							<div className='text-left'>
// 								<div className='text-sm font-black text-slate-900'>
// 									{step.t}
// 								</div>
// 								<div className='text-xs text-slate-400 font-medium'>
// 									{step.d}
// 								</div>
// 							</div>
// 						</div>
// 					))}
// 				</div>
// 			</div>

// 			<button
// 				onClick={() => navigate('/withdraw')}
// 				className='w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all'
// 			>
// 				Вывести баллы 💸
// 			</button>
// 		</div>
// 	)
// }

// // --- CORE APP ---

// const AppContent: React.FC = () => {
// 	const [user, setUser] = useState<User | null>(null)
// 	const [loading, setLoading] = useState(true)
// 	const [isPlusOpen, setIsPlusOpen] = useState(false)
// 	const navigate = useNavigate()
// 	const location = useLocation()
// 	const [access, setAccess] = useState<AccessStatus | null>(null)

// 	const telegramId = tg?.initDataUnsafe?.user?.id || 1810333455

// 	// Внутри компонента AppContent, перед return

// 	useEffect(() => {
// 		// Функция обработки нажатия
// 		const handleBackBtn = () => {
// 			navigate(-1) // Возвращаемся назад в истории роутера
// 		}

// 		// Подписываемся на событие нажатия
// 		tg.BackButton.onClick(handleBackBtn)

// 		// Управление видимостью кнопки в зависимости от текущего пути
// 		if (location.pathname === '/') {
// 			tg.BackButton.hide() // Скрываем на главной
// 		} else {
// 			tg.BackButton.show() // Показываем на остальных страницах
// 		}

// 		// Важно! Отписываемся при размонтировании или изменении зависимостей,
// 		// чтобы не было дублирования нажатий
// 		return () => {
// 			tg.BackButton.offClick(handleBackBtn)
// 		}
// 	}, [location, navigate]) // Зависит от смены страницы

// 	const fetchData = useCallback(async () => {
// 		try {
// 			let userData
// 			try {
// 				userData = await apiService.getUser(telegramId)
// 			} catch (e) {
// 				if (tg?.initDataUnsafe?.user) {
// 					await apiService.registerUser({
// 						telegramId,
// 						username: tg.initDataUnsafe.user.username || '',
// 						firstName: tg.initDataUnsafe.user.first_name || '',
// 						lastName: tg.initDataUnsafe.user.last_name || '',
// 						language: 'RU',
// 					})
// 					userData = await apiService.getUser(telegramId)
// 				}
// 			}
// 			if (userData) {
// 				setUser(userData)
// 				setAccess(await apiService.checkAccess(telegramId))
// 			}
// 		} catch (error) {
// 			console.error('Initial load failed:', error)
// 		} finally {
// 			setLoading(false)
// 		}
// 	}, [telegramId])

// 	useEffect(() => {
// 		if (tg) {
// 			tg.ready()
// 			tg.expand()
// 			tg.setHeaderColor('#ffffff')
// 			tg.setBackgroundColor('#f8fafc')
// 			try {
// 				tg.requestFullscreen()
// 			} catch (e) {}
// 		}
// 		fetchData()
// 	}, [fetchData])

// 	if (loading)
// 		return (
// 			<div className='min-h-screen flex items-center justify-center bg-white'>
// 				<div className='w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin' />
// 			</div>
// 		)

// 	const showNav = ['/', '/search', '/profile', '/bonuses'].includes(
// 		location.pathname,
// 	)

// 	const isDetail = location.pathname.startsWith('/detail')

// 	return (
// 		<div className='min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden'>
// 			<main
// 				style={{
// 					paddingTop: isDetail
// 						? '0'
// 						: 'calc(45px + env(safe-area-inset-top, 0px))',
// 				}}
// 				className='flex-1 w-full max-w-xl mx-auto pb-32'
// 			>
// 				<Routes>
// 					<Route path='/' element={<HomePage user={user} />} />
// 					<Route
// 						path='/search'
// 						element={<SearchPage telegramId={telegramId} />}
// 					/>
// 					<Route
// 						path='/subscription'
// 						element={<SubscriptionPage telegramId={telegramId} />}
// 					/>
// 					<Route
// 						path='/create'
// 						element={<CreatePage telegramId={telegramId} />}
// 					/>
// 					<Route
// 						path='/profile'
// 						element={
// 							<ProfilePage telegramId={telegramId} user={user} />
// 						}
// 					/>
// 					<Route
// 						path='/bonuses'
// 						element={<BonusesPage telegramId={telegramId} />}
// 					/>
// 					<Route
// 						path='/withdraw'
// 						element={<WithdrawPage telegramId={telegramId} />}
// 					/>
// 					<Route
// 						path='/detail'
// 						element={<DetailPage telegramId={telegramId} />}
// 					/>
// 					<Route path='*' element={<Navigate to='/' replace />} />
// 				</Routes>
// 			</main>
// 			{showNav && (
// 				<nav className='fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-white/40 backdrop-blur-xl'>
// 					<div className='max-w-md mx-auto bg-white border border-indigo-50 rounded-[2.5rem] p-3 flex justify-around items-center shadow-2xl relative'>
// 						<NavTab
// 							active={location.pathname === '/'}
// 							onClick={() => navigate('/')}
// 							icon={<HomeIcon />}
// 						/>
// 						<NavTab
// 							active={location.pathname === '/search'}
// 							onClick={() => navigate('/search')}
// 							icon={<SearchIcon />}
// 						/>
// 						<div
// 							className='w-16 h-16 brand-gradient text-white rounded-full flex items-center justify-center shadow-xl -mt-10 border-4 border-white transition-transform active:scale-95 cursor-pointer brand-shadow'
// 							onClick={() => setIsPlusOpen(true)}
// 						>
// 							<PlusIcon />
// 						</div>
// 						<NavTab
// 							active={location.pathname === '/bonuses'}
// 							onClick={() => navigate('/bonuses')}
// 							icon={<StarIcon />}
// 						/>
// 						<NavTab
// 							active={location.pathname === '/profile'}
// 							onClick={() => navigate('/profile')}
// 							icon={<UserIcon />}
// 						/>
// 					</div>
// 				</nav>
// 			)}
// 			<BottomSheet
// 				isOpen={isPlusOpen}
// 				onClose={() => setIsPlusOpen(false)}
// 				title='Создать публикацию'
// 			>
// 				<button
// 					onClick={() => {
// 						setIsPlusOpen(false)
// 						navigate('/create', { state: { type: 'vac' } })
// 					}}
// 					className='w-full flex items-center gap-4 p-6 bg-indigo-50/30 rounded-3xl active:bg-indigo-50 transition-all'
// 				>
// 					<div className='w-14 h-14 brand-gradient text-white flex items-center justify-center rounded-2xl font-bold'>
// 						💼
// 					</div>
// 					<div className='text-left'>
// 						<div className='font-black text-slate-900 text-lg'>
// 							Вакансия
// 						</div>
// 						<div className='text-[10px] text-indigo-400 font-bold uppercase mt-0.5 tracking-widest'>
// 							Поиск сотрудника
// 						</div>
// 					</div>
// 				</button>
// 				<button
// 					onClick={() => {
// 						setIsPlusOpen(false)
// 						navigate('/create', { state: { type: 'res' } })
// 					}}
// 					className='w-full flex items-center gap-4 p-6 bg-indigo-50/30 rounded-3xl active:bg-indigo-50 transition-all'
// 				>
// 					<div className='w-14 h-14 brand-gradient text-white flex items-center justify-center rounded-2xl font-bold'>
// 						📄
// 					</div>
// 					<div className='text-left'>
// 						<div className='font-black text-slate-900 text-lg'>
// 							Резюме
// 						</div>
// 						<div className='text-[10px] text-indigo-400 font-bold uppercase mt-0.5 tracking-widest'>
// 							Поиск работы
// 						</div>
// 					</div>
// 				</button>
// 			</BottomSheet>
// 		</div>
// 	)
// }

// const NavTab = ({ active, icon, onClick }: any) => (
// 	<button
// 		onClick={onClick}
// 		className={`flex items-center justify-center rounded-2xl transition-all w-12 h-12 ${active ? 'text-indigo-600 bg-indigo-50/80 active-tab-glow' : 'text-indigo-200'}`}
// 	>
// 		{icon}
// 	</button>
// )

// const HomeIcon = () => (
// 	<svg
// 		className='w-6 h-6'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
// 		/>
// 	</svg>
// )
// const SearchIcon = () => (
// 	<svg
// 		className='w-6 h-6'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
// 		/>
// 	</svg>
// )
// const StarIcon = () => (
// 	<svg
// 		className='w-6 h-6'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12V3c0-1.105-.895-2-2-2h-4c-1.105 0-2 .895-2 2v2M6 5v1M6 5H5C3.895 5 3 5.895 3 7v10c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2h-1M18 5v1'
// 		/>
// 	</svg>
// )
// const PlusIcon = () => (
// 	<svg
// 		className='w-8 h-8'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='3'
// 			d='M12 6v12m6-6H6'
// 		/>
// 	</svg>
// )
// const UserIcon = () => (
// 	<svg
// 		className='w-6 h-6'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
// 		/>
// 	</svg>
// )
// const BellIcon = () => (
// 	<svg
// 		className='w-6 h-6 text-indigo-600'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2'
// 			d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
// 		/>
// 	</svg>
// )
// const SearchIconSmall = () => (
// 	<svg
// 		className='w-5 h-5'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='3'
// 			d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
// 		/>
// 	</svg>
// )
// const ViewIcon = () => (
// 	<svg
// 		className='w-3.5 h-3.5'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
// 		/>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
// 		/>
// 	</svg>
// )
// const ClickIcon = () => (
// 	<svg
// 		className='w-3.5 h-3.5'
// 		fill='none'
// 		stroke='currentColor'
// 		viewBox='0 0 24 24'
// 	>
// 		<path
// 			strokeLinecap='round'
// 			strokeLinejoin='round'
// 			strokeWidth='2.5'
// 			d='M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5'
// 		/>
// 	</svg>
// )

// const App: React.FC = () => (
// 	<HashRouter>
// 		<ToastProvider>
// 			<AppContent />
// 		</ToastProvider>
// 	</HashRouter>
// )

// export default App
