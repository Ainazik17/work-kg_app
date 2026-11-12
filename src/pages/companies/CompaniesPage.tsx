// 4. Компании [04]
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useGetCompaniesQuery, useGetMyCompanyQuery } from '../../store/store'
import { Button, EmptyState, Panel, Skeleton, haptic } from '../../ui/wk'
import { CompanyCardList, SphereChips } from '../../ui/company'

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').trim()

const CompaniesPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const [params, setParams] = useSearchParams()
	const sphere = params.get('sphere')
	const [query, setQuery] = useState('')
	const [q, setQ] = useState('')
	useEffect(() => {
		const t = setTimeout(() => setQ(norm(query)), 300)
		return () => clearTimeout(t)
	}, [query])

	// Весь список одним запросом: счётчики сфер в листе «Все сферы» считаются по нему
	const { data: all = [], isLoading, isError, refetch } = useGetCompaniesQuery({ tid: telegramId })
	const { data: mine, isLoading: mineLoading } = useGetMyCompanyQuery(telegramId)

	const counts = useMemo(() => {
		const m: Record<string, number> = {}
		all.forEach((c) => c.sphere && (m[c.sphere] = (m[c.sphere] || 0) + 1))
		return m
	}, [all])

	const list = all.filter(
		(c) =>
			(!sphere || c.sphere === sphere) &&
			(!q || norm(c.name).includes(q) || norm(c.type || '').includes(q)),
	)

	return (
		<div className='wk-screen wk-enter text-left'>
			<h1 className='wk-h1'>Компании</h1>
			<p className='wk-meta' style={{ fontSize: 14, marginTop: 6 }}>
				Проверенные работодатели с отзывами сотрудников
			</p>

			<label className='wk-search' style={{ marginTop: 20 }}>
				<Search size={20} strokeWidth={1.8} />
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder='Название компании'
					enterKeyHint='search'
				/>
				{query && (
					<button type='button' aria-label='Очистить' onClick={() => setQuery('')}>
						<X size={18} strokeWidth={1.8} />
					</button>
				)}
			</label>

			<SphereChips
				value={sphere}
				counts={counts}
				onChange={(v) => setParams(v ? { sphere: v } : {}, { replace: true })}
			/>

			<div className='wk-stack' style={{ marginTop: 18 }}>
				{isLoading ? (
					[0, 1, 2].map((i) => <Skeleton key={i} height={210} radius={22} />)
				) : isError ? (
					<EmptyState
						emoji='📡'
						title='Не удалось загрузить'
						text='Проверьте интернет'
						action={
							<Button variant='ink' size='sm' onClick={() => refetch()}>
								Повторить
							</Button>
						}
					/>
				) : list.length === 0 ? (
					<EmptyState
						emoji='🏢'
						title='Компаний пока нет'
						text={q ? 'Попробуйте другое название' : 'Попробуйте другую сферу'}
					/>
				) : (
					list.map((c) => (
						<CompanyCardList
							key={c.id}
							c={c}
							onClick={() => {
								haptic.impact('light')
								navigate(`/company/${c.id}`)
							}}
						/>
					))
				)}
			</div>

			{!mineLoading && !mine && (
				<Panel style={{ padding: 18, marginTop: 16 }}>
					<div style={{ fontSize: 16, fontWeight: 700 }}>Вы работодатель?</div>
					<p className='wk-meta' style={{ marginTop: 4 }}>
						Создайте профиль компании: обложка, фото, «Что даёт компания». Ваши вакансии
						появятся в нём, а подписчики узнают о новых первыми.
					</p>
					<Button
						variant='ink'
						size='sm'
						block
						style={{ marginTop: 14 }}
						onClick={() => navigate('/company/edit')}
					>
						Создать профиль компании
					</Button>
				</Panel>
			)}
		</div>
	)
}

export default CompaniesPage
