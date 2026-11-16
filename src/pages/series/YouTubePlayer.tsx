// Свой плеер поверх YouTube: прячем кнопки YouTube (название, логотип, «Поделиться», похожие видео)
// и закрываем iframe прозрачным слоем, чтобы ссылку на видео нельзя было открыть или скопировать.
// Управление — своё: пауза, перемотка, полный экран.
import React, { useEffect, useRef, useState } from 'react'
import { Maximize, Minimize, Pause, Play } from 'lucide-react'

declare global {
	interface Window {
		YT?: any
		onYouTubeIframeAPIReady?: () => void
	}
}

let apiPromise: Promise<any> | null = null
const loadApi = () => {
	if (window.YT?.Player) return Promise.resolve(window.YT)
	if (!apiPromise) {
		apiPromise = new Promise((resolve) => {
			const prev = window.onYouTubeIframeAPIReady
			window.onYouTubeIframeAPIReady = () => {
				prev?.()
				resolve(window.YT)
			}
			const s = document.createElement('script')
			s.src = 'https://www.youtube.com/iframe_api'
			document.head.appendChild(s)
		})
	}
	return apiPromise
}

const fmt = (t: number) => {
	const s = Math.max(0, Math.floor(t))
	const h = Math.floor(s / 3600)
	const m = Math.floor((s % 3600) / 60)
	const sec = String(s % 60).padStart(2, '0')
	return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

type Props = {
	videoId: string
	poster?: string | null
	onEnded?: () => void
}

export const YouTubePlayer: React.FC<Props> = ({ videoId, poster, onEnded }) => {
	const box = useRef<HTMLDivElement>(null)
	const mount = useRef<HTMLDivElement>(null)
	const player = useRef<any>(null)
	const endedRef = useRef(onEnded)
	endedRef.current = onEnded
	const [ready, setReady] = useState(false)
	const [playing, setPlaying] = useState(false)
	const [started, setStarted] = useState(false)
	// До запуска плеер YouTube (название, логотип) закрыт нашей обложкой.
	// iOS иногда не даёт запустить видео из своей кнопки — тогда открываем только кнопку ▶ самого плеера.
	const [needTap, setNeedTap] = useState(false)
	const startTimer = useRef<number | undefined>(undefined)
	const [time, setTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [full, setFull] = useState(false)
	const [showUi, setShowUi] = useState(true)
	const hideTimer = useRef<number | undefined>(undefined)

	useEffect(() => {
		let cancelled = false
		setReady(false)
		setPlaying(false)
		setStarted(false)
		setNeedTap(false)
		setTime(0)
		loadApi().then((YT) => {
			if (cancelled || !mount.current) return
			const el = document.createElement('div')
			mount.current.innerHTML = ''
			mount.current.appendChild(el)
			player.current = new YT.Player(el, {
				videoId,
				host: 'https://www.youtube-nocookie.com',
				width: '100%',
				height: '100%',
				playerVars: {
					controls: 0, // свои кнопки
					disablekb: 1,
					fs: 0,
					rel: 0,
					modestbranding: 1,
					iv_load_policy: 3,
					playsinline: 1,
					cc_load_policy: 0,
				},
				events: {
					onReady: () => {
						if (cancelled) return
						setReady(true)
						setDuration(player.current?.getDuration?.() || 0)
					},
					onStateChange: (e: any) => {
						const st = e.data
						if (st === 1) {
							setPlaying(true)
							setStarted(true)
							setDuration(player.current?.getDuration?.() || 0)
						} else if (st === 2 || st === 0) {
							setPlaying(false)
							setShowUi(true)
						}
						if (st === 0) endedRef.current?.()
					},
				},
			})
		})
		return () => {
			cancelled = true
			try {
				player.current?.destroy?.()
			} catch {
				/* ignore */
			}
			player.current = null
		}
	}, [videoId])

	// Позиция для полосы перемотки
	useEffect(() => {
		if (!playing) return
		const t = window.setInterval(() => setTime(player.current?.getCurrentTime?.() || 0), 500)
		return () => window.clearInterval(t)
	}, [playing])

	// Кнопки прячутся через 3 с во время просмотра
	const poke = () => {
		setShowUi(true)
		window.clearTimeout(hideTimer.current)
		hideTimer.current = window.setTimeout(() => setShowUi(false), 3000)
	}
	useEffect(() => () => window.clearTimeout(hideTimer.current), [])

	// Своя кнопка ▶ на обложке. Не запустилось за 1.5 с (iOS) — просим нажать ▶ в самом плеере
	const start = () => {
		const p = player.current
		if (!p) return
		try {
			p.playVideo()
		} catch {
			/* ignore */
		}
		window.clearTimeout(startTimer.current)
		startTimer.current = window.setTimeout(() => {
			if (p.getPlayerState?.() !== 1) setNeedTap(true)
		}, 1500)
	}
	useEffect(() => () => window.clearTimeout(startTimer.current), [])

	const toggle = () => {
		const p = player.current
		if (!p) return
		playing ? p.pauseVideo() : p.playVideo()
		poke()
	}

	const seek = (v: number) => {
		player.current?.seekTo?.(v, true)
		setTime(v)
		poke()
	}

	// Полный экран: системный, а если WebView не умеет — растягиваем блок на весь экран
	const toggleFull = async () => {
		const el = box.current as any
		const doc = document as any
		if (!full) {
			try {
				if (el?.requestFullscreen) await el.requestFullscreen()
				else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen()
			} catch {
				/* остаёмся на CSS-варианте */
			}
			setFull(true)
		} else {
			try {
				if (doc.fullscreenElement) await doc.exitFullscreen()
				else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen()
			} catch {
				/* ignore */
			}
			setFull(false)
		}
		poke()
	}
	useEffect(() => {
		const onFs = () => {
			const d = document as any
			if (!d.fullscreenElement && !d.webkitFullscreenElement) setFull(false)
		}
		document.addEventListener('fullscreenchange', onFs)
		document.addEventListener('webkitfullscreenchange', onFs)
		return () => {
			document.removeEventListener('fullscreenchange', onFs)
			document.removeEventListener('webkitfullscreenchange', onFs)
		}
	}, [])

	const block = (e: React.SyntheticEvent) => e.preventDefault()

	return (
		<div
			ref={box}
			onContextMenu={block}
			style={
				full
					? { position: 'fixed', inset: 0, zIndex: 1000, background: '#000' }
					: { position: 'relative', width: '100%', height: '100%', background: '#000' }
			}
		>
			<div ref={mount} style={{ position: 'absolute', inset: 0 }} />

			{/* Щит: iframe никогда не нажимается напрямую, кроме кнопки ▶ в центре в запасном режиме iOS */}
			{started ? (
				<div
					onClick={toggle}
					onContextMenu={block}
					onMouseMove={poke}
					style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
				/>
			) : needTap ? (
				<>
					{/* верх (название) и низ (логотип YouTube) закрыты, середина с кнопкой ▶ — открыта */}
					<div onContextMenu={block} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '30%', background: '#000' }} />
					<div onContextMenu={block} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%', background: '#000' }}>
						<div style={{ color: '#fff', fontSize: 13, textAlign: 'center', marginTop: 10, opacity: 0.85 }}>
							Нажмите ▶ ещё раз
						</div>
					</div>
					<div onContextMenu={block} style={{ position: 'absolute', left: 0, top: '30%', bottom: '30%', width: '30%', background: '#000' }} />
					<div onContextMenu={block} style={{ position: 'absolute', right: 0, top: '30%', bottom: '30%', width: '30%', background: '#000' }} />
				</>
			) : (
				/* Обложка с нашей кнопкой ▶ поверх всего плеера YouTube */
				<div
					onClick={start}
					onContextMenu={block}
					className='flex items-center justify-center'
					style={{ position: 'absolute', inset: 0, background: '#000', cursor: 'pointer' }}
				>
					{poster && (
						<img src={poster} alt='' style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
					)}
					<span
						className='flex items-center justify-center'
						style={{
							position: 'relative',
							width: 64,
							height: 64,
							borderRadius: 999,
							background: 'rgba(255,255,255,.92)',
							color: '#000',
							opacity: ready ? 1 : 0.5,
						}}
					>
						<Play size={28} fill='currentColor' />
					</span>
				</div>
			)}

			{/* На паузе прячем то, что YouTube показывает поверх видео (название, похожие ролики) */}
			{started && !playing && (
				<div
					onClick={toggle}
					className='flex items-center justify-center'
					style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.88)', cursor: 'pointer' }}
				>
					<span
						className='flex items-center justify-center'
						style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(255,255,255,.92)', color: '#000' }}
					>
						<Play size={28} fill='currentColor' />
					</span>
				</div>
			)}

			{started && (showUi || !playing) && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						padding: '18px 10px 8px',
						background: 'linear-gradient(transparent, rgba(0,0,0,.75))',
						color: '#fff',
						display: 'flex',
						alignItems: 'center',
						gap: 10,
					}}
				>
					<button onClick={toggle} aria-label={playing ? 'Пауза' : 'Смотреть'} style={btn}>
						{playing ? <Pause size={20} fill='currentColor' /> : <Play size={20} fill='currentColor' />}
					</button>
					<span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', minWidth: 38 }}>{fmt(time)}</span>
					<input
						type='range'
						min={0}
						max={duration || 0}
						step={1}
						value={Math.min(time, duration || 0)}
						onChange={(e) => seek(Number(e.target.value))}
						style={{ flex: 1, accentColor: '#fff' }}
						aria-label='Перемотка'
					/>
					<span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', minWidth: 38, textAlign: 'right' }}>
						{fmt(duration)}
					</span>
					<button onClick={toggleFull} aria-label='Во весь экран' style={btn}>
						{full ? <Minimize size={18} /> : <Maximize size={18} />}
					</button>
				</div>
			)}
		</div>
	)
}

const btn: React.CSSProperties = {
	background: 'transparent',
	border: 0,
	color: '#fff',
	padding: 6,
	display: 'flex',
	cursor: 'pointer',
}
