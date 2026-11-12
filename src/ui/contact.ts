// Открыть WhatsApp / Telegram из Mini App (DESIGN_SPEC 6, «Нажатие WhatsApp / Telegram»)
const tg = (window as any).Telegram?.WebApp

export const isMasked = (phone?: string | null) => !!phone && phone.includes('*')

export const openWhatsApp = (phone: string | undefined | null, text: string) => {
	const digits = (phone || '').replace(/\D/g, '')
	if (digits.length < 9) return false
	const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
	if (tg?.openLink) tg.openLink(url, { try_instant_view: false })
	else window.open(url, '_blank')
	return true
}

export const openTelegram = (username: string | undefined | null) => {
	const u = (username || '').trim().replace(/^@/, '')
	if (!u) return false
	const url = `https://t.me/${u}`
	if (tg?.openTelegramLink) tg.openTelegramLink(url)
	else window.open(url, '_blank')
	return true
}

export const open2GIS = (address: string, city?: string) => {
	const url = `https://2gis.kg/search/${encodeURIComponent(`${city ? city + ', ' : ''}${address}`)}`
	if (tg?.openLink) tg.openLink(url)
	else window.open(url, '_blank')
}

/**
 * «Поделиться»: ссылка открывает карточку прямо в Mini App (startapp=vac_12 / gig_5 / company_3).
 * В Telegram — системный выбор чата, в браузере — Web Share API или копирование.
 */
export const shareListing = async (target: string, text: string): Promise<'shared' | 'copied' | 'failed'> => {
	const bot = (import.meta as any).env?.VITE_BOT_USERNAME || 'Workkg_bot'
	const link = `https://t.me/${bot}?startapp=${target}`
	if (tg?.openTelegramLink) {
		tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`)
		return 'shared'
	}
	try {
		if ((navigator as any).share) {
			await (navigator as any).share({ title: text, url: link })
			return 'shared'
		}
		await navigator.clipboard.writeText(link)
		return 'copied'
	} catch {
		return 'failed'
	}
}
