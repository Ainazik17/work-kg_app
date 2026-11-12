// Профиль → «Уведомления»: какие рассылки присылать в бот
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetNotifySettingsQuery, useUpdateNotifySettingsMutation } from '../../store/store'
import { Loader, ScreenHeader, Toggle, haptic } from '../../ui/wk'

type Key = 'vacancies' | 'resumes' | 'gigs' | 'companies'
const ITEMS: { key: Key; label: string; hint: string }[] = [
	{ key: 'vacancies', label: '💼 Новые вакансии', hint: 'Под ваше резюме: та же профессия и город' },
	{ key: 'gigs', label: '⚡ Подработка рядом', hint: 'Разовые задания под «Мои услуги»' },
	{ key: 'companies', label: '🏢 Компании, на которые подписаны', hint: 'Когда они открывают вакансию' },
	{ key: 'resumes', label: '📄 Новые резюме', hint: 'Для работодателей: кандидаты под вашу вакансию' },
]

const NotifySettingsPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { data, isLoading } = useGetNotifySettingsQuery(telegramId)
	const [update] = useUpdateNotifySettingsMutation()
	if (isLoading || !data) return <Loader />
	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader
				title='Уведомления'
				subtitle='Выберите, что присылать в бот. Отклики и приглашения приходят всегда.'
				onBack={() => navigate(-1)}
			/>
			<div className='wk-stack' style={{ marginTop: 20 }}>
				{ITEMS.map((it) => (
					<Toggle
						key={it.key}
						checked={data[it.key]}
						label={it.label}
						hint={it.hint}
						onChange={(v) => {
							haptic.select()
							update({ tid: telegramId, patch: { [it.key]: v } })
						}}
					/>
				))}
			</div>
		</div>
	)
}

export default NotifySettingsPage
