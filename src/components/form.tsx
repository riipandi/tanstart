import { useStore } from '@tanstack/react-form'
import { useFieldContext, useFormContext } from '#/hooks/use-form'

export function SubmitButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-background-primary hover:bg-background-primary/80 focus:ring-border-primary rounded-md px-6 py-2 text-white transition-colors focus:ring-2 focus:outline-none disabled:opacity-50'
        >
          {label}
        </button>
      )}
    </form.Subscribe>
  )
}

function ErrorMessages({ errors }: { errors: Array<string | { message: string }> }) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className='text-foreground-critical mt-1 font-bold'
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function TextField({ label, placeholder }: { label: string; placeholder?: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <label htmlFor={label} className='mb-1 block text-xl font-bold'>
        {label}
        <input
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className='border-border-neutral focus:ring-border-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none'
        />
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function PasswordField({ label, placeholder }: { label: string; placeholder?: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <label htmlFor={label} className='mb-1 block text-xl font-bold'>
        {label}
        <input
          type='password'
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className='border-border-neutral focus:ring-border-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none'
        />
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function TextArea({ label, rows = 3 }: { label: string; rows?: number }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <label htmlFor={label} className='mb-1 block text-xl font-bold'>
        {label}
        <textarea
          value={field.state.value}
          onBlur={field.handleBlur}
          rows={rows}
          onChange={(e) => field.handleChange(e.target.value)}
          className='border-border-neutral focus:ring-border-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none'
        />
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Select({
  label,
  values
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <label htmlFor={label} className='mb-1 block text-xl font-bold'>
        {label}
      </label>
      <select
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className='border-border-neutral focus:ring-border-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none'
      >
        {values.map((value) => (
          <option key={value.value} value={value.value}>
            {value.label}
          </option>
        ))}
      </select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
