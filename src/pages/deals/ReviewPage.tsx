// 7.3 Отзыв [17]: необязательный второй шаг после подтверждения работы
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../../App'
import { useGetDealQuery, useReviewDealMutation } from '../../store/store'
import { Button, Loader, Panel, ScreenHeader, haptic } from '../../ui/wk'
import { StarInput } from '../../ui/stars'

const CRITERIA = {
	WORKER: ['Оплатил вовремя', 'Условия как договорились', 'Отношение'],
	EMPLOYER: ['Пунктуальность', 'Качество работы', 'Общение'],
}

const ReviewPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { showToast } = useToast()
	const { data: d, isLoading } = useGetDealQuery({ tid: telegramId, id: Number(id) })
	const [send, { isLoading: sending }] = useReviewDealMutation()
	const [marks, setMarks] = useState<(number | null)[]>([null, null, null])
	const [text, setText] = useState('')

	if (isLoading || !d) return <Loader />
	const labels = CRITERIA[d.side]
	const ready = marks.every((m) => m != null)

	const submit = async () => {
		if (!ready) return showToast('Оцените все три пункта', 'error')
		try {
			await send({ tid: telegramId, id: d.id, a: marks[0]!, b: marks[1]!, c: marks[2]!, text: text.trim() || undefined }).unwrap()
			haptic.notify('success')
			showToast('Спасибо за отзыв')
			navigate(-1)
		} catch (e: any) {
			showToast(e?.data?.message || 'Не удалось отправить', 'error')
		}
	}

	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader title='Отзыв' onBack={() => navigate(-1)} />
			<Panel style={{ padding: 18 }}>
				<div className='wk-xs'>Работа подтверждена ✓ · оценка уже сохранена</div>
				<div className='wk-h3' style={{ marginTop: 6 }}>
					{d.title}
				</div>
				<div className='wk-meta'>{d.otherName}</div>
			</Panel>

			{d.reviewed ? (
				<p className='wk-meta' style={{ marginTop: 20 }}>
					Вы уже оставили отзыв — спасибо!
				</p>
			) : (
				<>
					{labels.map((label, i) => (
						<div key={label} style={{ marginTop: 22 }}>
							<b>{label}</b>
							<StarInput
								value={marks[i]}
								label={label}
								onChange={(v) => setMarks((m) => m.map((x, j) => (j === i ? v : x)))}
							/>
						</div>
					))}
					<textarea
						className='wk-input'
						style={{ marginTop: 22, minHeight: 100 }}
						value={text}
						maxLength={1000}
						onChange={(e) => setText(e.target.value)}
						placeholder='Пара слов о том, как прошла работа (необязательно)'
					/>
					<p className='wk-xs' style={{ marginTop: 10 }}>
						{d.side === 'WORKER'
							? `Отзыв появится на профиле «${d.otherName}» с отметкой «Работал(а) здесь».`
							: `Оценка повлияет на рейтинг ${d.otherName} в откликах.`}
					</p>
					<Button
						variant='red'
						block
						loading={sending}
						style={{ marginTop: 20, opacity: ready ? 1 : 0.4 }}
						onClick={submit}
					>
						Отправить
					</Button>
				</>
			)}
		</div>
	)
}

export default ReviewPage
