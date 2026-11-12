// Голосовое к объявлению: запись (MediaRecorder) или выбор аудиофайла + плеер. Без распознавания.
import React, { useEffect, useRef, useState } from 'react'
import { Mic, Pause, Play, Square, Trash2, Upload } from 'lucide-react'
import { useUploadVoiceMutation } from '../store/store'
import { cx, haptic } from './wk'

export const MAX_VOICE_SEC = 120
export type VoiceValue = { key?: string; url: string; duration: number } | null

const fmt = (s: number) => {
	const t = Math.max(0, Math.round(s))
	return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

// mp4/aac слушается везде (iPhone, Android, десктоп), webm/opus — запасной вариант
const pickMime = () => {
	const MR = (window as any).MediaRecorder
	if (!MR?.isTypeSupported) return ''
	return ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find((t) =>
		MR.isTypeSupported(t),
	) || ''
}
const extFor = (mime: string) =>
	mime.includes('mp4') || mime.includes('m4a') ? '.m4a'
		: mime.includes('ogg') ? '.ogg'
		: mime.includes('mpeg') || mime.includes('mp3') ? '.mp3'
		: mime.includes('wav') ? '.wav'
		: mime.includes('aac') ? '.aac'
		: '.webm'

const canRecord = () =>
	typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!(window as any).MediaRecorder

/** Плеер голосового: ▶ / ⏸, полоса прогресса, время */
export const VoicePlayer: React.FC<{ url: string; duration?: number | null; compact?: boolean }> = ({
	url,
	duration,
	compact,
}) => {
	const audio = useRef<HTMLAudioElement>(null)
	const [playing, setPlaying] = useState(false)
	const [pos, setPos] = useState(0)
	const [failed, setFailed] = useState(false)
	const total = duration || 0

	const toggle = () => {
		const a = audio.current
		if (!a) return
		haptic.select()
		if (playing) a.pause()
		else a.play().catch(() => setFailed(true))
	}

	return (
		<div className={cx('wk-voice', compact && 'wk-voice--compact')}>
			<button type='button' className='wk-voice__btn' onClick={toggle} aria-label={playing ? 'Пауза' : 'Слушать'}>
				{playing ? <Pause size={18} fill='#fff' stroke='none' /> : <Play size={18} fill='#fff' stroke='none' />}
			</button>
			<div className='flex-1 min-w-0'>
				<div className='wk-voice__track'>
					<span className='wk-voice__fill' style={{ width: total ? `${Math.min(100, (pos / total) * 100)}%` : 0 }} />
				</div>
				<div className='wk-voice__time'>
					{failed ? 'Не удалось воспроизвести на этом устройстве' : `🎧 ${playing || pos ? fmt(pos) + ' / ' : ''}${fmt(total)}`}
				</div>
			</div>
			<audio
				ref={audio}
				src={url}
				preload='none'
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onEnded={() => {
					setPlaying(false)
					setPos(0)
				}}
				onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
				onError={() => setFailed(true)}
			/>
		</div>
	)
}

/** Запись голосового в форме. Загружает файл сразу после записи и отдаёт ключ для публикации. */
export const VoiceRecorder: React.FC<{
	telegramId: number
	value: VoiceValue
	onChange: (v: VoiceValue) => void
	onError: (message: string) => void
	hint?: string
}> = ({ telegramId, value, onChange, onError, hint }) => {
	const [upload, { isLoading }] = useUploadVoiceMutation()
	const [recording, setRecording] = useState(false)
	const [sec, setSec] = useState(0)
	const rec = useRef<MediaRecorder | null>(null)
	const chunks = useRef<Blob[]>([])
	const started = useRef(0)
	const timer = useRef<number | undefined>(undefined)
	const fileInput = useRef<HTMLInputElement>(null)

	useEffect(() => () => {
		window.clearInterval(timer.current)
		rec.current?.stream.getTracks().forEach((t) => t.stop())
	}, [])

	const send = async (blob: Blob, duration: number, mime: string) => {
		if (duration < 1) return onError('Слишком коротко — скажите хотя бы пару слов')
		if (duration > MAX_VOICE_SEC + 1) return onError('Голосовое — до 2 минут')
		if (blob.size > 3 * 1024 * 1024) return onError('Голосовое слишком большое — до 2 минут')
		try {
			const typed = blob.type ? blob : new Blob([blob], { type: mime })
			const r = await upload({ tid: telegramId, file: typed, duration: Math.round(duration), ext: extFor(mime) }).unwrap()
			haptic.notify('success')
			// ссылка с сервера переживает перезагрузку (черновик в sessionStorage), blob: — нет
			onChange({ key: r.key, url: r.url || URL.createObjectURL(typed), duration: Math.round(duration) })
		} catch (e: any) {
			onError(e?.data?.message || 'Не удалось загрузить голосовое. Проверьте интернет')
		}
	}

	const start = async () => {
		if (!canRecord()) return fileInput.current?.click()
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			const mime = pickMime()
			const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
			chunks.current = []
			r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
			r.onstop = () => {
				stream.getTracks().forEach((t) => t.stop())
				const type = r.mimeType || mime || 'audio/webm'
				const duration = (Date.now() - started.current) / 1000
				send(new Blob(chunks.current, { type }), Math.min(duration, MAX_VOICE_SEC), type)
			}
			rec.current = r
			started.current = Date.now()
			r.start()
			haptic.impact('medium')
			setSec(0)
			setRecording(true)
			timer.current = window.setInterval(() => {
				const s = (Date.now() - started.current) / 1000
				setSec(s)
				if (s >= MAX_VOICE_SEC) stop()
			}, 250)
		} catch {
			onError('Нет доступа к микрофону — разрешите его в настройках или выберите аудиофайл')
		}
	}

	const stop = () => {
		window.clearInterval(timer.current)
		setRecording(false)
		if (rec.current?.state === 'recording') rec.current.stop()
		haptic.impact('light')
	}

	const onFile = (f?: File) => {
		if (!f) return
		const url = URL.createObjectURL(f)
		const a = new Audio()
		a.preload = 'metadata'
		a.onloadedmetadata = () => {
			const d = isFinite(a.duration) ? a.duration : 0
			URL.revokeObjectURL(url)
			if (!d) return onError('Не удалось прочитать аудиофайл')
			send(f, d, f.type || 'audio/mp4')
		}
		a.onerror = () => onError('Этот формат аудио не поддерживается')
		a.src = url
	}

	if (value && !recording)
		return (
			<div>
				<VoicePlayer url={value.url} duration={value.duration} />
				<div className='flex' style={{ gap: 8, marginTop: 8 }}>
					<button type='button' className='wk-chip' onClick={start}>
						<Mic size={15} strokeWidth={2} /> Перезаписать
					</button>
					<button type='button' className='wk-chip' onClick={() => onChange(null)}>
						<Trash2 size={15} strokeWidth={2} /> Удалить
					</button>
				</div>
			</div>
		)

	return (
		<div>
			{recording ? (
				<button type='button' className='wk-voice wk-voice--rec' onClick={stop}>
					<span className='wk-voice__btn is-rec'>
						<Square size={16} fill='#fff' stroke='none' />
					</span>
					<span className='flex-1 text-left'>
						<span className='wk-voice__dot' /> Идёт запись · {fmt(sec)} / {fmt(MAX_VOICE_SEC)}
						<span className='wk-voice__time' style={{ display: 'block' }}>Нажмите, чтобы закончить</span>
					</span>
				</button>
			) : (
				<button type='button' className='wk-voice wk-press' onClick={start} disabled={isLoading}>
					<span className='wk-voice__btn'>{isLoading ? <span className='wk-spinner' /> : <Mic size={18} strokeWidth={2} />}</span>
					<span className='flex-1 text-left'>
						<span style={{ fontWeight: 600 }}>{isLoading ? 'Загружаем…' : 'Записать голосовое'}</span>
						<span className='wk-voice__time' style={{ display: 'block' }}>{hint || 'До 2 минут — расскажите своими словами'}</span>
					</span>
				</button>
			)}
			{!recording && !isLoading && (
				<button
					type='button'
					className='wk-xs flex items-center gap-1'
					style={{ marginTop: 8 }}
					onClick={() => fileInput.current?.click()}
				>
					<Upload size={13} strokeWidth={2} /> или выбрать аудиофайл
				</button>
			)}
			<input
				ref={fileInput}
				type='file'
				accept='audio/*'
				hidden
				onChange={(e) => {
					onFile(e.target.files?.[0])
					e.target.value = ''
				}}
			/>
		</div>
	)
}
