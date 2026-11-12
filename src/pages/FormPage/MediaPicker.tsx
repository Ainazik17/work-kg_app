import React, { useEffect, useMemo } from 'react'
import { Video } from 'lucide-react'

/** Плавно прокрутить к первому полю с ошибкой (DESIGN_SPEC 6.x «Проверка при отправке») */
export const focusFirstError = () => {
	requestAnimationFrame(() => {
		const el = document.querySelector('[data-error="true"]')
		el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
	})
}

const Thumb: React.FC<{ file: File; onRemove: () => void }> = ({
	file,
	onRemove,
}) => {
	const url = useMemo(() => URL.createObjectURL(file), [file])
	useEffect(() => () => URL.revokeObjectURL(url), [url])
	const isVideo = file.type.startsWith('video')
	return (
		<div className='wk-thumb'>
			{isVideo ? <video src={url} muted /> : <img src={url} alt='' />}
			<button
				type='button'
				aria-label='Убрать'
				className='wk-thumb__x'
				onClick={onRemove}
			>
				×
			</button>
		</div>
	)
}

/** Карточка «Добавить фото» с пунктиром + превью. Состояние файлов — у формы. */
export const MediaPicker: React.FC<{
	photos: File[]
	videos: File[]
	onPhotos: (f: File[]) => void
	onVideos: (f: File[]) => void
	subtitle?: string
}> = ({ photos, videos, onPhotos, onVideos, subtitle }) => (
	<div className='wk-field text-left'>
		<label className='wk-label'>Фото и видео</label>
		<div className='grid grid-cols-1 gap-2'>
			<label className='wk-upload'>
				<input
					type='file'
					multiple
					accept='image/*'
					className='hidden'
					onChange={(e) => {
						if (e.target.files)
							onPhotos([...photos, ...Array.from(e.target.files)])
						e.target.value = ''
					}}
				/>
				<span className='wk-upload__plus'>+</span>
				<span>
					<span className='block' style={{ fontWeight: 600 }}>
						Добавить фото{photos.length ? ` · ${photos.length}` : ''}
					</span>
					{subtitle && <span className='wk-xs block'>{subtitle}</span>}
				</span>
			</label>
			<label className='wk-upload' style={{ padding: 10 }}>
				<input
					type='file'
					multiple
					accept='video/*'
					className='hidden'
					onChange={(e) => {
						if (e.target.files)
							onVideos([...videos, ...Array.from(e.target.files)])
						e.target.value = ''
					}}
				/>
				<span
					className='wk-upload__plus'
					style={{ width: 40, height: 40, borderRadius: 12 }}
				>
					<Video size={18} strokeWidth={1.8} />
				</span>
				<span style={{ fontWeight: 600, fontSize: 14 }}>
					Добавить видео{videos.length ? ` · ${videos.length}` : ''}
				</span>
			</label>
		</div>

		{photos.length + videos.length > 0 && (
			<div
				className='flex gap-2 overflow-x-auto no-scrollbar'
				style={{ marginTop: 10 }}
			>
				{photos.map((f, i) => (
					<Thumb
						key={`p${i}${f.name}`}
						file={f}
						onRemove={() => onPhotos(photos.filter((_, j) => j !== i))}
					/>
				))}
				{videos.map((f, i) => (
					<Thumb
						key={`v${i}${f.name}`}
						file={f}
						onRemove={() => onVideos(videos.filter((_, j) => j !== i))}
					/>
				))}
			</div>
		)}
	</div>
)
