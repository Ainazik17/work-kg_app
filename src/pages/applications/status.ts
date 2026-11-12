import type { ApplicationStatus } from '../../../types'

/** Подписи статусов: для работодателя и для соискателя */
export const STATUS_EMPLOYER: Record<ApplicationStatus, { label: string; tone: 'brand' | 'muted' | 'ok' | 'warn' }> = {
	NEW: { label: 'Новый', tone: 'brand' },
	VIEWED: { label: 'Просмотрен', tone: 'muted' },
	INVITED: { label: 'Приглашён', tone: 'ok' },
	REJECTED: { label: 'Отказ', tone: 'muted' },
}
export const STATUS_APPLICANT: Record<ApplicationStatus, { label: string; tone: 'brand' | 'muted' | 'ok' | 'warn' }> = {
	NEW: { label: 'Отправлен', tone: 'muted' },
	VIEWED: { label: 'Просмотрен', tone: 'warn' },
	INVITED: { label: 'Вас приглашают', tone: 'ok' },
	REJECTED: { label: 'Выбрали другого', tone: 'muted' },
}

export const ago = (iso: string) => {
	const d = new Date(iso)
	const min = Math.round((Date.now() - d.getTime()) / 60000)
	if (min < 1) return 'только что'
	if (min < 60) return `${min} мин назад`
	const h = Math.round(min / 60)
	if (h < 24) return `${h} ч назад`
	return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
