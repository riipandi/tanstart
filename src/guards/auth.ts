/**
 * Better Auth configuration.
 *
 * @see: https://better-auth.com/docs/concepts/database#programmatic-migrations
 * @see: https://better-auth.com/docs/concepts/database#extending-core-schema
 * @see: https://better-auth.com/docs/concepts/session-management#customizing-session-response
 */

import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { twoFactor, emailOTP } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { typeid } from 'typeid-js'
import { protectedEnv } from '#/config'
import { db } from '#/database/db-client'
import { sendMail } from '#/libraries/mailer'
import { passwordHash, passwordVerify } from '#/utils/crypto'

export const authOptions = {
  database: {
    db,
    type: 'postgres',
    transaction: true,
    debugLogs: false,
    casing: 'snake'
  },
  baseURL: protectedEnv.PUBLIC_BASE_URL,
  secret: protectedEnv.AUTH_SECRET_KEY,
  appName: protectedEnv.PUBLIC_IDENTIFIER, // It'll be used as an issuer for 2FA.
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    disableSignUp: protectedEnv.PUBLIC_DISABLE_SIGNUP,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: async (password) => await passwordHash(password, { algo: 'scrypt' }),
      verify: async ({ password, hash }) => await passwordVerify(password, hash)
    },
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: 'Password Reset Instruction',
        template: 'password-reset',
        vars: {
          email: user.email,
          resetLink: url
        }
      })
    },
    // onExistingUserSignUp: async ({ user }) => {
    //   await sendMail({
    //     to: user.email,
    //     subject: 'Sign-up attempt with your email',
    //     template: 'email-existing-user',
    //     vars: { email: user.email }
    //   })
    // },
    onPasswordReset: async ({ user }) => {
      await sendMail({
        to: user.email,
        subject: 'Your Password Has Been Reset',
        template: 'password-reset-confirmation',
        vars: { email: user.email }
      })
    }
  },
  emailVerification: {
    expiresIn: 3600,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        template: 'email-verification',
        vars: {
          email: user.email,
          verificationLink: url
        }
      })
    }
  },
  socialProviders: {
    github: {
      clientId: protectedEnv.AUTH_GITHUB_CLIENT_ID,
      clientSecret: protectedEnv.AUTH_GITHUB_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          firstName: profile.name.split(' ')[0],
          lastName: profile.name.split(' ')[1]
        }
      }
    },
    google: {
      prompt: 'select_account',
      clientId: protectedEnv.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: protectedEnv.AUTH_GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          firstName: profile.given_name,
          lastName: profile.family_name
        }
      }
    }
  },
  session: {
    storeSessionInDatabase: true,
    preserveSessionInDatabase: true,
    expiresIn: 86400 * 7, // 7 days
    updateAge: 86400 * 1 // 1 day (every 1 day the session expiration is updated)
  },
  account: {
    storeStateStrategy: 'database',
    storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
    accountLinking: { enabled: true, trustedProviders: ['google', 'github'] }
  },
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: true,
        fieldName: 'first_name'
      },
      lastName: {
        type: 'string',
        required: true,
        fieldName: 'last_name'
      }
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url, newEmail }) => {
        await sendMail({
          to: newEmail,
          subject: 'Confirm Your Email Change',
          template: 'email-change-request',
          vars: {
            newEmail: newEmail,
            oldEmail: user?.email ?? '',
            confirmationLink: url
          }
        })
      }
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        // Create cancel link that redirects back to account page
        const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000'
        const cancelLink = `${baseUrl}/account?deleteCancelled=true`

        await sendMail({
          to: user.email,
          subject: 'Confirm Account Deletion',
          template: 'delete-account',
          vars: {
            email: user.email,
            deleteLink: url,
            cancelLink: cancelLink
          }
        })
      }
    }
  },
  rateLimit: {
    storage: 'database',
    enabled: protectedEnv.APP_MODE === 'production',
    max: protectedEnv.PUBLIC_RATE_LIMIT_DEFAULT_MAX, // max requests in the window
    window: protectedEnv.PUBLIC_RATE_LIMIT_DEFAULT_WINDOW, // time window in seconds
    customRules: {
      '/get-session': false,
      '/sign-in/email': { window: 10, max: 3 }
    }
  },
  advanced: {
    cookiePrefix: protectedEnv.PUBLIC_IDENTIFIER,
    useSecureCookies: protectedEnv.APP_MODE === 'production',
    crossSubDomainCookies: {
      enabled: protectedEnv.APP_MODE === 'production',
      domain: protectedEnv.PUBLIC_SITE_DOMAIN
    },
    database: {
      generateId: (opts) => {
        // Let database auto-generate for specific models
        if (opts.model === 'user') {
          return typeid('user').toString()
        }
        if (opts.model === 'account') {
          return typeid('acc').toString()
        }
        if (opts.model === 'session') {
          return typeid('sess').toString()
        }
        // Generate UUIDs for other tables
        return typeid().toUUID()
      }
    }
  },
  plugins: [
    tanstackStartCookies(),
    twoFactor({
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendMail({
            to: user.email,
            subject: 'Your 2FA Verification Code',
            template: 'otp-verification',
            vars: { otp }
          })
        }
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === 'sign-in'
            ? 'Your Sign-In Verification Code'
            : type === 'email-verification'
              ? 'Verify Your Email'
              : 'Reset Your Password'

        await sendMail({
          to: email,
          subject: subject,
          template: 'otp-verification',
          vars: { otp }
        })
      }
    })
  ]
} satisfies BetterAuthOptions

export const auth = betterAuth(authOptions)

export type Session = typeof auth.$Infer.Session
