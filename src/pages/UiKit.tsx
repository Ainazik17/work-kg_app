// Витрина компонентов (DESIGN_SPEC.md, раздел 1). Доступна только в dev: #/ui-kit
import React, { useState } from 'react'
import { Bell, BriefcaseBusiness, FileText, Gem, Gift, Heart, Search } from 'lucide-react'
import {
	Avatar,
	BackButton,
	Button,
	Chip,
	Cover,
	EmptyState,
	FactTiles,
	Field,
	IconButton,
	JobCard,
	Logo,
	MenuList,
	Panel,
	Perk,
	SectionHead,
	Segmented,
	Sheet,
	SheetOption,
	Skeleton,
	StatsBlock,
	StatusPill,
	Tabs,
} from '../ui/wk'

const COLORS = [
	'bg', 'card', 'ink', 'ink2', 'muted', 'line', 'chip-border', 'soft',
	'brand', 'brand-soft', 'ok', 'ok-soft', 'tick', 'gig', 'gig-soft',
	'star', 'warn-bg', 'warn', 'dispute', 'wa', 'tg', 'nav-off',
]

const Block: React.FC<{ title: string; children: React.ReactNode }> = ({
	title,
	children,
}) => (
	<section>
		<SectionHead title={title} />
		{children}
	</section>
)

export const UiKit: React.FC = () => {
	const [tab, setTab] = useState<'vac' | 'gig'>('vac')
	const [chip, setChip] = useState('Все')
	const [seg, setSeg] = useState<'m' | 's' | 'h'>('m')
	const [sheet, setSheet] = useState(false)

	return (
		<div className='wk-screen text-left' style={{ paddingBottom: 60 }}>
			<h1 className='wk-h1'>Витрина компонентов</h1>
			<p className='wk-sub' style={{ marginTop: 8 }}>
				Work KG · design/DESIGN_SPEC.md, раздел 1
			</p>

			<Block title='Цвета'>
				<div className='grid grid-cols-4' style={{ gap: 8 }}>
					{COLORS.map((c) => (
						<div key={c}>
							<div
								style={{
									height: 44,
									borderRadius: 12,
									background: `var(--${c})`,
									boxShadow: 'inset 0 0 0 1px var(--line)',
								}}
							/>
							<div className='wk-xs' style={{ marginTop: 4, fontSize: 11 }}>
								{c}
							</div>
						</div>
					))}
				</div>
			</Block>

			<Block title='Типографика'>
				<Panel className='space-y-3'>
					<div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.04em' }}>62,50 сом</div>
					<div className='wk-h1'>Работа в лучших местах Бишкека</div>
					<div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>
						35 000 – 45 000 сом
					</div>
					<div className='wk-h2'>Топ работодатели</div>
					<div className='wk-job__title'>Официант · 35 000 – 45 000 сом</div>
					<div className='wk-h3'>Грузчики на переезд</div>
					<div className='wk-body'>Встречать гостей, помогать с выбором.</div>
					<div className='wk-meta'>2/2 · от 1 года · 1,2 км</div>
					<div className='wk-xs'>Можно указать только «от»</div>
				</Panel>
			</Block>

			<Block title='Button'>
				<div className='space-y-2.5'>
					<Button variant='red' block>Опубликовать вакансию</Button>
					<Button variant='ink' block>Тёмная</Button>
					<Button variant='line' block>Обводка</Button>
					<div className='grid grid-cols-2' style={{ gap: 10 }}>
						<Button variant='wa'>WhatsApp</Button>
						<Button variant='tg'>Telegram</Button>
					</div>
					<div className='flex flex-wrap' style={{ gap: 8 }}>
						<Button variant='ink' size='sm'>Малая</Button>
						<Button variant='line' size='sm'>Малая line</Button>
						<Button variant='red' size='sm' disabled>Disabled</Button>
						<Button variant='ink' size='sm' loading>.</Button>
					</div>
				</div>
			</Block>

			<Block title='IconButton · Logo · Avatar'>
				<div className='flex items-center flex-wrap' style={{ gap: 10 }}>
					<BackButton onClick={() => {}} />
					<IconButton label='Уведомления' dot>
						<Bell size={20} strokeWidth={1.8} />
					</IconButton>
					<IconButton label='Сохранить'>
						<Heart size={20} strokeWidth={1.8} />
					</IconButton>
					{[44, 48, 50, 68].map((s) => (
						<Logo key={s} name='Tash Kitchen' size={s} />
					))}
					<Avatar name='Focus' size={42} />
				</div>
			</Block>

			<Block title='Cover'>
				<div style={{ margin: '0 -20px' }}>
					<Cover name='Tash Kitchen' height={150}>
						<BackButton glass onClick={() => {}} />
						<IconButton glass label='Сохранить'>
							<Heart size={20} strokeWidth={1.8} />
						</IconButton>
					</Cover>
				</div>
				<div className='wk-balance' style={{ marginTop: 12 }}>
					<div style={{ fontSize: 12.5, opacity: 0.7 }}>Баланс</div>
					<div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.03em' }}>1 250</div>
				</div>
			</Block>

			<Block title='SearchBar · Tabs · Chips'>
				<label className='wk-search'>
					<Search size={20} strokeWidth={1.8} />
					<input placeholder='Должность или компания' />
				</label>
				<Tabs
					className='mt-[22px]'
					value={tab}
					onChange={(v) => setTab(v as 'vac' | 'gig')}
					items={[
						{ value: 'vac', label: 'Вакансии' },
						{ value: 'gig', label: 'Подработка' },
					]}
				/>
				<div className='wk-chiprow' style={{ marginTop: 16 }}>
					{['Все', 'Рестораны и кафе', 'Кофейни', 'Отели', 'Ещё 17 ›'].map((c) => (
						<Chip key={c} active={chip === c} onClick={() => setChip(c)}>
							{c}
						</Chip>
					))}
				</div>
			</Block>

			<Block title='JobCard'>
				<div className='wk-stack'>
					<JobCard
						title='Официант'
						company='Tash Kitchen'
						logoName='Tash Kitchen'
						salary='35 000 – 45 000 сом'
						meta={['2/2', 'от 1 года', '1,2 км']}
						badge={<StatusPill tone='warn'>⚡ ТОП</StatusPill>}
					/>
					<JobCard
						title='Айгерим Садыкова'
						company='Общепит · Официанты'
						logoName='Айгерим'
						avatar
						salary='2 года опыта'
						meta={['24 года', 'Бишкек']}
					/>
					<Skeleton height={128} />
				</div>
			</Block>

			<Block title='FactTiles · StatsBlock · Perk · StatusPill'>
				<FactTiles
					items={[
						{ label: 'График', value: '2/2' },
						{ label: 'Опыт', value: 'от 1 года' },
						{ label: 'Где', value: '1,2 км' },
					]}
				/>
				<div style={{ marginTop: 12 }}>
					<StatsBlock
						items={[
							{ value: '120+', label: 'сотрудников' },
							{ value: '46', label: 'наняли здесь' },
							{ value: '2023', label: 'с Work KG' },
						]}
					/>
				</div>
				<div className='wk-chipwrap' style={{ marginTop: 12 }}>
					<Perk>🍽 Питание</Perk>
					<Perk>👔 Форма</Perk>
					<Perk>💸 Чаевые</Perk>
				</div>
				<div className='flex flex-wrap' style={{ gap: 8, marginTop: 12 }}>
					<StatusPill tone='warn'>Истекает завтра</StatusPill>
					<StatusPill tone='gig'>Разовое</StatusPill>
					<StatusPill tone='brand'>Оцените</StatusPill>
					<StatusPill tone='muted'>Закрыта</StatusPill>
					<StatusPill tone='ok'>Активно</StatusPill>
				</div>
			</Block>

			<Block title='Поля'>
				<Field label='Должность' hint='Сферу определим сами'>
					<input className='wk-input' placeholder='Например: официант' />
				</Field>
				<Field label='Зарплата, сом' error='Укажите зарплату или включите «Договорная»'>
					<input className='wk-input is-error' placeholder='от' />
				</Field>
				<Field label='Описание'>
					<textarea className='wk-input' placeholder='Чем предстоит заниматься?' />
				</Field>
				<Field>
					<Segmented
						value={seg}
						onChange={(v) => setSeg(v as 'm' | 's' | 'h')}
						options={[
							{ value: 'm', label: 'В месяц' },
							{ value: 's', label: 'За смену' },
							{ value: 'h', label: 'В час' },
						]}
					/>
				</Field>
			</Block>

			<Block title='MenuList · Panel · Sheet'>
				<MenuList
					items={[
						{ icon: <FileText size={20} strokeWidth={1.8} />, label: 'Моё резюме', value: 'Активно', valueOk: true },
						{ icon: <Gift size={20} strokeWidth={1.8} />, label: 'Бонусы и вывод', value: '1 250 баллов' },
						{ icon: <Gem size={20} strokeWidth={1.8} />, label: 'PRO', value: '2 из 3 контактов' },
					]}
				/>
				<div style={{ marginTop: 12 }}>
					<EmptyState
						emoji='🗂'
						title='Компаний пока нет'
						text='Попробуйте другую сферу'
						action={<Button size='sm' variant='ink' onClick={() => setSheet(true)}>Открыть лист</Button>}
					/>
				</div>
			</Block>

			<Sheet open={sheet} onClose={() => setSheet(false)} title='Что публикуем?'>
				<div className='wk-stack'>
					<SheetOption
						icon={<BriefcaseBusiness size={22} strokeWidth={1.8} />}
						iconBg='var(--ink)'
						iconColor='#fff'
						title='Вакансия'
						subtitle='Ищу сотрудника в штат'
					/>
					<SheetOption
						icon={<FileText size={22} strokeWidth={1.8} />}
						title='Резюме'
						subtitle='Ищу постоянную работу'
					/>
				</div>
			</Sheet>
		</div>
	)
}
