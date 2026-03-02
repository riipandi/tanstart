import { z } from 'zod'
import { useAppForm } from '#/hooks/use-form'

const passwordSchema = z.object({
  password: z.string().min(1, { error: 'Password is required' })
})

interface TwoFactorDisableProps {
  isVerifying: boolean
  onDisable: (password: string) => Promise<any>
  onCancel: () => void
}

export function TwoFactorDisable({ isVerifying, onDisable, onCancel }: TwoFactorDisableProps) {
  const disableForm = useAppForm({
    defaultValues: { password: '' },
    validators: { onChange: passwordSchema },
    onSubmit: async ({ value }) => {
      await onDisable(value.password)
    }
  })

  return (
    <div className='border-border-neutral bg-background-elevation-base rounded-md border p-4'>
      <h3 className='mb-3 text-sm font-semibold'>Confirm Password to Disable</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          disableForm.handleSubmit()
        }}
      >
        <disableForm.AppField
          name='password'
          validators={{
            onBlur: ({ value }) => {
              if (!value || value.length === 0) {
                return 'Password is required'
              }
              return undefined
            }
          }}
        >
          {(field) => <field.PasswordField label='Password' />}
        </disableForm.AppField>
        <div className='mt-4 flex gap-2'>
          <disableForm.AppForm>
            <disableForm.SubmitButton label={isVerifying ? 'Disabling...' : 'Disable 2FA'} />
          </disableForm.AppForm>
          <button
            type='button'
            onClick={onCancel}
            className='border-border-neutral text-foreground-neutral hover:bg-background-neutral-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
