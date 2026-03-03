import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { Alert } from '#/components/alert'
import { Button } from '#/components/button'
import { Card, CardBody, CardDescription, CardTitle } from '#/components/card'
import { CardFooter, CardHeader } from '#/components/card'
import { Field, FieldError, FieldLabel } from '#/components/field'
import { Form } from '#/components/form'
import { Input } from '#/components/input'
import { Link } from '#/components/link'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { getSafeRedirect } from '#/utils/redirect'

export const Route = createFileRoute('/(auth)/two-factor/')({
  component: RouteComponent,
  // beforeLoad: async () => {
  //   const session = await getSession()
  //   if (!session) {
  //     throw redirect({ to: '/signin' })
  //   }
  //   return { session }
  // },
  validateSearch: z.object({
    redirect: z.string().optional()
  })
})

const totpSchema = z.object({
  code: z.string().length(6, { error: 'Code must be 6 digits' }),
  trustDevice: z.boolean()
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const safeRedirect = getSafeRedirect(search.redirect)

  const form = useAppForm({
    defaultValues: { code: '', trustDevice: false },
    validators: { onChange: totpSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      setIsVerifying(true)

      try {
        const result = await authClient.twoFactor.verifyTotp({ ...value })

        if (result.error) {
          setError(result.error.message || 'Invalid code')
          return
        }

        navigate({ to: safeRedirect })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setIsVerifying(false)
      }
    }
  })

  const handleSendOtp = async () => {
    try {
      const result = await authClient.twoFactor.sendOtp()
      if (result.error) {
        setError(result.error.message || 'Failed to send OTP')
      } else {
        navigate({ to: '/two-factor/otp', search: { redirect: safeRedirect } })
      }
    } catch (err) {
      console.error(err)
      setError('Failed to send OTP')
    }
  }

  return (
    <div className='w-full max-w-md space-y-6 p-8'>
      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription className='text-sm'>
            Enter the code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Activity mode={error ? 'visible' : 'hidden'}>
            <Alert variant='danger' className='mb-6'>
              {error}
            </Alert>
          </Activity>

          <Form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className='grid gap-4'
          >
            <form.AppField
              name='code'
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.length !== 6) {
                    return 'Please enter a valid 6-digit code'
                  }
                  if (!/^\d+$/.test(value)) {
                    return 'Code must contain only numbers'
                  }
                  return undefined
                }
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Verification Code</FieldLabel>
                  <Input
                    id={field.name}
                    type='text'
                    inputMode='numeric'
                    maxLength={6}
                    autoComplete='one-time-code'
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    onBlur={field.handleBlur}
                    className='text-center text-2xl tracking-[0.5em]'
                    placeholder='000000'
                  />
                  <FieldError match={field.state.meta.errors.length > 0}>
                    {field.state.meta.errors
                      .map((error) => (typeof error === 'string' ? error : error?.message))
                      .join(', ')}
                  </FieldError>
                </Field>
              )}
            </form.AppField>

            <form.AppField name='trustDevice'>
              {(field) => <field.CheckboxField label='Trust this device' />}
            </form.AppField>

            <form.AppForm>
              <form.SubmitButton label={isVerifying ? 'Verifying...' : 'Verify'} />
            </form.AppForm>
          </Form>
        </CardBody>
        <CardFooter className='flex flex-col items-center justify-center gap-4 text-center'>
          <Button variant='ghost' onClick={handleSendOtp} block>
            Use email verification instead
          </Button>
        </CardFooter>
      </Card>

      <div className='w-full min-w-sm text-center'>
        <Link render={<RouterLink to='/signin' />}>Back to Sign In</Link>
      </div>
    </div>
  )
}
