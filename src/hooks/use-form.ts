import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { CheckboxField, PasswordField, Select, SubmitButton, TextArea, TextField } from '#/components/form'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, PasswordField, Select, TextArea, CheckboxField },
  formComponents: { SubmitButton },
  fieldContext,
  formContext
})
