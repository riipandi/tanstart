import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const { isPending } = authClient.useSession()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isPending) {
    return (
      <div className='flex items-center justify-center py-10'>
        <div className='h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100' />
      </div>
    )
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email,
          password,
          name
        })
        if (result.error) {
          setError(result.error.message || 'Sign up failed')
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password
        })
        if (result.error) {
          setError(result.error.message || 'Sign in failed')
        }
        return navigate({ to: '/dashboard' })
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md p-6'>
        <h1 className='text-lg leading-none font-semibold tracking-tight'>
          {isSignUp ? 'Create an account' : 'Sign in'}
        </h1>
        <p className='mt-2 mb-6 text-sm text-neutral-500 dark:text-neutral-400'>
          {isSignUp
            ? 'Enter your information to create an account'
            : 'Enter your email below to login to your account'}
        </p>

        <form onSubmit={handleSubmit} className='grid gap-4'>
          {isSignUp && (
            <div className='grid gap-2'>
              <label htmlFor='name' className='text-sm leading-none font-medium'>
                Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='flex h-9 w-full border border-neutral-300 bg-transparent px-3 text-sm focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:focus:border-neutral-100'
                required
              />
            </div>
          )}

          <div className='grid gap-2'>
            <label htmlFor='email' className='text-sm leading-none font-medium'>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='flex h-9 w-full border border-neutral-300 bg-transparent px-3 text-sm focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:focus:border-neutral-100'
              required
            />
          </div>

          <div className='grid gap-2'>
            <label htmlFor='password' className='text-sm leading-none font-medium'>
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='flex h-9 w-full border border-neutral-300 bg-transparent px-3 text-sm focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:focus:border-neutral-100'
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className='border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='h-9 w-full bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200'
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-white dark:border-neutral-600 dark:border-t-neutral-900' />
                <span>Please wait</span>
              </span>
            ) : isSignUp ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className='mt-4 text-center'>
          <button
            type='button'
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className='text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <p className='mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500'>
          Built with{' '}
          <a
            href='https://better-auth.com'
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium hover:text-neutral-600 dark:hover:text-neutral-300'
          >
            BETTER-AUTH
          </a>
          .
        </p>
      </div>
    </div>
  )
}
