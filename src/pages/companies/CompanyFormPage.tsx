// Профиль компании: создание и редактирование (поля — из Company в design/src-types.ts)
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../App'
import { useGetMyCompanyQuery, useUpsertCompanyMutation } from '../../store/store'
import { COMPANY_PERKS, COMPANY_SPHERES, STAFF_OPTIONS } from '../../data/companySpheres'
import { FormField, inputCls } from '../FormPage'
import { Button, Chip, Loader, ScreenHeader, cx, haptic } from '../../ui/wk'
import { useDraft, useSubmitCheck } from '../gigs/formKit'

const initial = {
	name: '',
	type: '',
	sphere: '',
	tagline: '',
	about: '',
	perks: [] as string[],
	staff: '',
}

const CompanyFormPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data: existing, isLoading: loading } = useGetMyCompanyQuery(telegramId)
	const [save, { isLoading }] = useUpsertCompanyMutation()
	const [f, setF, clearDraft] = useDraft('wk-draft-company', initial)
	const hydrated = useRef(false)
	const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) =>
		setF((p) => ({ ...p, [k]: v }))

	useEffect(() => {
		if (hydrated.current || !existing) return
		hydrated.current = true
		if (!f.name) {
			setF({
				name: existing.name,
				type: existing.type || '',
				sphere: existing.sphere || '',
				tagline: existing.tagline || '',
				about: existing.about || '',
				perks: existing.perks || [],
				staff: existing.staff || '',
			})
		}
	}, [existing])

	const { shown, attempt } = useSubmitCheck({
		name: f.name.trim().length < 2 ? 'Укажите название компании' : undefined,
		sphere: !f.sphere ? 'Выберите вариант' : undefined,
	})

	const submit = async () => {
		if (!attempt(() => showToast('Проверьте отмеченные поля', 'error'))) return
		try {
			const c = await save({
				tid: telegramId,
				data: {
					name: f.name.trim(),
					type: f.type.trim() || undefined,
					sphere: f.sphere,
					tagline: f.tagline.trim() || undefined,
					about: f.about.trim() || undefined,
					perks: f.perks,
					staff: f.staff || undefined,
				},
			}).unwrap()
			haptic.notify('success')
			clearDraft()
			showToast(existing ? 'Профиль компании сохранён' : 'Компания создана — добавьте обложку и фото')
			navigate(`/company/${c.id}`, { replace: true })
		} catch (e: any) {
			const fields = e?.data?.fieldErrors
			showToast(
				fields ? String(Object.values(fields)[0]) : 'Не удалось сохранить. Проверьте интернет',
				'error',
			)
		}
	}

	if (loading) return <Loader />

	const togglePerk = (p: string) =>
		set('perks', f.perks.includes(p) ? f.perks.filter((x) => x !== p) : [...f.perks, p])

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title={existing ? 'Профиль компании' : 'Моя компания'}
				subtitle='Компании с описанием и фото получают больше откликов. Ваши вакансии появятся в профиле автоматически.'
				onBack={() => navigate(-1)}
			/>

			<FormField label='Название' error={shown.name}>
				<input
					value={f.name}
					onChange={(e) => set('name', e.target.value)}
					placeholder='Например: Tash Kitchen'
					className={inputCls(shown.name)}
					maxLength={120}
				/>
			</FormField>

			<FormField label='Чем занимаетесь' hint='Коротко, как на вывеске'>
				<input
					value={f.type}
					onChange={(e) => set('type', e.target.value)}
					placeholder='Ресторан турецкой кухни'
					className='wk-input'
					maxLength={120}
				/>
			</FormField>

			<FormField label='Сфера' error={shown.sphere}>
				<div className={cx('wk-chipwrap', shown.sphere && 'wk-chiprow-error')}>
					{COMPANY_SPHERES.map((s) => (
						<Chip key={s} active={f.sphere === s} onClick={() => set('sphere', s)}>
							{s}
						</Chip>
					))}
				</div>
			</FormField>

			<FormField label='Сколько сотрудников'>
				<div className='wk-chipwrap'>
					{STAFF_OPTIONS.map((s) => (
						<Chip key={s} active={f.staff === s} onClick={() => set('staff', f.staff === s ? '' : s)}>
							{s}
						</Chip>
					))}
				</div>
			</FormField>

			<FormField label='Цитата на обложке' hint='Видна на карточке в «Топ работодатели»'>
				<input
					value={f.tagline}
					onChange={(e) => set('tagline', e.target.value)}
					placeholder='Ищем людей, которые любят гостей'
					className='wk-input'
					maxLength={140}
				/>
			</FormField>

			<FormField label='О компании'>
				<textarea
					value={f.about}
					onChange={(e) => set('about', e.target.value)}
					placeholder='Сколько точек, как обучаете, кем можно вырасти'
					className='wk-input'
					maxLength={3000}
				/>
			</FormField>

			<FormField label='Что даёт компания'>
				<div className='wk-chipwrap'>
					{COMPANY_PERKS.map((p) => (
						<Chip key={p} active={f.perks.includes(p)} onClick={() => togglePerk(p)}>
							{p}
						</Chip>
					))}
				</div>
			</FormField>

			<Button variant='red' block loading={isLoading} style={{ marginTop: 28 }} onClick={submit}>
				{existing ? 'Сохранить' : 'Создать профиль компании'}
			</Button>
		</div>
	)
}

export default CompanyFormPage
