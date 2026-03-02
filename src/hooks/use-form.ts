import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { PasswordField, Select, SubmitButton, TextArea, TextField } from '#/components/form'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, PasswordField, Select, TextArea },
  formComponents: { SubmitButton },
  fieldContext,
  formContext
})
