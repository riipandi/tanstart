import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { Alert } from '#/components/alert'
import { Card, CardBody, CardDescription, CardTitle } from '#/components/card'
import { CardFooter, CardHeader } from '#/components/card'
import { Form } from '#/components/form'
import { Link } from '#/components/link'
import { Separator } from '#/components/separator'
import { publicEnv } from '#/config'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { SignInWithSocialProvider } from './-social-buttons'

interface SearchParams {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent,
  loader: () => {
    return { disableSignUp: publicEnv.PUBLIC_DISABLE_SIGNUP }
  },
  validateSearch: z.object({
    logout: z.union([z.string(), z.boolean()]).optional(),
    redirect: z.string().optional()
  })
})

const signinSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
  rememberMe: z.boolean()
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const search: SearchParams = Route.useSearch()
  const { isPending } = authClient.useSession()
  const [error, setError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '', password: '', rememberMe: false },
    validators: { onChangeAsync: signinSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        const result = await authClient.signIn.email({ ...value })

        if (result.error) {
          setError(result.error.message || 'Sign in failed')
          return formApi.resetField('password')
        }

        return result.data.url
          ? navigate({ href: result.data.url })
          : navigate({ to: search.redirect || '/dashboard' })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      }
    }
  })

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  if (isPending) {
    return (
      <div className='flex items-center justify-center py-10'>
        <div className='border-border-neutral-faded border-t-foreground-neutral h-5 w-5 animate-spin rounded-full border-2' />
      </div>
    )
  }

  return (
    <div className='w-full max-w-md space-y-6 p-8'>
      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription className='text-sm'>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Activity mode={error ? 'visible' : 'hidden'}>
            <div className='mb-6'>{error ? <Alert variant='danger'>{error}</Alert> : null}</div>
          </Activity>

          <SignInWithSocialProvider
            authClient={authClient}
            callbackURL={search.redirect || '/dashboard'}
          />

          <Separator className='my-8' contentSide='center'>
            Or, continue with
          </Separator>

          <Form onSubmit={handleSubmit} className='-mt-2 grid gap-4'>
            <form.AppField
              name='email'
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Email is required'
                  }
                  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                    return 'Invalid email address'
                  }
                  return undefined
                }
              }}
            >
              {(field) => <field.TextField label='Email' />}
            </form.AppField>

            <form.AppField
              name='password'
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Password is required'
                  }
                  return undefined
                }
              }}
            >
              {(field) => <field.PasswordField label='Password' />}
            </form.AppField>

            <div className='flex items-center justify-between'>
              <form.AppField name='rememberMe'>
                {(field) => <field.CheckboxField label='Remember me' />}
              </form.AppField>

              <Link render={<RouterLink to='/forgot-password' />}>Forgot password?</Link>
            </div>

            <form.AppForm>
              <form.SubmitButton label='Sign In' />
            </form.AppForm>
          </Form>
        </CardBody>
        <CardFooter className='debug w-full items-center justify-center text-center'>
          <Activity mode={loaderData.disableSignUp ? 'hidden' : 'visible'}>
            <Link render={<RouterLink to='/signup' />}>Don't have an account? Sign up</Link>
          </Activity>
        </CardFooter>
      </Card>
    </div>
  )
}
