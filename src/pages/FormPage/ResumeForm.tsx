import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResumeFormData, resumeSchema } from './schemas'
import {
	useGetWorkPlacesQuery,
	useGetCategoriesQuery,
	useGetSubcategoriesQuery,
} from '../../store/store'
import { FormField, inputCls } from '.'
import { ElegantSelect, useToast } from '../../../App'
import { Segmented } from '../../ui/wk'
import { MediaPicker, focusFirstError } from './MediaPicker'
import { WorkPlacesField, cleanWorkPlaces } from './WorkPlacesField'
import { formatPhoneKG } from '../../../constants'

interface Props {
	initialData?: any
	onSubmit: (data: ResumeFormData) => void
	onMediaChange: (photos: File[], videos: File[]) => void
	loading: boolean
	cities: any[]
	spheres: any[]
	telegramId: number
}

export const ResumeForm: React.FC<Props> = ({
	initialData,
	onSubmit,
	onMediaChange,
	loading,
	cities,
	spheres,
	telegramId,
}) => {
	const {
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<ResumeFormData>({
		resolver: zodResolver(resumeSchema) as any,
		defaultValues: initialData || {
			name: '',
			cityId: 1,
			sphereId: 0,
			categoryId: 0,
			subcategoryId: 0,
			age: 0,
			experience: 0,
			gender: 'MALE',
			description: '',
			phone: '+996',
			workPlaces: [],
		},
	})

	// Редактирование: подставляем сохранённые места работы
	const { data: savedPlaces } = useGetWorkPlacesQuery(initialData?.id, { skip: !initialData?.id })
	useEffect(() => {
		if (savedPlaces) setValue('workPlaces', savedPlaces)
	}, [savedPlaces])

	const selectedSphere = watch('sphereId')
	const selectedCategory = watch('categoryId')

	// RTK Query для категорий и подкатегорий
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

	const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
	const [selectedVideos, setSelectedVideos] = useState<File[]>([])

	useEffect(() => {
		if (initialData) reset({ ...initialData, workPlaces: savedPlaces || [] })
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
		<form
			onSubmit={handleSubmit(
				(d) => onSubmit({ ...d, workPlaces: cleanWorkPlaces(d.workPlaces as any) }),
				onInvalid,
			)}
			noValidate
		>
			<FormField label='Ваше имя' error={errors.name?.message}>
				<Controller
					name='name'
					control={control}
					render={({ field }) => (
						<input
							{...field}
							placeholder='Как к вам обращаться'
							className={inputCls(errors.name)}
						/>
					)}
				/>
			</FormField>

			<div className='grid grid-cols-2 gap-3 wk-field'>
				<FormField label='Возраст' error={errors.age?.message}>
					<Controller
						name='age'
						control={control}
						render={({ field }) => numberInput(field, '18', errors.age)}
					/>
				</FormField>
				<FormField label='Опыт, лет' error={errors.experience?.message}>
					<Controller
						name='experience'
						control={control}
						render={({ field }) =>
							numberInput(field, '0', errors.experience)
						}
					/>
				</FormField>
			</div>

			<FormField label='Пол'>
				<Controller
					name='gender'
					control={control}
					render={({ field }) => (
						<Segmented
							value={field.value}
							onChange={field.onChange}
							options={[
								{ value: 'MALE', label: 'Мужской' },
								{ value: 'FEMALE', label: 'Женский' },
							]}
						/>
					)}
				/>
			</FormField>

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

			<FormField error={errors.cityId?.message}>
				<Controller
					name='cityId'
					control={control}
					render={({ field }) => (
						<ElegantSelect
							placeholder='Выберите город'
							label='Город'
							value={field.value}
							options={cities}
							onChange={field.onChange}
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
							placeholder='Выберите вариант'
							label='Кем хотите работать'
							value={field.value}
							options={spheres}
							onChange={(val) => {
								field.onChange(val)
								setValue('categoryId', 0)
								setValue('subcategoryId', 0)
							}}
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
									placeholder={
										isCatLoading
											? 'Загрузка...'
											: 'Выберите категорию'
									}
									label='Категория'
									value={field.value}
									options={categories}
									onChange={(val) => {
										field.onChange(val)
										setValue('subcategoryId', 0)
									}}
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
									placeholder={
										isSubCatLoading
											? 'Загрузка...'
											: 'Выберите подкатегорию'
									}
									label='Подкатегория'
									value={field.value}
									options={subcategories}
									onChange={field.onChange}
								/>
							</div>
						)}
					/>
				</FormField>
			)}

			<FormField
				label='Пара слов о себе'
				error={errors.description?.message}
			>
				<Controller
					name='description'
					control={control}
					render={({ field }) => (
						<>
							<textarea
								{...field}
								className={inputCls(errors.description)}
								placeholder='Где работали, что умеете, чем гордитесь'
							/>
							<div className='wk-xs text-right' style={{ marginTop: 6 }}>
								{(field.value || '').length} / мин. 10
							</div>
						</>
					)}
				/>
			</FormField>

			<FormField
				label='Где работали'
				hint='Необязательно. Работодатель увидит это сразу в вашем отклике'
			>
				<Controller
					name='workPlaces'
					control={control}
					render={({ field }) => (
						<WorkPlacesField value={(field.value as any) || []} onChange={field.onChange} />
					)}
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
					'Сохранить резюме'
				)}
			</button>
		</form>
	)
}
