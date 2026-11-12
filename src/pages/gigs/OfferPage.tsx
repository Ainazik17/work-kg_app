// Карточка исполнителя «Мои услуги»
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../../App'
import { useGetOfferQuery } from '../../store/store'
import { Avatar, Button, EmptyState, FactTiles, Loader, Perk, ScreenHeader, payText } from '../../ui/wk'
import { isMasked, openTelegram, openWhatsApp } from '../../ui/contact'

const OfferPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { id } = useParams()
	const { showToast } = useToast()
	const { data: o, isLoading, isError } = useGetOfferQuery({ id: Number(id), tid: telegramId })

	if (isLoading) return <Loader />
	if (isError || !o)
		return (
			<div className='wk-screen'>
				<ScreenHeader title='Исполнитель' onBack={() => navigate(-1)} />
				<EmptyState emoji='🔍' title='Карточка не найдена' />
			</div>
		)

	const locked = !o.mine && isMasked(o.phone)

	return (
		<div className='wk-screen wk-enter text-left' style={{ paddingBottom: 170 }}>
			<ScreenHeader title='Исполнитель' onBack={() => navigate(-1)} />
			<div className='flex items-center' style={{ gap: 16 }}>
				<Avatar name={o.name} size={72} />
				<div>
					<h1 className='wk-h1' style={{ fontSize: 26 }}>
						{o.name}
					</h1>
					<div className='wk-meta' style={{ marginTop: 4 }}>
						{[o.district, o.cityName].filter(Boolean).join(' · ')}
					</div>
				</div>
			</div>

			<h3 className='wk-h3' style={{ marginTop: 24, marginBottom: 12 }}>
				Что умеет
			</h3>
			<div className='wk-chipwrap'>
				{o.skills.map((s) => (
					<Perk key={s}>{s}</Perk>
				))}
			</div>

			<div style={{ marginTop: 20 }}>
				<FactTiles
					items={[
						{ label: 'Цена', value: payText(o.price, o.priceUnit) },
						{ label: 'Свободен', value: o.days.join(', ') },
						{ label: 'Город', value: o.cityName },
					]}
				/>
			</div>

			{o.about && (
				<>
					<h3 className='wk-h3' style={{ marginTop: 28, marginBottom: 10 }}>
						О себе
					</h3>
					<div className='wk-body' style={{ whiteSpace: 'pre-wrap' }}>
						{o.about}
					</div>
				</>
			)}

			<div className='wk-bottombar'>
				<div className='wk-bottombar__inner'>
					{o.mine ? (
						<Button variant='ink' block onClick={() => navigate('/offer/edit')}>
							Редактировать
						</Button>
					) : locked ? (
						<Button variant='red' block onClick={() => navigate('/subscription')}>
							Открыть контакты · PRO
						</Button>
					) : (
						<div className='grid grid-cols-2' style={{ gap: 10 }}>
							<Button
								variant='wa'
								onClick={() =>
									openWhatsApp(o.phone, `Здравствуйте, ${o.name}! Нашёл(ла) ваши услуги в Work KG`) ||
									showToast('Номер телефона не указан', 'error')
								}
							>
								WhatsApp
							</Button>
							<Button
								variant='tg'
								onClick={() => openTelegram(o.telegramUsername) || showToast('У исполнителя нет username в Telegram', 'error')}
							>
								Telegram
							</Button>
						</div>
					)}
					{locked && <p className='wk-note'>Контакты исполнителя доступны с PRO</p>}
				</div>
			</div>
		</div>
	)
}

export default OfferPage
