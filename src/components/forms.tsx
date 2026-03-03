import { useStore } from '@tanstack/react-form'
import { Button, type ButtonProps } from '#/components/button'
import { Checkbox } from '#/components/checkbox'
import { Field, FieldError, FieldLabel } from '#/components/field'
import { Input, type InputProps } from '#/components/input'
import { InputPassword, type InputPasswordProps } from '#/components/input-password'
import { Label } from '#/components/label'
import { Select as SelectBase, SelectItem, SelectList } from '#/components/select'
import { SelectPopup, SelectTrigger, SelectValue } from '#/components/select'
import { Textarea, type TextareaProps } from '#/components/text-area'
import { useFieldContext, useFormContext } from '#/hooks/use-form'

export function CheckboxField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <div className='flex items-center gap-2'>
        <Checkbox
          id={field.name}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <Label htmlFor={field.name}>{label}</Label>
      </div>
      <FieldError match={field.state.meta.isTouched}>
        {errors.map((error) => (typeof error === 'string' ? error : error.message)).join(', ')}
      </FieldError>
    </Field>
  )
}

export function SubmitButton({ label, ...props }: ButtonProps & { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type='submit' disabled={isSubmitting} progress={isSubmitting} {...props}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

export function TextField({ label, ...props }: InputProps & { label: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FieldError match={field.state.meta.isTouched}>
        {errors.map((error) => (typeof error === 'string' ? error : error.message)).join(', ')}
      </FieldError>
    </Field>
  )
}

export function PasswordField({ label, ...props }: InputPasswordProps & { label: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputPassword
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FieldError match={field.state.meta.isTouched}>
        {errors.map((error) => (typeof error === 'string' ? error : error.message)).join(', ')}
      </FieldError>
    </Field>
  )
}

export function TextArea({ label, size = 'md', ...props }: TextareaProps & { label: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        id={field.name}
        size={size}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FieldError match={field.state.meta.isTouched}>
        {errors.map((error) => (typeof error === 'string' ? error : error.message)).join(', ')}
      </FieldError>
    </Field>
  )
}

interface FormSelectProps {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
}

export function Select({ label, placeholder, values }: FormSelectProps) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <SelectBase
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value as string)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectPopup>
          <SelectList>
            {values.map((value) => (
              <SelectItem key={value.value} value={value.value}>
                {value.label}
              </SelectItem>
            ))}
          </SelectList>
        </SelectPopup>
      </SelectBase>
      <FieldError match={field.state.meta.isTouched}>
        {errors.map((error) => (typeof error === 'string' ? error : error.message)).join(', ')}
      </FieldError>
    </Field>
  )
}
