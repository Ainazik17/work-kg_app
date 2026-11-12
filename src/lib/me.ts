// Текущий пользователь Telegram (в браузере без Telegram — тестовый id, как в AppContent)
export const getTelegramId = (): number =>
	(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 1810333455
