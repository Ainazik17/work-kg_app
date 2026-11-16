// Кнопки «WhatsApp / Telegram» на карточке задания и исполнителя.
// Нет номера — WhatsApp не показываем. Нет username — «Telegram» просит бота передать автору,
// что с ним хотят связаться (бот присылает ссылку на ваш профиль и ваши контакты).
import React, { useState } from 'react'
import { Button } from './wk'
import { openTelegram, openWhatsApp } from './contact'

type Props = {
	phone?: string | null
	telegramUsername?: string | null
	waText: string
	/** POST …/{id}/contact; true — отправлено, false — уже писали недавно */
	relay: () => Promise<boolean>
	/** «заказчику» / «исполнителю» */
	whom: string
	toast: (text: string, type?: 'success' | 'error' | 'info') => void
}

export const ContactButtons: React.FC<Props> = ({ phone, telegramUsername, waText, relay, whom, toast }) => {
	const [sending, setSending] = useState(false)
	const hasWa = (phone || '').replace(/\D/g, '').length >= 9
	const hasTg = !!(telegramUsername || '').trim()

	const viaBot = async () => {
		setSending(true)
		try {
			const sent = await relay()
			toast(
				sent
					? `Отправили ${whom} сообщение в боте — он увидит ваш профиль и напишет вам`
					: `Вы уже писали ${whom} — подождите ответа`,
				sent ? 'success' : 'info',
			)
		} catch (e: any) {
			toast(e?.data?.message || 'Не удалось отправить. Попробуйте ещё раз', 'error')
		} finally {
			setSending(false)
		}
	}

	return (
		<div className={hasWa ? 'grid grid-cols-2' : ''} style={{ gap: 10 }}>
			{hasWa && (
				<Button variant='wa' onClick={() => openWhatsApp(phone, waText)}>
					WhatsApp
				</Button>
			)}
			{hasTg ? (
				<Button variant='tg' block={!hasWa} onClick={() => openTelegram(telegramUsername)}>
					Telegram
				</Button>
			) : (
				<Button variant='tg' block={!hasWa} loading={sending} onClick={viaBot}>
					{hasWa ? 'Telegram' : 'Написать в Telegram'}
				</Button>
			)}
		</div>
	)
}
