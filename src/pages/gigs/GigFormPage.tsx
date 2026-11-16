// 6.4 Разовое задание [22] [23]
import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddressAutocomplete2GIS, useToast } from '../../../App'
import { useCreateGigMutation, useGetUserProfileQuery } from '../../store/store'
import { formatPhoneKG } from '../../../constants'
import type { GigPayUnit } from '../../../types'
import { FormField, inputCls } from '../FormPage'
import { Button, Chip, ScreenHeader, Segmented, Toggle, cx, haptic, isoDate } from '../../ui/wk'
import { myTelegramUsername, phoneError, useDraft, usePrefillPhone, useSubmitCheck } from './formKit'
import { VoiceRecorder, type VoiceValue } from '../../ui/voice'

type WhenKind = 'today' | 'tomorrow' | 'date' | ''
const PEOPLE = ['1', '2', '3', '4', '5+']

const initial = {
	title: '',
	when: '' as WhenKind,
	date: '',
	timeText: '',
	pay: '',
	payUnit: 'TOTAL' as GigPayUnit,
	peopleCount: '1',
	address: '',
	latitude: null as number | null,
	longitude: null as number | null,
	urgent: false,
	voice: null as VoiceValue,
	phone: '',
}

const GigFormPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const [createGig, { isLoading }] = useCreateGigMutation()
	const [f, setF, clearDraft] = useDraft('wk-draft-gig', initial)
	const dateRef = useRef<HTMLInputElement>(null)
	const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) =>
		setF((p) => ({ ...p, [k]: v }))
	const { data: profile } = useGetUserProfileQuery(telegramId)
	usePrefillPhone(profile?.phone, f.phone, (p) => set('phone', p))

	const today = new Date()
	const tomorrow = new Date()
	tomorrow.setDate(today.getDate() + 1)
	const workDate =
		f.when === 'today' ? isoDate(today) : f.when === 'tomorrow' ? isoDate(tomorrow) : f.date

	const { shown, attempt } = useSubmitCheck({
		// с голосовым хватит короткого заголовка — подробности в записи
		title:
			f.title.trim().length < (f.voice ? 3 : 10)
				? f.voice
					? 'Коротко: что нужно сделать'
					: 'Опишите задание — минимум 10 символов'
				: undefined,
		when: !workDate ? 'Выберите вариант' : undefined,
		pay: !(Number(f.pay) > 0) ? 'Укажите оплату' : undefined,
		address: f.address.trim().length < 3 ? 'Укажите адрес' : undefined,
		phone: phoneError(f.phone),
	})

	const submit = async () => {
		if (!attempt(() => showToast('Проверьте отмеченные поля', 'error'))) return
		try {
			await createGig({
				tid: telegramId,
				data: {
					title: f.title.trim(),
					workDate,
					timeText: f.timeText.trim() || undefined,
					pay: Number(f.pay),
					payUnit: f.payUnit,
					peopleCount: f.peopleCount,
					address: f.address.trim(),
					latitude: f.latitude,
					longitude: f.longitude,
					urgent: f.urgent,
					voiceKey: f.voice?.key,
					voiceDuration: f.voice?.duration,
					phone: f.phone,
				},
			}).unwrap()
			haptic.notify('success')
			clearDraft()
			showToast('Задание опубликовано — исполнители рядом получили уведомление')
			navigate('/?tab=gigs', { replace: true })
		} catch (e: any) {
			const fields = e?.data?.fieldErrors
			showToast(
				fields ? String(Object.values(fields)[0]) : 'Не удалось опубликовать. Проверьте интернет',
				'error',
			)
		}
	}

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title='Разовое задание'
				subtitle='Исполнители рядом получат уведомление и напишут вам в WhatsApp или Telegram.'
				onBack={() => navigate(-1)}
			/>

			<FormField label='Что нужно сделать' error={shown.title}>
				<input
					value={f.title}
					onChange={(e) => set('title', e.target.value)}
					placeholder={f.voice ? 'Коротко: грузчики на переезд' : 'Например: грузчики на переезд'}
					className={inputCls(shown.title)}
					maxLength={255}
				/>
			</FormField>

			<FormField
				label='Голосом'
				hint='Необязательно. Исполнители послушают запись в карточке задания'
			>
				<VoiceRecorder
					telegramId={telegramId}
					value={f.voice}
					onChange={(v) => set('voice', v)}
					onError={(m) => showToast(m, 'error')}
					hint='Расскажите, что сделать, куда приехать, сколько по времени'
				/>
			</FormField>

			<FormField label='Когда' error={shown.when}>
				<div className={cx('wk-chipwrap', shown.when && 'wk-chiprow-error')}>
					<Chip active={f.when === 'today'} onClick={() => set('when', 'today')}>
						Сегодня
					</Chip>
					<Chip active={f.when === 'tomorrow'} onClick={() => set('when', 'tomorrow')}>
						Завтра
					</Chip>
					<Chip
						active={f.when === 'date'}
						onClick={() => {
							set('when', 'date')
							requestAnimationFrame(() => dateRef.current?.showPicker?.())
						}}
					>
						{f.when === 'date' && f.date
							? new Date(f.date + 'T00:00').toLocaleDateString('ru-RU', {
									day: 'numeric',
									month: 'long',
								})
							: 'Выбрать дату'}
					</Chip>
				</div>
				{f.when === 'date' && (
					<input
						ref={dateRef}
						type='date'
						min={isoDate(today)}
						value={f.date}
						onChange={(e) => set('date', e.target.value)}
						className='wk-input'
						style={{ marginTop: 10 }}
					/>
				)}
			</FormField>

			<FormField label='Во сколько и на сколько'>
				<input
					value={f.timeText}
					onChange={(e) => set('timeText', e.target.value)}
					placeholder='15:00, примерно 3 часа'
					className='wk-input'
					maxLength={120}
				/>
			</FormField>

			<FormField label='Оплата, сом' error={shown.pay}>
				<input
					type='number'
					inputMode='numeric'
					value={f.pay}
					onChange={(e) => set('pay', e.target.value)}
					placeholder='1500'
					className={inputCls(shown.pay)}
				/>
			</FormField>
			<div className='wk-seg-wrap'>
				<Segmented
					value={f.payUnit}
					onChange={(v) => set('payUnit', v as GigPayUnit)}
					options={[
						{ value: 'TOTAL', label: 'За всё' },
						{ value: 'HOUR', label: 'В час' },
						{ value: 'SHIFT', label: 'За смену' },
					]}
				/>
			</div>

			<FormField label='Сколько человек'>
				<div className='wk-chipwrap'>
					{PEOPLE.map((n) => (
						<Chip
							key={n}
							className='wk-chip--square'
							active={f.peopleCount === n}
							onClick={() => set('peopleCount', n)}
						>
							{n}
						</Chip>
					))}
				</div>
			</FormField>

			<div className='wk-field' data-error={shown.address ? 'true' : undefined}>
				<AddressAutocomplete2GIS
					value={f.address}
					onChange={(d) =>
						setF((p) => ({ ...p, address: d.address, latitude: d.lat, longitude: d.lng }))
					}
				/>
				{shown.address && <p className='wk-error'>{shown.address}</p>}
			</div>


			<FormField
				label='Телефон для WhatsApp'
				error={shown.phone}
				hint={
					myTelegramUsername()
						? undefined
						: 'У вас нет username в Telegram — исполнители напишут в WhatsApp или через бота'
				}
			>
				<input
					type='tel'
					inputMode='tel'
					value={f.phone || '+996'}
					onChange={(e) => set('phone', formatPhoneKG(e.target.value))}
					className={inputCls(shown.phone)}
				/>
			</FormField>

			<div className='wk-field'>
				<Toggle
					checked={f.urgent}
					onChange={(v) => set('urgent', v)}
					label='⚡ Срочно'
					hint='Покажем выше и пришлём уведомление тем, кто рядом'
				/>
			</div>

			<Button variant='red' block loading={isLoading} style={{ marginTop: 28 }} onClick={submit}>
				Опубликовать
			</Button>
		</div>
	)
}

export default GigFormPage
