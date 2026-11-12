import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VacancyFormData, vacancySchema, formatPhoneKG } from './schemas'
import {
	useGetCategoriesQuery,
	useGetMyCompanyQuery,
	useGetSubcategoriesQuery,
} from '../../store/store'
import { useNavigate } from 'react-router-dom'
import { VerifiedTick } from '../../ui/company'
import { FormField, inputCls } from '.'
import { AddressAutocomplete2GIS, ElegantSelect, useToast } from '../../../App'
import { Segmented } from '../../ui/wk'
import { MediaPicker, focusFirstError } from './MediaPicker'
import { VoiceRecorder, type VoiceValue } from '../../ui/voice'

interface BaseEntity {
	id: number
	name: string
}

interface Sphere extends BaseEntity {
	icon?: string
}

interface Props {
	initialData?: Partial<VacancyFormData> | null
	onSubmit: (data: VacancyFormData) => void
	onMediaChange: (photos: File[], videos: File[]) => void
	loading: boolean
	cities: BaseEntity[]
	spheres: Sphere[]
	telegramId: number
}

export const VacancyForm: React.FC<Props> = ({
	initialData,
	onSubmit,
	onMediaChange,
	loading,
	cities,
	spheres,
	telegramId,
}) => {
	const defaultValues: VacancyFormData = {
		cityId: 1,
		sphereId: 0,
		categoryId: 0,
		subcategoryId: 0,
		minAge: 0,
		maxAge: 0,
		preferredGender: 'ANY',
		phone: '+996',
		experienceInYear: 0,
		salary: '',
		schedule: '',
		companyName: '',
		title: '',
		description: '',
		address: null,
		latitude: null,
		longitude: null,
	}

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(vacancySchema),
		defaultValues: {
			...defaultValues,
			...(initialData || {}),
		} as VacancyFormData,
	})

	// Компания из профиля (DESIGN_SPEC 6.2): поле только для чтения, имя подставляем само
	const navigate = useNavigate()
	const { data: myCompany } = useGetMyCompanyQuery(telegramId)
	useEffect(() => {
		if (myCompany) setValue('companyName', myCompany.name)
	}, [myCompany?.name])

	// Голосовое: при редактировании показываем сохранённое; удаление шлёт voiceKey = ''
	const hadVoice = !!(initialData as any)?.voiceUrl
	const [voice, setVoice] = useState<VoiceValue>(
		hadVoice ? { url: (initialData as any).voiceUrl, duration: (initialData as any).voiceDuration || 0 } : null,
	)
	const changeVoice = (v: VoiceValue) => {
		setVoice(v)
		if (v?.key) {
			setValue('voiceKey', v.key)
			setValue('voiceDuration', v.duration)
		} else if (!v) {
			setValue('voiceKey', hadVoice ? '' : undefined)
			setValue('voiceDuration', undefined)
		}
	}

	const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
	const [selectedVideos, setSelectedVideos] = useState<File[]>([])

	const selectedSphere = watch('sphereId')
	const selectedCategory = watch('categoryId')

	// RTK Query для динамических списков
	const { data: categories = [], isFetching: isCatLoading } =
		useGetCategoriesQuery(
			{ tid: telegramId, sid: selectedSphere },
			{ skip: selectedSphere === 0 },
		)

	const { data: subcategories = [], isFetching: isSubCatLoading } =
		useGetSubcategoriesQuery(
			{ tid: telegramId, cid: selectedCategory },
			{ skip: selectedCategory === 0 },
		)

	useEffect(() => {
		if (initialData) reset(initialData)
	}, [initialData, reset])

	useEffect(() => {
		onMediaChange(selectedPhotos, selectedVideos)
	}, [selectedPhotos, selectedVideos, onMediaChange])

	const { showToast } = useToast()
	const onInvalid = () => {
		showToast('Проверьте отмеченные поля', 'error')
		focusFirstError()
	}

	const numberInput = (field: any, placeholder?: string, error?: unknown) => (
		<input
			type='number'
			inputMode='numeric'
			value={field.value || ''}
			onChange={(e) =>
				field.onChange(e.target.value === '' ? '' : Number(e.target.value))
			}
			placeholder={placeholder}
			className={inputCls(error)}
		/>
	)

	return (
		<form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
			<FormField label='Должность' error={errors.title?.message}>
				<Controller
					name='title'
					control={control}
					render={({ field }) => (
						<input
							{...field}
							placeholder='Например: повар'
							className={inputCls(errors.title)}
						/>
					)}
				/>
			</FormField>

			{myCompany ? (
				<FormField label='Компания'>
					<div className='wk-readonly'>
						<span className='truncate' style={{ fontWeight: 600 }}>{myCompany.name}</span>
						{myCompany.verified && <VerifiedTick size={17} />}
						<span className='wk-xs' style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
							из профиля компании
						</span>
					</div>
				</FormField>
			) : (
			<FormField
				label='Компания'
				error={errors.companyName?.message}
				hint={
					<button
						type='button'
						onClick={() => navigate('/company/edit')}
						style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}
					>
						Создайте профиль компании — вакансия появится в нём
					</button>
				}
			>
				<Controller
					name='companyName'
					control={control}
					render={({ field }) => (
						<input
							{...field}
							placeholder='Название компании или ваше имя'
							className={inputCls(errors.companyName)}
						/>
					)}
				/>
			</FormField>
			)}

			<div className='grid grid-cols-2 gap-3 wk-field'>
				<FormField
					label='Зарплата, сом'
					error={errors.salary?.message}
				>
					<Controller
						name='salary'
						control={control}
						render={({ field }) => (
							<input
								{...field}
								placeholder='80 000'
								className={inputCls(errors.salary)}
							/>
						)}
					/>
				</FormField>
				<FormField
					label='Опыт, лет'
					error={errors.experienceInYear?.message}
				>
					<Controller
						name='experienceInYear'
						control={control}
						render={({ field }) =>
							numberInput(field, '0', errors.experienceInYear)
						}
					/>
				</FormField>
			</div>

			<FormField
				label='График'
				hint='Например: 5/2, 2/2, сменный'
				error={errors.schedule?.message}
			>
				<Controller
					name='schedule'
					control={control}
					render={({ field }) => (
						<input
							{...field}
							placeholder='5/2'
							className={inputCls(errors.schedule)}
						/>
					)}
				/>
			</FormField>

			<FormField label='Кого вы ищете'>
				<Controller
					name='preferredGender'
					control={control}
					render={({ field }) => (
						<Segmented
							value={field.value}
							onChange={field.onChange}
							options={[
								{ value: 'ANY', label: 'Не важно' },
								{ value: 'MALE', label: 'Мужчину' },
								{ value: 'FEMALE', label: 'Женщину' },
							]}
						/>
					)}
				/>
			</FormField>

			<div className='grid grid-cols-2 gap-3 wk-field'>
				<FormField label='Возраст от' error={errors.minAge?.message}>
					<Controller
						name='minAge'
						control={control}
						render={({ field }) => numberInput(field, '18', errors.minAge)}
					/>
				</FormField>
				<FormField label='Возраст до' error={errors.maxAge?.message}>
					<Controller
						name='maxAge'
						control={control}
						render={({ field }) => numberInput(field, '60', errors.maxAge)}
					/>
				</FormField>
			</div>

			<FormField error={errors.cityId?.message}>
				<Controller
					name='cityId'
					control={control}
					render={({ field }) => (
						<ElegantSelect
							label='Город'
							value={field.value}
							options={cities}
							onChange={field.onChange}
							placeholder='Выберите город'
						/>
					)}
				/>
			</FormField>

			<FormField error={errors.sphereId?.message}>
				<Controller
					name='sphereId'
					control={control}
					render={({ field }) => (
						<ElegantSelect
							label='Сфера'
							value={field.value}
							options={spheres}
							onChange={(val) => {
								field.onChange(val)
								setValue('categoryId', 0)
								setValue('subcategoryId', 0)
							}}
							placeholder='Выберите вариант'
						/>
					)}
				/>
			</FormField>

			{selectedSphere > 0 && (
				<FormField error={errors.categoryId?.message}>
					<Controller
						name='categoryId'
						control={control}
						render={({ field }) => (
							<div className={isCatLoading ? 'opacity-60' : ''}>
								<ElegantSelect
									label='Категория'
									value={field.value}
									options={categories}
									onChange={(val) => {
										field.onChange(val)
										setValue('subcategoryId', 0)
									}}
									placeholder={
										isCatLoading
											? 'Загрузка...'
											: 'Выберите категорию'
									}
								/>
							</div>
						)}
					/>
				</FormField>
			)}

			{selectedCategory > 0 && subcategories.length > 0 && (
				<FormField>
					<Controller
						name='subcategoryId'
						control={control}
						render={({ field }) => (
							<div className={isSubCatLoading ? 'opacity-60' : ''}>
								<ElegantSelect
									label='Подкатегория'
									value={field.value ?? 0}
									options={subcategories}
									onChange={field.onChange}
									placeholder={
										isSubCatLoading
											? 'Загрузка...'
											: 'Выберите подкатегорию'
									}
								/>
							</div>
						)}
					/>
				</FormField>
			)}

			<Controller
				name='address'
				control={control}
				render={({ field }) => (
					<AddressAutocomplete2GIS
						value={field.value || ''}
						onChange={(d) => {
							setValue('address', d.address)
							setValue('latitude', d.lat)
							setValue('longitude', d.lng)
						}}
					/>
				)}
			/>

			<FormField
				label='Телефон для WhatsApp'
				error={errors.phone?.message}
			>
				<Controller
					name='phone'
					control={control}
					render={({ field }) => (
						<input
							{...field}
							type='tel'
							inputMode='tel'
							onChange={(e) =>
								field.onChange(formatPhoneKG(e.target.value))
							}
							className={inputCls(errors.phone)}
						/>
					)}
				/>
			</FormField>

			<FormField label='Описание' error={errors.description?.message}>
				<Controller
					name='description'
					control={control}
					render={({ field }) => (
						<>
							<textarea
								{...field}
								className={inputCls(errors.description)}
								placeholder={'Чем предстоит заниматься?\nКого ищете?\nКакие условия?'}
							/>
							<div className='wk-xs text-right' style={{ marginTop: 6 }}>
								{(field.value || '').length} / мин. 10
							</div>
						</>
					)}
				/>
			</FormField>

			<FormField label='Голосом' hint='Необязательно. Расскажите о работе своими словами — соискатели послушают'>
				<VoiceRecorder
					telegramId={telegramId}
					value={voice}
					onChange={changeVoice}
					onError={(m) => showToast(m, 'error')}
					hint='Что делать, какие условия, кого ждёте'
				/>
			</FormField>

			<MediaPicker
				photos={selectedPhotos}
				videos={selectedVideos}
				onPhotos={setSelectedPhotos}
				onVideos={setSelectedVideos}
				subtitle='С фото откликаются в 2 раза чаще'
			/>

			<button
				type='submit'
				disabled={loading}
				className='wk-btn wk-btn--red wk-btn--block'
				style={{ marginTop: 28 }}
			>
				{loading ? (
					<span className='wk-spinner' />
				) : initialData ? (
					'Сохранить изменения'
				) : (
					'Опубликовать вакансию'
				)}
			</button>
		</form>
	)
}
