import { useStore } from '@tanstack/react-form'
import { useFieldContext, useFormContext } from '#/hooks/use-form'

export function CheckboxField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className='flex items-center gap-2'>
      <input
        type='checkbox'
        id={field.name}
        checked={field.state.value}
        onChange={(e) => field.handleChange(e.target.checked)}
        onBlur={field.handleBlur}
        className='border-border-neutral text-foreground-primary focus:ring-border-primary h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2'
      />
      <label htmlFor={field.name} className='text-foreground-neutral text-sm'>
        {label}
      </label>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

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
          className='text-foreground-critical mt-1.5 text-sm font-medium'
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
      <label htmlFor={label} className='text-foreground-neutral mb-1.5 block text-sm font-medium'>
        {label}
        <input
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none'
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
      <label htmlFor={label} className='text-foreground-neutral mb-1.5 block text-sm font-medium'>
        {label}
        <input
          type='password'
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none'
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
      <label htmlFor={label} className='text-foreground-neutral mb-1.5 block text-sm font-medium'>
        {label}
        <textarea
          value={field.state.value}
          onBlur={field.handleBlur}
          rows={rows}
          onChange={(e) => field.handleChange(e.target.value)}
          className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none'
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
      <label htmlFor={label} className='text-foreground-neutral mb-1.5 block text-sm font-medium'>
        {label}
      </label>
      <select
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none'
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
