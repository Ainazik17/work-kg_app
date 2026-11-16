import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { configureStore } from '@reduxjs/toolkit'
import {
	Category,
	City,
	Resume,
	Sphere,
	Subcategory,
	User,
	Vacancy,
	ReferralInfo,
	AccessStatus,
	Gig,
	CreateGigData,
	WorkerOffer,
	UpsertOfferData,
	Company,
	CompanyReview,
	UpsertCompanyData,
	Application,
	ApplicationStatus,
	WorkPlace,
	GigCustomer,
	Deal,
	WorkerDeals,
	EmployerDeals,
	DealVacancyRow,
	Series,
	SocialTaskList,
	TaskCheckResult,
} from '@/types'

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || 'https://workkg.com/api'

export const workKgApi = createApi({
	reducerPath: 'workKgApi',
	baseQuery: fetchBaseQuery({
		baseUrl: API_BASE_URL,
		// Подпись Telegram: бэкенд проверяет, что запрос идёт от того же пользователя, что и telegramId
		prepareHeaders: (headers) => {
			const initData = (window as any).Telegram?.WebApp?.initData
			if (initData) headers.set('X-Telegram-Init-Data', initData)
			return headers
		},
	}),
	tagTypes: [
		'User',
		'Vacancy',
		'Resume',
		'ProfileList',
		'Subscription',
		'Stats',
		'Referral',
		'Gig',
		'Offer',
		'Company',
		'Application',
		'Saved',
		'Notify',
		'Deal',
		'Series',
	],
	endpoints: (builder) => ({
		// --- ПОЛЬЗОВАТЕЛЬ ---
		getUser: builder.query<User, number>({
			query: (id) => `/bot/users/${id}`,
			providesTags: ['User'],
		}),
		registerUser: builder.mutation<void, any>({
			query: (data) => ({
				url: '/bot/users/register',
				method: 'POST',
				body: data,
			}),
			invalidatesTags: ['User'],
		}),

		// --- СПРАВОЧНИКИ ---
		getCities: builder.query<City[], number>({
			query: (id) => `/cities/${id}`,
			keepUnusedDataFor: 3600,
		}),
		getSpheres: builder.query<Sphere[], number>({
			query: (id) => `/categories/sphere/${id}`,
			keepUnusedDataFor: 3600,
		}),
		getCategories: builder.query<Category[], { tid: number; sid: number }>({
			query: ({ tid, sid }) => `/categories/${tid}/${sid}`,
			keepUnusedDataFor: 3600,
		}),
		getSubcategories: builder.query<
			Subcategory[],
			{ tid: number; cid: number }
		>({
			query: ({ tid, cid }) => `/subcategories/category/${tid}/${cid}`,
			keepUnusedDataFor: 3600,
		}),

		// --- ЗАГРУЗКА МЕДИА (BATCH ТОЛЬКО ДЛЯ ВАКАНСИЙ) ---
		uploadMediaBatch: builder.mutation<
			void,
			{
				entity: 'vacancies' | 'resumes' // Добавили выбор сущности
				id: number
				tid: number
				files: File[]
			}
		>({
			query: ({ entity, id, tid, files }) => {
				const formData = new FormData()
				files.forEach((file) => {
					formData.append('files', file)
				})

				return {
					// Динамический URL: /bot/vacancies/... или /bot/resumes/...
					url: `/bot/${entity}/${id}/media/batch`,
					method: 'POST',
					body: formData,
					params: { telegramId: tid },
				}
			},
			// Умная инвалидация кэша в зависимости от того, что обновляли
			invalidatesTags: (result, error, { entity, id }) => [
				{ type: entity === 'vacancies' ? 'Vacancy' : 'Resume', id },
				'ProfileList',
			],
		}),

		// Для резюме пока оставляем старый метод или создаем новый,
		// если бэкенд поддерживает batch и для резюме - скажи, добавлю.
		// Пока оставил uploadMediaMutation удаленным, как ты просил.

		// --- ОСТАЛЬНЫЕ МЕТОДЫ (Без изменений) ---
		updateVacancyStatus: builder.mutation<
			void,
			{ id: number; tid: number; isActive: boolean }
		>({
			query: ({ id, tid, isActive }) => ({
				url: `/bot/vacancies/${id}/status`,
				method: 'PUT',
				params: { telegramId: tid, isActive },
			}),
			invalidatesTags: ['ProfileList', 'Vacancy'],
		}),
		updateResumeStatus: builder.mutation<
			void,
			{ id: number; tid: number; isActive: boolean }
		>({
			query: ({ id, tid, isActive }) => ({
				url: `/bot/resumes/${id}/status`,
				method: 'PUT',
				params: { telegramId: tid, isActive },
			}),
			invalidatesTags: ['ProfileList', 'Resume'],
		}),
		deleteVacancy: builder.mutation<void, { id: number; tid: number }>({
			query: ({ id, tid }) => ({
				url: `/bot/vacancies/${id}`,
				method: 'DELETE',
				params: { telegramId: tid },
			}),
			invalidatesTags: ['ProfileList'],
		}),
		deleteResume: builder.mutation<void, { id: number; tid: number }>({
			query: ({ id, tid }) => ({
				url: `/bot/resumes/${id}`,
				method: 'DELETE',
				params: { telegramId: tid },
			}),
			invalidatesTags: ['ProfileList'],
		}),
		searchVacancies: builder.query<Vacancy[], any>({
			query: (args) => {
				const { tid, userLatitude, userLongitude, ...filters } = args
				const queryParams: any = { telegramId: tid }
				if (typeof userLatitude === 'number')
					queryParams.userLatitude = userLatitude
				if (typeof userLongitude === 'number')
					queryParams.userLongitude = userLongitude

				return {
					url: '/bot/search/vacancies',
					method: 'POST',
					body: filters,
					params: queryParams,
				}
			},
			transformResponse: (response: { results: Vacancy[] }) =>
				response.results,
		}),
		searchResumes: builder.query<Resume[], any>({
			query: ({ tid, ...body }) => ({
				url: '/bot/search/resumes',
				method: 'POST',
				body,
				params: { telegramId: tid },
			}),
			transformResponse: (response: { results: Resume[] }) =>
				response.results,
		}),
		getVacancyDetail: builder.query<
			Vacancy,
			{ id: number; tid: number; isProfile: boolean }
		>({
			query: ({ id, tid, isProfile }) => ({
				url: `/bot/vacancies/${id}/${tid}`,
				params: { isProfile },
			}),
			providesTags: (result, error, { id }) => [{ type: 'Vacancy', id }],
		}),
		getResumeDetail: builder.query<
			Resume,
			{ id: number; tid: number; isProfile: boolean }
		>({
			query: ({ id, tid, isProfile }) => ({
				url: `/bot/resumes/${id}/${tid}`,
				params: { isProfile },
			}),
			providesTags: (result, error, { id }) => [{ type: 'Resume', id }],
		}),
		createVacancy: builder.mutation<Vacancy, { tid: number; data: any }>({
			query: ({ tid, data }) => ({
				url: '/bot/vacancies',
				method: 'POST',
				body: data,
				params: { telegramId: tid },
			}),
			invalidatesTags: ['ProfileList', 'Vacancy'],
		}),
		updateVacancy: builder.mutation<
			Vacancy,
			{ id: number; tid: number; data: any }
		>({
			query: ({ id, tid, data }) => ({
				url: `/bot/vacancies/${id}/update/${tid}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [
				'ProfileList',
				{ type: 'Vacancy', id },
			],
		}),
		createResume: builder.mutation<Resume, { tid: number; data: any }>({
			query: ({ tid, data }) => ({
				url: '/bot/resumes',
				method: 'POST',
				body: data,
				params: { telegramId: tid },
			}),
			invalidatesTags: ['ProfileList', 'Resume'],
		}),
		updateResume: builder.mutation<
			Resume,
			{ id: number; tid: number; data: any }
		>({
			query: ({ id, tid, data }) => ({
				url: `/bot/resumes/${id}/update/${tid}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [
				'ProfileList',
				{ type: 'Resume', id },
			],
		}),
		getUserVacancies: builder.query<Vacancy[], number>({
			query: (tid) => `/bot/vacancies/user/${tid}`,
			providesTags: ['ProfileList'],
		}),
		getUserResumes: builder.query<Resume[], number>({
			query: (tid) => `/bot/resumes/user/${tid}`,
			providesTags: ['ProfileList'],
		}),
		getRecommendedVacancies: builder.query<
			Vacancy[],
			{ tid: number; limit?: number }
		>({
			query: ({ tid, limit = 10 }) => ({
				url: `/bot/recommended/vacancies`,
				params: { telegramId: tid, limit },
			}),
			providesTags: ['Vacancy'],
		}),
		getVacancyStats: builder.query<any, number>({
			query: (id) => `/statistic/vacancies/${id}`,
			providesTags: (result, error, id) => [{ type: 'Stats', id }],
		}),
		getResumeStats: builder.query<any, number>({
			query: (id) => `/statistic/resumes/${id}`,
			providesTags: (result, error, id) => [{ type: 'Stats', id }],
		}),
		trackView: builder.mutation<
			void,
			{ type: 'job' | 'worker'; id: number }
		>({
			query: ({ type, id }) => ({
				url: `/statistic/${type === 'job' ? 'vacancies' : 'resumes'}/${id}/view`,
				method: 'POST',
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Stats', id }],
		}),
		trackContactClick: builder.mutation<
			void,
			{ type: 'job' | 'worker'; id: number; tid: number }
		>({
			query: ({ type, id, tid }) => ({
				url: `/statistic/${type === 'job' ? 'vacancies' : 'resumes'}/${id}/contact-click`,
				method: 'POST',
				params: { telegramId: tid },
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Stats', id }],
		}),
		checkAccess: builder.query<AccessStatus, number>({
			query: (tid) => `/bot/access/${tid}/check`,
		}),
		getSubscriptionStatus: builder.query<any, number>({
			query: (tid) => `/bot/subscriptions/${tid}/status`,
			providesTags: ['Subscription'],
		}),
		getReferralInfo: builder.query<ReferralInfo, number>({
			query: (tid) => `/bot/referrals/${tid}/info`,
			providesTags: ['Referral'],
		}),
		checkSocialTask: builder.query<any, { tid: number; taskId: string }>({
			query: ({ tid, taskId }) => ({
				url: `/bot/tasks/${taskId}/check`,
				params: { telegramId: tid },
			}),
		}),
		withdrawPoints: builder.mutation<any, { tid: number; data: any }>({
			query: ({ tid, data }) => ({
				url: '/bot/points/withdraw',
				method: 'POST',
				body: data,
				headers: { 'X-Telegram-Id': tid.toString() },
				responseHandler: async (response) => {
					if (
						response.status === 204 ||
						response.headers.get('content-length') === '0'
					)
						return {}
					const text = await response.text()
					try {
						return JSON.parse(text)
					} catch {
						return { status: text || 'success' }
					}
				},
			}),
			invalidatesTags: ['User'],
		}),
		createPayment: builder.mutation<any, { tid: number; planType: string }>(
			{
				query: ({ tid, planType }) => ({
					url: `/bot/payments/create/${tid}`,
					method: 'POST',
					body: {
						planType,
						redirectUrl: 'https://t.me/work_random_bot',
					},
				}),
			},
		),
		boostVacancy: builder.mutation<void, { id: number; tid: number }>({
			query: ({ id, tid }) => ({
				url: `/bot/boost/vacancies/${id}/points`,
				method: 'POST',
				params: { telegramId: tid },
			}),
			invalidatesTags: ['User', 'ProfileList', 'Vacancy'],
		}),
		boostResume: builder.mutation<void, { id: number; tid: number }>({
			query: ({ id, tid }) => ({
				url: `/bot/boost/resumes/${id}/points`,
				method: 'POST',
				params: { telegramId: tid },
			}),
			invalidatesTags: ['User', 'ProfileList', 'Resume'],
		}),
		getBoostStatus: builder.query<any, { type: 'vac' | 'res'; id: number }>(
			{
				query: ({ type, id }) =>
					`/bot/boost/${type === 'vac' ? 'vacancies' : 'resumes'}/${id}/status`,
			},
		),

		// --- ПОДРАБОТКА: разовые задания ---
		getGigs: builder.query<
			Gig[],
			{ tid: number; cityId?: number; lat?: number | null; lon?: number | null }
		>({
			query: ({ tid, cityId, lat, lon }) => ({
				url: '/bot/gigs',
				params: {
					telegramId: tid,
					...(cityId ? { cityId } : {}),
					...(lat != null && lon != null ? { lat, lon } : {}),
				},
			}),
			providesTags: ['Gig'],
		}),
		getGig: builder.query<Gig, { id: number; tid: number }>({
			query: ({ id, tid }) => ({ url: `/bot/gigs/${id}`, params: { telegramId: tid } }),
			providesTags: ['Gig'],
		}),
		getMyGigs: builder.query<Gig[], number>({
			query: (tid) => `/bot/gigs/user/${tid}`,
			providesTags: ['Gig'],
		}),
		createGig: builder.mutation<Gig, { tid: number; data: CreateGigData }>({
			query: ({ tid, data }) => ({
				url: '/bot/gigs',
				method: 'POST',
				params: { telegramId: tid },
				body: data,
			}),
			invalidatesTags: ['Gig'],
		}),
		updateGigStatus: builder.mutation<Gig, { id: number; tid: number; isActive: boolean }>({
			query: ({ id, tid, isActive }) => ({
				url: `/bot/gigs/${id}/status`,
				method: 'PUT',
				params: { telegramId: tid, isActive },
			}),
			invalidatesTags: ['Gig'],
		}),
		deleteGig: builder.mutation<void, { id: number; tid: number }>({
			query: ({ id, tid }) => ({
				url: `/bot/gigs/${id}`,
				method: 'DELETE',
				params: { telegramId: tid },
			}),
			invalidatesTags: ['Gig'],
		}),

		// --- ПОДРАБОТКА: «Мои услуги» ---
		getMyOffer: builder.query<WorkerOffer | null, number>({
			query: (tid) => ({
				url: `/bot/offers/user/${tid}`,
				// 204 — карточки ещё нет
				responseHandler: async (r) => (r.status === 204 ? null : r.json()),
			}),
			providesTags: ['Offer'],
		}),
		getOffers: builder.query<WorkerOffer[], { tid: number; cityId?: number }>({
			query: ({ tid, cityId }) => ({
				url: '/bot/offers',
				params: { telegramId: tid, ...(cityId ? { cityId } : {}) },
			}),
			providesTags: ['Offer'],
		}),
		getOffer: builder.query<WorkerOffer, { id: number; tid: number }>({
			query: ({ id, tid }) => ({ url: `/bot/offers/${id}`, params: { telegramId: tid } }),
			providesTags: ['Offer'],
		}),
		upsertOffer: builder.mutation<WorkerOffer, { tid: number; data: UpsertOfferData }>({
			query: ({ tid, data }) => ({
				url: '/bot/offers',
				method: 'PUT',
				params: { telegramId: tid },
				body: data,
			}),
			invalidatesTags: ['Offer'],
		}),
		updateOfferStatus: builder.mutation<WorkerOffer, { tid: number; isActive: boolean }>({
			query: ({ tid, isActive }) => ({
				url: `/bot/offers/user/${tid}/status`,
				method: 'PUT',
				params: { isActive },
			}),
			invalidatesTags: ['Offer'],
		}),

		// --- КОМПАНИИ ---
		getCompanies: builder.query<Company[], { tid?: number; q?: string; sphere?: string }>({
			query: ({ tid, q, sphere }) => ({
				url: '/bot/companies',
				params: {
					...(tid ? { telegramId: tid } : {}),
					...(q ? { q } : {}),
					...(sphere ? { sphere } : {}),
				},
			}),
			providesTags: ['Company'],
		}),
		getCompany: builder.query<Company, { id: number; tid?: number }>({
			query: ({ id, tid }) => ({ url: `/bot/companies/${id}`, params: tid ? { telegramId: tid } : {} }),
			providesTags: ['Company'],
		}),
		getCompanyVacancies: builder.query<Vacancy[], { id: number; tid?: number }>({
			query: ({ id, tid }) => ({
				url: `/bot/companies/${id}/vacancies`,
				params: tid ? { telegramId: tid } : {},
			}),
			providesTags: ['Company', 'Vacancy'],
		}),
		getCompanyReviews: builder.query<CompanyReview[], number>({
			query: (id) => `/bot/companies/${id}/reviews`,
			providesTags: ['Company'],
		}),
		getCompanyByVacancy: builder.query<Company | null, number>({
			query: (vacancyId) => ({
				url: `/bot/companies/by-vacancy/${vacancyId}`,
				responseHandler: async (r) => (r.status === 204 ? null : r.json()),
			}),
			providesTags: ['Company'],
		}),
		getMyCompany: builder.query<Company | null, number>({
			query: (tid) => ({
				url: `/bot/companies/user/${tid}`,
				responseHandler: async (r) => (r.status === 204 ? null : r.json()),
			}),
			providesTags: ['Company'],
		}),
		getFollowedCompanies: builder.query<Company[], number>({
			query: (tid) => `/bot/companies/following/${tid}`,
			providesTags: ['Company'],
		}),
		upsertCompany: builder.mutation<Company, { tid: number; data: UpsertCompanyData }>({
			query: ({ tid, data }) => ({
				url: '/bot/companies',
				method: 'PUT',
				params: { telegramId: tid },
				body: data,
			}),
			invalidatesTags: ['Company'],
		}),
		followCompany: builder.mutation<void, { id: number; tid: number; on: boolean }>({
			query: ({ id, tid, on }) => ({
				url: `/bot/companies/${id}/follow`,
				method: on ? 'POST' : 'DELETE',
				params: { telegramId: tid },
			}),
			// Оптимистично: кнопка переключается сразу, при ошибке откатываем
			async onQueryStarted({ id, tid, on }, { dispatch, queryFulfilled }) {
				const patch = dispatch(
					workKgApi.util.updateQueryData('getCompany', { id, tid }, (c) => {
						c.following = on
						if (c.followersCount != null) c.followersCount += on ? 1 : -1
					}),
				)
				try {
					await queryFulfilled
				} catch {
					patch.undo()
				}
			},
			invalidatesTags: ['Company'],
		}),
		uploadCompanyPhoto: builder.mutation<
			Company,
			{ tid: number; file: File; caption?: string; cover?: boolean }
		>({
			query: ({ tid, file, caption, cover }) => {
				const body = new FormData()
				body.append('file', file)
				if (caption) body.append('caption', caption)
				return {
					url: '/bot/companies/photos',
					method: 'POST',
					params: { telegramId: tid, cover: !!cover },
					body,
				}
			},
			invalidatesTags: ['Company'],
		}),
		// --- СДЕЛКИ ---
		getWorkerDeals: builder.query<WorkerDeals, number>({
			query: (tid) => ({ url: '/bot/deals/worker', params: { telegramId: tid } }),
			providesTags: ['Deal'],
		}),
		getEmployerDeals: builder.query<EmployerDeals, number>({
			query: (tid) => ({ url: '/bot/deals/employer', params: { telegramId: tid } }),
			providesTags: ['Deal'],
		}),
		getDealsPending: builder.query<{ count: number }, number>({
			query: (tid) => ({ url: '/bot/deals/pending', params: { telegramId: tid } }),
			providesTags: ['Deal'],
		}),
		getDeal: builder.query<Deal, { tid: number; id: number }>({
			query: ({ tid, id }) => ({ url: `/bot/deals/${id}`, params: { telegramId: tid } }),
			providesTags: ['Deal'],
		}),
		dealAction: builder.mutation<
			Deal,
			{ tid: number; id: number; action: 'answer' | 'confirm' | 'rate' | 'dispute'; stars?: number; yes?: boolean }
		>({
			query: ({ tid, id, action, stars, yes }) => ({
				url: `/bot/deals/${id}/${action}`,
				method: 'POST',
				params: {
					telegramId: tid,
					...(stars != null ? { stars } : {}),
					...(yes != null ? { yes } : {}),
				},
			}),
			invalidatesTags: ['Deal', 'User', 'Company'],
		}),
		reviewDeal: builder.mutation<Deal, { tid: number; id: number; a: number; b: number; c: number; text?: string }>({
			query: ({ tid, id, ...body }) => ({
				url: `/bot/deals/${id}/review`,
				method: 'POST',
				params: { telegramId: tid },
				body,
			}),
			invalidatesTags: ['Deal', 'Company'],
		}),
		uploadDealProof: builder.mutation<Deal, { tid: number; id: number; kind: string; file: File }>({
			query: ({ tid, id, kind, file }) => {
				const body = new FormData()
				body.append('file', file)
				return { url: `/bot/deals/${id}/proof`, method: 'POST', params: { telegramId: tid, kind }, body }
			},
			invalidatesTags: ['Deal'],
		}),
		closeVacancyHiring: builder.mutation<
			DealVacancyRow,
			{ tid: number; vacancyId: number; result: 'HIRED' | 'NONE' | 'OUTSIDE'; workerIds?: number[] }
		>({
			query: ({ tid, vacancyId, ...body }) => ({
				url: `/bot/deals/vacancies/${vacancyId}/close`,
				method: 'POST',
				params: { telegramId: tid },
				body,
			}),
			invalidatesTags: ['Deal', 'ProfileList', 'Vacancy', 'Company'],
		}),

		// --- СОХРАНЁННЫЕ ---
		getSavedIds: builder.query<number[], number>({
			query: (tid) => ({ url: '/bot/saved/ids', params: { telegramId: tid } }),
			providesTags: ['Saved'],
		}),
		getSaved: builder.query<Vacancy[], number>({
			query: (tid) => ({ url: '/bot/saved', params: { telegramId: tid } }),
			providesTags: ['Saved'],
		}),
		toggleSaved: builder.mutation<void, { tid: number; vacancyId: number; on: boolean }>({
			query: ({ tid, vacancyId, on }) => ({
				url: `/bot/saved/${vacancyId}`,
				method: on ? 'POST' : 'DELETE',
				params: { telegramId: tid },
			}),
			// Сердечко переключается сразу; при ошибке откатываем
			async onQueryStarted({ tid, vacancyId, on }, { dispatch, queryFulfilled }) {
				const patch = dispatch(
					workKgApi.util.updateQueryData('getSavedIds', tid, (ids) =>
						on ? (ids.includes(vacancyId) ? ids : [vacancyId, ...ids]) : ids.filter((x) => x !== vacancyId),
					),
				)
				try {
					await queryFulfilled
					dispatch(workKgApi.util.invalidateTags(['Saved']))
				} catch {
					patch.undo()
				}
			},
		}),

		// --- НАСТРОЙКИ УВЕДОМЛЕНИЙ ---
		getNotifySettings: builder.query<Record<'vacancies' | 'resumes' | 'gigs' | 'companies', boolean>, number>({
			query: (tid) => ({ url: '/bot/notify-settings', params: { telegramId: tid } }),
			providesTags: ['Notify'],
		}),
		updateNotifySettings: builder.mutation<
			Record<'vacancies' | 'resumes' | 'gigs' | 'companies', boolean>,
			{ tid: number; patch: Partial<Record<'vacancies' | 'resumes' | 'gigs' | 'companies', boolean>> }
		>({
			query: ({ tid, patch }) => ({ url: '/bot/notify-settings', method: 'PUT', params: { telegramId: tid }, body: patch }),
			async onQueryStarted({ tid, patch }, { dispatch, queryFulfilled }) {
				const p = dispatch(
					workKgApi.util.updateQueryData('getNotifySettings', tid, (d) => Object.assign(d, patch)),
				)
				try {
					await queryFulfilled
				} catch {
					p.undo()
				}
			},
		}),

		// --- ГОЛОСОВОЕ ---
		uploadVoice: builder.mutation<
			{ key: string; url: string; duration: number },
			{ tid: number; file: Blob; duration: number; ext: string }
		>({
			query: ({ tid, file, duration, ext }) => {
				const body = new FormData()
				body.append('file', file, `voice${ext}`)
				return { url: '/bot/voice', method: 'POST', params: { telegramId: tid, duration }, body }
			},
		}),

		// --- ОТКЛИКИ ---
		applyToVacancy: builder.mutation<
			Application,
			{ tid: number; vacancyId: number; resumeId?: number; message?: string }
		>({
			query: ({ tid, ...body }) => ({
				url: '/bot/applications',
				method: 'POST',
				params: { telegramId: tid },
				body,
			}),
			invalidatesTags: ['Application'],
		}),
		getMyApplications: builder.query<Application[], number>({
			query: (tid) => ({ url: '/bot/applications/mine', params: { telegramId: tid } }),
			providesTags: ['Application'],
		}),
		getVacancyApplications: builder.query<Application[], { tid: number; vacancyId: number }>({
			query: ({ tid, vacancyId }) => ({
				url: `/bot/applications/vacancy/${vacancyId}`,
				params: { telegramId: tid },
			}),
			providesTags: ['Application'],
		}),
		getApplicationCounts: builder.query<Record<string, { total: number; fresh: number }>, number>({
			query: (tid) => ({ url: '/bot/applications/counts', params: { telegramId: tid } }),
			providesTags: ['Application'],
		}),
		getApplication: builder.query<Application, { tid: number; id: number }>({
			query: ({ tid, id }) => ({ url: `/bot/applications/${id}`, params: { telegramId: tid } }),
			providesTags: ['Application'],
		}),
		decideApplication: builder.mutation<
			Application,
			{ tid: number; id: number; status: Extract<ApplicationStatus, 'INVITED' | 'REJECTED'> }
		>({
			query: ({ tid, id, status }) => ({
				url: `/bot/applications/${id}/status`,
				method: 'PUT',
				params: { telegramId: tid, status },
			}),
			invalidatesTags: ['Application'],
		}),
		getWorkPlaces: builder.query<WorkPlace[], number>({
			query: (resumeId) => `/bot/resumes/${resumeId}/work-places`,
			providesTags: ['Resume'],
		}),
		getTopGigCustomers: builder.query<GigCustomer[], number | undefined>({
			query: (tid) => ({ url: '/bot/gigs/top-customers', params: tid ? { telegramId: tid } : {} }),
			providesTags: ['Gig', 'Company'],
		}),
		// Профиль: телефон (в т.ч. из прошлых вакансий/резюме) — подставляем в формы подработки
		getUserProfile: builder.query<{ phone?: string | null; username?: string | null }, number>({
			query: (tid) => `/bot/users/${tid}/profile`,
			providesTags: ['User'],
		}),
		// Актуальный username/имя из Telegram (пользователь мог завести username после регистрации)
		syncUser: builder.mutation<void, { tid: number; data: { username?: string; firstName?: string; lastName?: string } }>({
			query: ({ tid, data }) => ({ url: `/bot/users/${tid}`, method: 'PUT', body: data }),
		}),
		// Автор без username: бот пересылает ему, что с ним хотят связаться
		contactGigAuthor: builder.mutation<{ sent: boolean }, { id: number; tid: number }>({
			query: ({ id, tid }) => ({ url: `/bot/gigs/${id}/contact`, method: 'POST', params: { telegramId: tid } }),
		}),
		contactOfferAuthor: builder.mutation<{ sent: boolean }, { id: number; tid: number }>({
			query: ({ id, tid }) => ({ url: `/bot/offers/${id}/contact`, method: 'POST', params: { telegramId: tid } }),
		}),
		// Задания «Подпишитесь на канал» на экране «Бонусы»
		getSocialTasks: builder.query<SocialTaskList, number>({
			query: (tid) => `/bot/tasks/${tid}`,
			providesTags: ['Referral'],
		}),
		checkTask: builder.mutation<TaskCheckResult, { tid: number; taskId: number }>({
			query: ({ tid, taskId }) => ({ url: `/bot/tasks/${taskId}/check`, method: 'POST', params: { telegramId: tid } }),
			invalidatesTags: ['Referral', 'User'],
		}),
		// Раздел «Сериал»
		getSeriesList: builder.query<Series[], number>({
			query: (tid) => ({ url: '/bot/series', params: { telegramId: tid } }),
			providesTags: ['Series', 'Subscription'],
		}),
		getSeries: builder.query<Series, { id: number; tid: number }>({
			query: ({ id, tid }) => ({ url: `/bot/series/${id}`, params: { telegramId: tid } }),
			providesTags: ['Series', 'Subscription'],
		}),
		deleteCompanyPhoto: builder.mutation<void, { tid: number; photoId: number }>({
			query: ({ tid, photoId }) => ({
				url: `/bot/companies/photos/${photoId}`,
				method: 'DELETE',
				params: { telegramId: tid },
			}),
			invalidatesTags: ['Company'],
		}),
	}),
})

export const {
	useGetUserQuery,
	useRegisterUserMutation,
	useGetUserProfileQuery,
	useSyncUserMutation,
	useContactGigAuthorMutation,
	useContactOfferAuthorMutation,
	useGetSocialTasksQuery,
	useCheckTaskMutation,
	useGetSeriesListQuery,
	useGetSeriesQuery,
	useGetCitiesQuery,
	useGetSpheresQuery,
	useGetCategoriesQuery,
	useGetSubcategoriesQuery,
	useSearchVacanciesQuery,
	useSearchResumesQuery,
	useGetVacancyDetailQuery,
	useGetResumeDetailQuery,
	useCreateVacancyMutation,
	useUpdateVacancyMutation,
	useCreateResumeMutation,
	useUpdateResumeMutation,
	useGetUserVacanciesQuery,
	useGetUserResumesQuery,
	useGetRecommendedVacanciesQuery,
	useGetVacancyStatsQuery,
	useGetResumeStatsQuery,
	useTrackViewMutation,
	useTrackContactClickMutation,
	useCheckAccessQuery,
	useGetSubscriptionStatusQuery,
	useGetReferralInfoQuery,
	useCheckSocialTaskQuery,
	useWithdrawPointsMutation,
	useCreatePaymentMutation,
	useBoostVacancyMutation,
	useBoostResumeMutation,
	useGetBoostStatusQuery,
	useUpdateVacancyStatusMutation,
	useUpdateResumeStatusMutation,
	useDeleteVacancyMutation,
	useDeleteResumeMutation,
	// Экспортируем новый хук
	useUploadMediaBatchMutation,
	useGetGigsQuery,
	useGetGigQuery,
	useGetMyGigsQuery,
	useCreateGigMutation,
	useUpdateGigStatusMutation,
	useDeleteGigMutation,
	useGetMyOfferQuery,
	useGetOffersQuery,
	useGetOfferQuery,
	useUpsertOfferMutation,
	useUpdateOfferStatusMutation,
	useGetCompaniesQuery,
	useGetCompanyQuery,
	useGetCompanyVacanciesQuery,
	useGetCompanyReviewsQuery,
	useGetCompanyByVacancyQuery,
	useGetMyCompanyQuery,
	useGetFollowedCompaniesQuery,
	useUpsertCompanyMutation,
	useFollowCompanyMutation,
	useUploadCompanyPhotoMutation,
	useDeleteCompanyPhotoMutation,
	useApplyToVacancyMutation,
	useUploadVoiceMutation,
	useGetSavedIdsQuery,
	useGetWorkerDealsQuery,
	useGetEmployerDealsQuery,
	useGetDealsPendingQuery,
	useGetDealQuery,
	useDealActionMutation,
	useReviewDealMutation,
	useUploadDealProofMutation,
	useCloseVacancyHiringMutation,
	useGetSavedQuery,
	useToggleSavedMutation,
	useGetNotifySettingsQuery,
	useUpdateNotifySettingsMutation,
	useGetMyApplicationsQuery,
	useGetVacancyApplicationsQuery,
	useGetApplicationCountsQuery,
	useGetApplicationQuery,
	useDecideApplicationMutation,
	useGetWorkPlacesQuery,
	useGetTopGigCustomersQuery,
} = workKgApi

export const store = configureStore({
	reducer: { [workKgApi.reducerPath]: workKgApi.reducer },
	middleware: (getDefault) => getDefault().concat(workKgApi.middleware),
})
