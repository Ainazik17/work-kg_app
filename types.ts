// --- ОБЩИЕ ТИПЫ ---
export interface City {
	id: number
	name: string
}

export interface Sphere {
	id: number
	name: string
	icon?: string
}

export interface Category {
	id: number
	name: string
	sphereId?: number
}

export interface Subcategory {
	id: number
	name: string
	categoryId?: number
}

// --- МЕДИА ---
export interface Media {
	id: number
	mediaType: 'PHOTO' | 'VIDEO'
	fileUrl: string
	fileName?: string
	fileSize?: number
	displayOrder?: number
	uploadedAt?: string
}

// --- ПОЛЬЗОВАТЕЛЬ ---
export interface User {
	telegramId: number
	username: string
	firstName: string
	lastName?: string
	language: string
	balance: number
}

// --- ВАКАНСИЯ ---
export interface Vacancy {
	id: number
	title: string
	voiceUrl?: string | null
	voiceDuration?: number | null
	description: string
	salary: string
	companyName: string
	phone: string
	cityName: string
	cityId: number
	categoryName: string
	categoryId: number
	subcategoryName?: string
	subcategoryId?: number
	experienceInYear: number
	isActive: boolean | null
	telegramUsername?: string
	createdAt: string
	address: string
	schedule: string
	minAge: number
	maxAge: number
	preferredGender: 'ANY' | 'MALE' | 'FEMALE'
	media: Media[]
	// Поля для UI (добавлены для поиска)
	boosted?: boolean
	free?: boolean
	distanceKm?: number
}

// --- РЕЗЮМЕ ---
export interface Resume {
	id: number
	name: string
	age: number
	gender: 'MALE' | 'FEMALE'
	cityName: string
	cityId: number
	categoryName: string
	categoryId: number
	subcategoryName?: string
	subcategoryId?: number
	experience: number
	description: string
	isActive: boolean | null
	telegramUsername?: string
	createdAt: string
	media: Media[]
	// Поля для UI
	boosted?: boolean
	free?: boolean
}

// --- СТАТИСТИКА ---
export interface EntityStats {
	viewsCount: number
	contactClicksCount: number
	responseCount?: number // Для вакансий
	invitationCount?: number // Для резюме
}

// --- ДОСТУП И ПОДПИСКА ---
export interface AccessStatus {
	hasPro: boolean
	expiresAt?: string
	canSearchEmployees: boolean
	canSearchJobs: boolean
}

export interface SubscriptionStatus {
	hasActiveSubscription: boolean
	planType: 'THREE_DAYS' | 'ONE_WEEK' | 'ONE_MONTH' | null
	startDate: string | null
	endDate: string | null
	daysLeft: number
}

// --- ПАРТНЕРКА И ВЫВОД ---
export interface ReferralInfo {
	referralCode?: string
	referralLink: string
	referralsCount: number
	rewardPerReferral: number
}

export interface BankService {
	id: string
	code: string | null
	name: string
	icon: string
	min?: number
	max?: number
}

export interface WithdrawalInfo {
	currentPoints: number
	pointsPerSom: number
}

// --- ПОДРАБОТКА (DESIGN_SPEC 6.4 / 6.4b) ---
export type GigPayUnit = 'TOTAL' | 'HOUR' | 'SHIFT'
export interface Gig {
	id: number
	title: string
	voiceUrl?: string | null
	voiceDuration?: number | null
	workDate: string // YYYY-MM-DD
	timeText?: string
	pay: number
	payUnit: GigPayUnit
	peopleCount: string
	address: string
	latitude?: number | null
	longitude?: number | null
	distanceKm?: number | null
	urgent: boolean
	cityId: number
	cityName: string
	authorName: string
	phone?: string // без PRO — с «***»
	telegramUsername?: string | null
	contactsOpen?: boolean // PRO или своё объявление
	hasPhone?: boolean
	hasTelegram?: boolean // нет username — пишем автору через бота
	isActive: boolean
	mine: boolean
	createdAt: string
}
export interface CreateGigData {
	title: string
	workDate: string
	timeText?: string
	pay: number
	payUnit: GigPayUnit
	peopleCount: string
	address: string
	latitude?: number | null
	longitude?: number | null
	urgent: boolean
	cityId?: number
	voiceKey?: string
	voiceDuration?: number
	phone?: string // WhatsApp для связи
}

export type OfferPriceUnit = 'HOUR' | 'VISIT' | 'SHIFT'
export interface WorkerOffer {
	id: number
	skills: string[]
	price: number
	priceUnit: OfferPriceUnit
	days: string[]
	district?: string
	about?: string
	cityId: number
	cityName: string
	name: string
	phone?: string
	telegramUsername?: string | null
	contactsOpen?: boolean // PRO или своё объявление
	hasPhone?: boolean
	hasTelegram?: boolean // нет username — пишем автору через бота
	isActive: boolean
	mine: boolean
	createdAt: string
}
export interface UpsertOfferData {
	skills: string[]
	price: number
	priceUnit: OfferPriceUnit
	days: string[]
	district?: string
	about?: string
	cityId?: number
	isActive?: boolean
	phone?: string // WhatsApp для связи
}

// --- Компании (DESIGN_SPEC 4, 5) ---
export interface CompanyPhoto {
	id: number
	url: string | null
	caption?: string | null
}
export interface Company {
	id: number
	name: string
	type?: string | null
	sphere?: string | null
	cityName?: string | null
	tagline?: string | null
	coverUrl?: string | null
	verified: boolean
	rating: number | null
	reviewsCount: number
	paidOnTimePct: number | null
	confirmRatePct: number | null
	vacanciesCount: number
	following: boolean
	mine: boolean
	// профиль
	about?: string | null
	perks?: string[]
	staff?: string | null
	since?: number | null
	hiredCount?: number
	followersCount?: number
	photos?: CompanyPhoto[]
	bars?: { paidOnTime: number | null; conditions: number | null; attitude: number | null }
}
export interface CompanyReview {
	id: number
	authorRole: string
	tenure?: string | null
	stars: number
	text?: string | null
	disputed: boolean
}
export interface UpsertCompanyData {
	name: string
	type?: string
	sphere: string
	tagline?: string
	about?: string
	perks?: string[]
	staff?: string
	cityId?: number
}

// --- Отклики и «Где работали» ---
export interface WorkPlace {
	place: string
	role?: string | null
	period?: string | null
}
export type ApplicationStatus = 'NEW' | 'VIEWED' | 'INVITED' | 'REJECTED'
export interface Application {
	id: number
	forEmployer: boolean
	status: ApplicationStatus
	message?: string | null
	createdAt: string
	vacancyId: number
	vacancyTitle: string
	companyName?: string | null
	vacancySalary?: string | null
	employerPhone?: string | null
	employerUsername?: string | null
	resumeId: number
	name: string
	age?: number | null
	gender?: 'MALE' | 'FEMALE' | null
	cityName?: string | null
	categoryName?: string | null
	subcategoryName?: string | null
	experience?: number | null
	description?: string | null
	photoUrl?: string | null
	phone?: string | null
	telegramUsername?: string | null
	workPlaces: WorkPlace[]
	workerRating?: number | null
	confirmedWorks: number
}
export interface GigCustomer {
	userId: number
	name: string
	companyId?: number | null
	verified: boolean
	coverUrl?: string | null
	type: string
	gigsCount: number
	rating?: number | null
	openGigs: Gig[]
}

// --- Сделки (DESIGN_SPEC 7) ---
export type DealStatus =
	| 'ASK_WORKER'
	| 'AWAIT_WORKER'
	| 'AWAIT_EMPLOYER'
	| 'CONFIRMED'
	| 'DISPUTED'
	| 'PROOF_REVIEW'
	| 'DECLINED'
export interface Deal {
	id: number
	status: DealStatus
	source: 'INVITE' | 'HIRE' | 'FOUND'
	side: 'WORKER' | 'EMPLOYER'
	title: string
	whenText: string
	otherName: string
	otherCompanyId?: number | null
	otherVerified: boolean
	vacancyId?: number | null
	gigId?: number | null
	myStars?: number | null
	otherStars?: number | null
	dueAt?: string | null
	canReview: boolean
	reviewed: boolean
	createdAt: string
}
export interface DealPerson {
	userId: number
	applicationId: number
	name: string
	rating?: number | null
	works: number
}
export interface DealVacancyRow {
	vacancyId: number
	title: string
	schedule?: string | null
	active: boolean
	closeResult?: 'HIRED' | 'NONE' | 'OUTSIDE' | null
	statusText: string
	wrote: DealPerson[]
	hired: string[]
}
export interface WorkerDeals {
	summary: { confirmedWorks: number; badgeGoal: number; verifiedWorker: boolean; pending: number }
	questions: Deal[]
	requests: Deal[]
	works: Deal[]
}
export interface EmployerDeals {
	requests: Deal[]
	vacancies: DealVacancyRow[]
	done: Deal[]
}

// --- СЕРИАЛ ---
export interface SeriesEpisode {
	id: number
	number: number
	title: string
	description?: string | null
	thumbnailUrl?: string | null
	durationSec?: number | null
	free: boolean // 1-я серия (или отмеченная) — бесплатно
	locked: boolean // нужен тариф
	videoUrl?: string | null // только у открытых
	youtubeId?: string | null // только у открытых
}
export interface Series {
	id: number
	title: string
	description?: string | null
	coverUrl?: string | null
	episodesCount: number
	hasAccess: boolean
	episodes?: SeriesEpisode[]
}

// --- ЗАДАНИЯ (подписка на канал) ---
export interface SocialTask {
	id: number
	type: 'TELEGRAM' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE'
	title: string
	link: string
	reward: number
}
export interface SocialTaskList {
	availableTasks: SocialTask[]
	completedTasks: { taskId: number; title: string; rewardGiven: number; completedAt: string }[]
}
export interface TaskCheckResult {
	status: 'DONE' | 'ALREADY_DONE' | 'NOT_SUBSCRIBED' | 'CHECK_FAILED'
	success: boolean
	earned: number
	message: string
}
