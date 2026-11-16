// Раздел «Сериал»: бесплатные серии (отмечает админ) открыты всем, остальные — с любым тарифом (PRO).
// /series — список сериалов (если один — сразу открываем его), /series/:id — плеер и серии.
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Lock, Play } from 'lucide-react'
import { useGetSeriesListQuery, useGetSeriesQuery } from '../../store/store'
import type { SeriesEpisode } from '../../../types'
import { Button, EmptyState, Loader, Panel, ScreenHeader, StatusPill, haptic } from '../../ui/wk'
import { freeEpisodesText } from './SeriesPromo'

const duration = (sec?: number | null) => {
	if (!sec) return ''
	const m = Math.floor(sec / 60)
	const s = sec % 60
	return `${m}:${String(s).padStart(2, '0')}`
}

export const SeriesListPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { data: list, isLoading, isError } = useGetSeriesListQuery(telegramId)

	// Один сериал — не показываем лишний экран со списком
	useEffect(() => {
		if (list && list.length === 1) navigate(`/series/${list[0].id}`, { replace: true })
	}, [list])

	if (isLoading) return <Loader />
	return (
		<div className='wk-screen wk-enter text-left'>
			<ScreenHeader title='Сериал' onBack={() => navigate(-1)} />
			{isError || !list?.length ? (
				<EmptyState emoji='🎬' title='Скоро премьера' text='Первые серии появятся здесь совсем скоро' />
			) : (
				<div className='flex flex-col' style={{ gap: 14 }}>
					{list.map((s) => (
						<Panel key={s.id} press onClick={() => navigate(`/series/${s.id}`)} style={{ padding: 0, overflow: 'hidden' }}>
							{s.coverUrl && (
								<img src={s.coverUrl} alt='' style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
							)}
							<div style={{ padding: 16 }}>
								<div className='wk-h3'>{s.title}</div>
								<div className='wk-meta' style={{ marginTop: 4 }}>
									{s.episodesCount} сер.{freeEpisodesText(s.freeEpisodesCount) ? ` · ${freeEpisodesText(s.freeEpisodesCount)}` : ''}
								</div>
							</div>
						</Panel>
					))}
				</div>
			)}
		</div>
	)
}

export const SeriesPage: React.FC<{ telegramId: number }> = ({ telegramId }) => {
	const navigate = useNavigate()
	const { id } = useParams()
	const [params, setParams] = useSearchParams()
	const { data: s, isLoading, isError, refetch } = useGetSeriesQuery({ id: Number(id), tid: telegramId })
	const [current, setCurrent] = useState<SeriesEpisode | null>(null)
	const [paywall, setPaywall] = useState<SeriesEpisode | null>(null)
	const videoRef = useRef<HTMLVideoElement>(null)

	// Серия из ?ep=… или первая открытая
	useEffect(() => {
		if (!s?.episodes?.length) return
		const wanted = Number(params.get('ep'))
		const ep =
			s.episodes.find((e) => e.id === wanted && !e.locked) ||
			(current && s.episodes.find((e) => e.id === current.id && !e.locked)) ||
			s.episodes.find((e) => !e.locked) ||
			null
		setCurrent(ep)
	}, [s])

	if (isLoading) return <Loader />
	if (isError || !s)
		return (
			<div className='wk-screen'>
				<ScreenHeader title='Сериал' onBack={() => navigate(-1)} />
				<EmptyState emoji='🎬' title='Сериал не найден' />
			</div>
		)

	const episodes = s.episodes || []
	const pick = (e: SeriesEpisode) => {
		haptic.select()
		if (e.locked) {
			setPaywall(e)
			return
		}
		setPaywall(null)
		setCurrent(e)
		setParams({ ep: String(e.id) }, { replace: true })
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
	const next = current ? episodes.find((e) => e.number > current.number) : undefined

	return (
		<div className='wk-screen wk-enter text-left' style={{ paddingBottom: 120 }}>
			<ScreenHeader title={s.title} onBack={() => navigate(-1)} />

			<div
				style={{
					position: 'relative',
					borderRadius: 18,
					overflow: 'hidden',
					background: '#000',
					aspectRatio: '16/9',
				}}
			>
				{paywall ? (
					<Paywall ep={paywall} cover={paywall.thumbnailUrl || s.coverUrl} onBuy={() => navigate('/subscription')} />
				) : current?.youtubeId ? (
					<iframe
						key={current.id}
						src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
						title={current.title}
						allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
						style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
					/>
				) : current?.videoUrl ? (
					<video
						key={current.id}
						ref={videoRef}
						src={current.videoUrl}
						poster={current.thumbnailUrl || s.coverUrl || undefined}
						controls
						playsInline
						controlsList='nodownload'
						onContextMenu={(e) => e.preventDefault()}
						// presigned-ссылка живёт 6 ч: если истекла — берём свежую
						onError={() => refetch()}
						onEnded={() => next && pick(next)}
						style={{ width: '100%', height: '100%', display: 'block' }}
					/>
				) : (
					<div className='flex items-center justify-center' style={{ height: '100%', color: '#fff', opacity: 0.7 }}>
						Видео скоро появится
					</div>
				)}
			</div>

			{current && !paywall && (
				<div style={{ marginTop: 14 }}>
					<div className='wk-h3'>
						{current.number}. {current.title}
					</div>
					{current.description && (
						<div className='wk-body' style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
							{current.description}
						</div>
					)}
					{next && (
						<Button variant='line' size='sm' style={{ marginTop: 12 }} onClick={() => pick(next)}>
							{next.locked ? <Lock size={14} strokeWidth={2} /> : <Play size={14} strokeWidth={2} fill='currentColor' />}
							Следующая серия
						</Button>
					)}
				</div>
			)}

			{s.description && !current && <p className='wk-sub' style={{ marginTop: 14 }}>{s.description}</p>}

			<div className='flex items-center justify-between' style={{ marginTop: 26, marginBottom: 12 }}>
				<h3 className='wk-h3'>Серии</h3>
				{!s.hasAccess && !!freeEpisodesText(s.freeEpisodesCount) && (
					<span className='wk-meta'>{freeEpisodesText(s.freeEpisodesCount)}</span>
				)}
			</div>

			<div className='flex flex-col' style={{ gap: 10 }}>
				{episodes.map((e) => {
					const active = current?.id === e.id && !paywall
					return (
						<Panel
							key={e.id}
							press
							onClick={() => pick(e)}
							className='flex items-center'
							style={{
								gap: 12,
								padding: 10,
								outline: active ? '2px solid var(--brand)' : undefined,
								opacity: e.locked ? 0.85 : 1,
							}}
						>
							<div
								style={{
									position: 'relative',
									width: 112,
									flex: '0 0 112px',
									aspectRatio: '16/9',
									borderRadius: 12,
									overflow: 'hidden',
									background: 'var(--soft)',
								}}
							>
								{(e.thumbnailUrl || s.coverUrl) && (
									<img
										src={e.thumbnailUrl || s.coverUrl || ''}
										alt=''
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											filter: e.locked ? 'blur(2px) brightness(.6)' : undefined,
										}}
									/>
								)}
								<span
									className='flex items-center justify-center'
									style={{ position: 'absolute', inset: 0, color: e.locked || e.thumbnailUrl || s.coverUrl ? '#fff' : 'var(--ink)' }}
								>
									{e.locked ? <Lock size={20} strokeWidth={2} /> : <Play size={20} strokeWidth={2} fill='currentColor' />}
								</span>
							</div>
							<div className='min-w-0 flex-1'>
								<div className='wk-meta'>Серия {e.number}{e.durationSec ? ` · ${duration(e.durationSec)}` : ''}</div>
								<div style={{ fontWeight: 600, marginTop: 2 }} className='truncate'>
									{e.title}
								</div>
								<div style={{ marginTop: 6 }}>
									{e.free && !s.hasAccess ? (
										<StatusPill tone='ok'>Бесплатно</StatusPill>
									) : e.locked ? (
										<StatusPill tone='brand'>С тарифом</StatusPill>
									) : null}
								</div>
							</div>
						</Panel>
					)
				})}
			</div>

			{!s.hasAccess && episodes.some((e) => e.locked) && (
				<div className='wk-bottombar'>
					<div className='wk-bottombar__inner'>
						<Button variant='red' block onClick={() => navigate('/subscription')}>
							Открыть все серии
						</Button>
						<p className='wk-note'>Все серии доступны с любым тарифом PRO</p>
					</div>
				</div>
			)}
		</div>
	)
}

const Paywall: React.FC<{ ep: SeriesEpisode; cover?: string | null; onBuy: () => void }> = ({ ep, cover, onBuy }) => (
	<div style={{ position: 'relative', width: '100%', height: '100%' }}>
		{cover && (
			<img
				src={cover}
				alt=''
				style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px) brightness(.45)' }}
			/>
		)}
		<div
			className='flex flex-col items-center justify-center text-center'
			style={{ position: 'absolute', inset: 0, padding: 16, color: '#fff', gap: 8 }}
		>
			<Lock size={28} strokeWidth={2} />
			<div style={{ fontWeight: 700 }}>Серия {ep.number} доступна с тарифом</div>
			<div style={{ fontSize: 13, opacity: 0.85 }}>Купите любой тариф — откроются все серии</div>
			<Button variant='white' size='sm' onClick={onBuy} style={{ marginTop: 6 }}>
				Выбрать тариф
			</Button>
		</div>
	</div>
)

export default SeriesPage
