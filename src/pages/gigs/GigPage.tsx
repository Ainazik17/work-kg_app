// Карточка разового задания (открывается из ленты «Подработка» и из уведомления бота ?open=gig_ID)
import { VoicePlayer } from '../../ui/voice'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Share } from 'lucide-react'
import { useToast } from '../../../App'
import { useContactGigAuthorMutation, useDeleteGigMutation, useGetGigQuery, useUpdateGigStatusMutation } from '../../store/store'
import { ContactButtons } from '../../ui/ContactButtons'
import {
	IconButton,
	Avatar,
	Button,
	EmptyState,
	FactTiles,
	Loader,
	ScreenHeader,
	StatusPill,
	distanceText,
	gigDayLabel,
	gigTime,
	payText,
} from '../../ui/wk'
import { isMasked, open2GIS, shareListing } from '../../ui/contact'

const GigPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { id } = useParams()
	const { showToast } = useToast()
	const { data: gig, isLoading, isError } = useGetGigQuery({ id: Number(id), tid: telegramId })
	const [setStatus, { isLoading: toggling }] = useUpdateGigStatusMutation()
	const [remove] = useDeleteGigMutation()
	const [contactAuthor] = useContactGigAuthorMutation()

	if (isLoading) return <Loader />
	if (isError || !gig)
		return (
			<div className='wk-screen'>
				<ScreenHeader title='Задание' onBack={() => navigate(-1)} />
				<EmptyState emoji='🔍' title='Задание не найдено' text='Возможно, его уже сняли с публикации' />
			</div>
		)

	// contactsOpen с бэкенда; старый ответ без поля — по маске телефона
	const locked = !gig.mine && (gig.contactsOpen === undefined ? isMasked(gig.phone) : !gig.contactsOpen)
	const waText = `Здравствуйте! Пишу по заданию «${gig.title}» из Work KG`

	return (
		<div className='wk-screen wk-enter text-left' style={{ paddingBottom: 170 }}>
			<ScreenHeader
				title='Разовое задание'
				onBack={() => navigate(-1)}
				right={
					<IconButton
						label='Поделиться'
						onClick={async () => {
							const r = await shareListing(`gig_${gig.id}`, `⚡ ${gig.title} — подработка в Work KG`)
							if (r === 'copied') showToast('Ссылка скопирована')
						}}
					>
						<Share size={20} strokeWidth={1.8} />
					</IconButton>
				}
			/>

			<div className='flex items-center' style={{ gap: 14 }}>
				<span className='wk-gig__time' style={{ width: 68, height: 68, borderRadius: 20 }}>
					<b style={{ fontSize: 18 }}>{gigTime(gig.timeText)}</b>
					<span>{gigDayLabel(gig.workDate)}</span>
				</span>
				<div className='flex flex-wrap gap-2'>
					{gig.urgent && <StatusPill tone='gig'>⚡ Срочно</StatusPill>}
					{!gig.isActive && <StatusPill tone='muted'>Снято с публикации</StatusPill>}
				</div>
			</div>

			<h1 className='wk-h1' style={{ marginTop: 18 }}>
				{gig.title}
			</h1>
			<div style={{ marginTop: 10, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>
				{payText(gig.pay, gig.payUnit === 'TOTAL' ? undefined : gig.payUnit)}
				{gig.payUnit === 'TOTAL' && (
					<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}> за всё</span>
				)}
			</div>

			{gig.timeText && (
				<div className='wk-meta' style={{ marginTop: 4 }}>
					🕒 {gig.timeText}
				</div>
			)}

			{gig.voiceUrl && (
				<div style={{ marginTop: 16 }}>
					<VoicePlayer url={gig.voiceUrl} duration={gig.voiceDuration} />
				</div>
			)}

			<div style={{ marginTop: 20 }}>
				<FactTiles
					items={[
						{ label: 'Когда', value: `${gigDayLabel(gig.workDate)}${gigTime(gig.timeText) !== '—' ? `, ${gigTime(gig.timeText)}` : ''}` },
						{ label: 'Людей', value: gig.peopleCount },
						{ label: 'Где', value: distanceText(gig.distanceKm) || gig.cityName },
					]}
				/>
			</div>

			<button
				onClick={() => open2GIS(gig.address, gig.cityName)}
				className='flex items-start gap-2 text-left'
				style={{ marginTop: 18, fontSize: 14, color: 'var(--muted)' }}
			>
				<MapPin size={18} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
				<span>
					{gig.address} · <span style={{ color: 'var(--ok)', fontWeight: 600 }}>маршрут в 2GIS</span>
				</span>
			</button>

			<div className='wk-panel flex items-center' style={{ gap: 12, marginTop: 24, padding: 16 }}>
				<Avatar name={gig.authorName} size={44} />
				<div>
					<div style={{ fontWeight: 600 }}>{gig.authorName}</div>
					<div className='wk-xs'>
						{gig.mine ? 'Это ваше задание' : 'Заказчик'} · {gig.cityName}
					</div>
				</div>
			</div>

			<div className='wk-bottombar'>
				<div className='wk-bottombar__inner'>
					{gig.mine ? (
						<div className='grid grid-cols-2' style={{ gap: 10 }}>
							<Button
								variant='line'
								loading={toggling}
								onClick={async () => {
									await setStatus({ id: gig.id, tid: telegramId, isActive: !gig.isActive })
									showToast(gig.isActive ? 'Задание снято с публикации' : 'Задание снова в ленте', 'info')
								}}
							>
								{gig.isActive ? 'Снять' : 'Вернуть'}
							</Button>
							<Button
								variant='ink'
								onClick={async () => {
									if (!window.confirm('Удалить задание? Это нельзя отменить.')) return
									await remove({ id: gig.id, tid: telegramId })
									showToast('Задание удалено')
									navigate(-1)
								}}
							>
								Удалить
							</Button>
						</div>
					) : locked ? (
						<Button variant='red' block onClick={() => navigate('/subscription')}>
							Открыть контакты · PRO
						</Button>
					) : (
						<ContactButtons
							phone={gig.phone}
							telegramUsername={gig.telegramUsername}
							waText={waText}
							whom='заказчику'
							toast={showToast}
							relay={async () => (await contactAuthor({ id: gig.id, tid: telegramId }).unwrap()).sent}
						/>
					)}
					{locked && <p className='wk-note'>Контакты заказчика доступны с PRO</p>}
				</div>
			</div>
		</div>
	)
}

export default GigPage
