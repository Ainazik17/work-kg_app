// 6.4b Мои услуги [21]
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../App'
import { useGetMyOfferQuery, useGetUserProfileQuery, useUpsertOfferMutation } from '../../store/store'
import { formatPhoneKG } from '../../../constants'
import type { OfferPriceUnit } from '../../../types'
import { FormField, inputCls } from '../FormPage'
import { Button, Chip, Loader, ScreenHeader, Segmented, Toggle, cx, haptic } from '../../ui/wk'
import { ProfessionPicker } from '../../ui/ProfessionPicker'
import { myTelegramUsername, phoneError, useDraft, usePrefillPhone, useSubmitCheck } from './formKit'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MAX_SKILLS = 8

const initial = {
	skills: [] as string[],
	price: '',
	priceUnit: 'HOUR' as OfferPriceUnit,
	days: [] as string[],
	district: '',
	about: '',
	isActive: true,
	phone: '',
}

const OfferFormPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data: existing, isLoading: loadingExisting } = useGetMyOfferQuery(telegramId)
	const [upsert, { isLoading }] = useUpsertOfferMutation()
	const [f, setF, clearDraft] = useDraft('wk-draft-offer', initial)
	const hydrated = useRef(false)
	const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) =>
		setF((p) => ({ ...p, [k]: v }))
	const { data: profile } = useGetUserProfileQuery(telegramId)
	usePrefillPhone(profile?.phone, f.phone, (p) => set('phone', p))

	// Редактирование: подставляем сохранённую карточку, если черновик пустой
	useEffect(() => {
		if (hydrated.current || !existing) return
		hydrated.current = true
		if (f.skills.length === 0 && !f.price) {
			setF({
				skills: existing.skills,
				price: String(existing.price),
				priceUnit: existing.priceUnit,
				days: existing.days,
				district: existing.district || '',
				about: existing.about || '',
				isActive: existing.isActive,
				phone: f.phone,
			})
		}
	}, [existing])

	const { shown, attempt } = useSubmitCheck({
		skills: f.skills.length === 0 ? 'Выберите, что умеете' : undefined,
		price: !(Number(f.price) > 0) ? 'Укажите цену' : undefined,
		days: f.days.length === 0 ? 'Выберите хотя бы один день' : undefined,
		phone: phoneError(f.phone),
	})

	const submit = async () => {
		if (!attempt(() => showToast('Проверьте отмеченные поля', 'error'))) return
		try {
			await upsert({
				tid: telegramId,
				data: {
					skills: f.skills,
					price: Number(f.price),
					priceUnit: f.priceUnit,
					days: DAYS.filter((d) => f.days.includes(d)),
					district: f.district.trim() || undefined,
					about: f.about.trim() || undefined,
					isActive: f.isActive,
					phone: f.phone,
				},
			}).unwrap()
			haptic.notify('success')
			clearDraft()
			showToast(existing ? 'Услуги сохранены' : 'Услуги опубликованы — вам напишут, когда нужен человек')
			navigate('/profile', { replace: true })
		} catch (e: any) {
			const fields = e?.data?.fieldErrors
			showToast(
				fields ? String(Object.values(fields)[0]) : 'Не удалось сохранить. Проверьте интернет',
				'error',
			)
		}
	}

	if (loadingExisting) return <Loader />

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title='Мои услуги'
				subtitle='Для подработки: вас найдут те, кому нужен человек сегодня.'
				onBack={() => navigate(-1)}
			/>

			<FormField
				label='Что умеете'
				hint='Выберите всё, чем готовы подрабатывать'
				error={shown.skills}
			>
				<ProfessionPicker
					value={f.skills}
					onChange={(v) => set('skills', v)}
					max={MAX_SKILLS}
					placeholder='Например: няня, сантехник, репетитор'
					error={!!shown.skills}
					onLimit={(n) => showToast(`Можно выбрать до ${n}`, 'info')}
				/>
			</FormField>

			<FormField label='Цена, сом' error={shown.price}>
				<input
					type='number'
					inputMode='numeric'
					value={f.price}
					onChange={(e) => set('price', e.target.value)}
					placeholder='500'
					className={inputCls(shown.price)}
				/>
			</FormField>
			<div className='wk-seg-wrap'>
				<Segmented
					value={f.priceUnit}
					onChange={(v) => set('priceUnit', v as OfferPriceUnit)}
					options={[
						{ value: 'HOUR', label: 'За час' },
						{ value: 'VISIT', label: 'За выезд' },
						{ value: 'SHIFT', label: 'За смену' },
					]}
				/>
			</div>

			<FormField label='Когда свободны' error={shown.days}>
				<div className={cx('wk-chipwrap', shown.days && 'wk-chiprow-error')}>
					{DAYS.map((d) => (
						<Chip
							key={d}
							className='wk-chip--square'
							active={f.days.includes(d)}
							onClick={() =>
								set('days', f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d])
							}
						>
							{d}
						</Chip>
					))}
				</div>
			</FormField>

			<FormField label='Район работы'>
				<input
					value={f.district}
					onChange={(e) => set('district', e.target.value)}
					placeholder='Например: Асанбай, Джал'
					className='wk-input'
					maxLength={255}
				/>
			</FormField>

			<FormField label='Коротко о себе'>
				<textarea
					value={f.about}
					onChange={(e) => set('about', e.target.value)}
					placeholder='Опыт, инструменты, есть ли машина'
					className='wk-input'
					maxLength={2000}
				/>
			</FormField>

			<FormField
				label='Телефон для WhatsApp'
				error={shown.phone}
				hint={
					myTelegramUsername()
						? undefined
						: 'У вас нет username в Telegram — заказчики напишут в WhatsApp или через бота'
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

			{existing && (
				<div className='wk-field'>
					<Toggle
						checked={f.isActive}
						onChange={(v) => set('isActive', v)}
						label='Показывать мои услуги'
						hint='Выключите, если сейчас не можете брать подработку'
					/>
				</div>
			)}

			<Button variant='red' block loading={isLoading} style={{ marginTop: 28 }} onClick={submit}>
				{existing ? 'Сохранить' : 'Опубликовать услуги'}
			</Button>
		</div>
	)
}

export default OfferFormPage
