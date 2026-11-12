export const FormField = ({ label, children, error, hint }: any) => (
	<div className='wk-field text-left' data-error={error ? 'true' : undefined}>
		{label && <label className='wk-label'>{label}</label>}
		{children}
		{error ? (
			<p className='wk-error'>{error}</p>
		) : hint ? (
			<p className='wk-hint'>{hint}</p>
		) : null}
	</div>
)

/** Класс поля ввода по дизайну; с ошибкой — красная рамка */
export const inputCls = (error?: unknown) =>
	error ? 'wk-input is-error' : 'wk-input'
