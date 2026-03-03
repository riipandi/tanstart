import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { Select, TextArea, TextField } from '#/components/forms'
import { CheckboxField, PasswordField, SubmitButton } from '#/components/forms'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, PasswordField, Select, TextArea, CheckboxField },
  formComponents: { SubmitButton },
  fieldContext,
  formContext
})
