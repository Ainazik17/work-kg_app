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
