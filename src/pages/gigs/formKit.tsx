// Общее для форм подработки: черновик в sessionStorage и проверка при отправке (DESIGN_SPEC 6.x)
import { useEffect, useState } from 'react'
import { focusFirstError } from '../FormPage/MediaPicker'

/** Состояние формы, которое переживает сворачивание Telegram */
export function useDraft<T extends object>(key: string, initial: T) {
	const [value, setValue] = useState<T>(() => {
		try {
			const raw = sessionStorage.getItem(key)
			return raw ? { ...initial, ...JSON.parse(raw) } : initial
		} catch {
			return initial
		}
	})
	useEffect(() => {
		try {
			sessionStorage.setItem(key, JSON.stringify(value))
		} catch {
			/* приватный режим — черновик просто не сохранится */
		}
	}, [key, value])
	const clear = () => {
		try {
			sessionStorage.removeItem(key)
		} catch {
			/* ignore */
		}
	}
	return [value, setValue, clear] as const
}

/**
 * Ошибки показываются только после первой попытки отправки
 * и пропадают, как только поле исправлено (их пересчитываем на каждом рендере).
 */
export function useSubmitCheck<E extends Record<string, string | undefined>>(errors: E) {
	const [tried, setTried] = useState(false)
	const shown = (tried ? errors : {}) as Partial<E>
	const hasErrors = Object.values(errors).some(Boolean)
	const attempt = (onInvalid: () => void) => {
		setTried(true)
		if (hasErrors) {
			onInvalid()
			focusFirstError()
			return false
		}
		return true
	}
	return { shown, attempt }
}

/** Номер для WhatsApp в формах подработки: +996 и 9 цифр */
export const phoneError = (phone: string) =>
	phone.replace(/\D/g, '').length === 12 ? undefined : 'Укажите номер WhatsApp: +996 и 9 цифр'

/**
 * Подставить известный номер (профиль, прошлые вакансии/резюме), если в черновике пусто.
 * Mini App регистрирует без телефона, поэтому без этого поля заказчику некуда было писать в WhatsApp.
 */
export function usePrefillPhone(known: string | null | undefined, current: string, setPhone: (p: string) => void) {
	useEffect(() => {
		if (known && current.replace(/\D/g, '').length <= 3) setPhone(known)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [known])
}

/** Есть ли у текущего пользователя username в Telegram (без него пишут через бота) */
export const myTelegramUsername = (): string =>
	((window as any).Telegram?.WebApp?.initDataUnsafe?.user?.username as string) || ''
