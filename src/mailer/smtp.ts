/**
 * SMTP Mailer Module
 *
 * Provides email sending functionality via SMTP transport with template rendering support.
 * @module mailer/smtp
 */

import { createMessage } from '@upyo/core'
import { SmtpTransport } from '@upyo/smtp'
import { convert } from 'html-to-text'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { protectedEnv } from '#/config'

const smtpUsername = protectedEnv.MAILER_SMTP_USERNAME
const smtpPassword = protectedEnv.MAILER_SMTP_PASSWORD
const hasValidAuth =
  typeof smtpUsername === 'string' &&
  smtpUsername.trim() !== '' &&
  typeof smtpPassword === 'string' &&
  smtpPassword.trim() !== ''

/**
 * SMTP Transport instance for sending emails.
 * Configured using environment variables from protectedEnv.
 */
const smtpTransport = new SmtpTransport({
  host: protectedEnv.MAILER_SMTP_HOST,
  port: protectedEnv.MAILER_SMTP_PORT,
  secure: protectedEnv.MAILER_SMTP_SECURE,
  auth: hasValidAuth
    ? {
        user: smtpUsername,
        pass: smtpPassword,
        method: 'plain'
      }
    : undefined
})

const TEMPLATES_DIR = join(process.cwd(), 'resources/templates')
const templateCache = new Map<string, string>()

/**
 * Template variables for email rendering.
 * Keys correspond to placeholder names in templates (e.g., {{email}}).
 */
export interface TemplateVars {
  [key: string]: string | number
}

/**
 * Email payload with raw HTML content.
 * Use this when you want to send pre-rendered HTML directly.
 */
export interface EmailPayload {
  /** Recipient email address */
  to: string
  /** Email subject line */
  subject: string
  /** HTML content of the email */
  html: string
  /** Optional plain text version (auto-generated from HTML if not provided) */
  text?: string
}

/**
 * Email payload using a template file.
 * The template will be rendered with the provided variables.
 */
export interface TemplateEmailPayload {
  /** Recipient email address */
  to: string
  /** Email subject line */
  subject: string
  /** Template filename (without extension) from resources/templates */
  template: string
  /** Variables to replace in the template (e.g., { email: 'user@example.com' } replaces {{email}}) */
  vars: TemplateVars
  /** Optional plain text version (auto-generated from HTML if not provided) */
  text?: string
}

/**
 * Error thrown when email sending fails.
 */
export class MailSendError extends Error {
  public override cause?: Error

  /**
   * Creates a MailSendError instance.
   * @param message - Error message describing the failure
   * @param cause - Optional underlying error that caused this failure
   */
  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'MailSendError'
    this.cause = cause
  }
}

/**
 * Error thrown when template rendering fails.
 */
export class TemplateRenderError extends Error {
  /**
   * Creates a TemplateRenderError instance.
   * @param templateName - Name of the template that failed to render
   * @param cause - Optional underlying error
   */
  constructor(templateName: string, cause?: Error) {
    super(`Failed to render template "${templateName}"`)
    this.name = 'TemplateRenderError'
    this.cause = cause
  }
}

/**
 * Error thrown when email payload validation fails.
 */
export class ValidationError extends Error {
  /**
   * Creates a ValidationError instance.
   * @param message - Description of the validation failure
   */
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Renders an HTML email template with the provided variables.
 * Templates are cached in memory after first read for performance.
 *
 * @param templateName - Name of the template file (without .html extension)
 * @param vars - Key-value pairs to replace in the template (e.g., {{email}} -> user@example.com)
 * @returns Rendered HTML string with variables replaced
 * @throws {TemplateRenderError} If template file cannot be read
 *
 * @example
 * const html = renderTemplate('password-reset', { email: 'user@example.com', resetLink: 'https://...' })
 */
function renderTemplate(templateName: string, vars: TemplateVars): string {
  let html = templateCache.get(templateName)

  if (!html) {
    const templatePath = join(TEMPLATES_DIR, `${templateName}.html`)
    try {
      html = readFileSync(templatePath, 'utf-8')
      templateCache.set(templateName, html)
    } catch (error) {
      throw new TemplateRenderError(templateName, error instanceof Error ? error : undefined)
    }
  }

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    html = html.replace(regex, String(value))
  }

  return html
}

/**
 * Clears the template cache.
 * Useful for development when templates are being modified.
 */
export function clearTemplateCache(): void {
  templateCache.clear()
}

/**
 * Validates email payload before sending.
 * @param payload - The email payload to validate
 * @throws {ValidationError} If required fields are missing or invalid
 */
function validateEmailPayload(payload: EmailPayload | TemplateEmailPayload): void {
  if (!payload.to || typeof payload.to !== 'string') {
    throw new ValidationError('Recipient email is required')
  }
  if (!payload.subject || typeof payload.subject !== 'string') {
    throw new ValidationError('Email subject is required')
  }
}

/**
 * Sends an email via SMTP.
 *
 * @param payload - Either an EmailPayload with raw HTML or a TemplateEmailPayload using templates
 * @returns The message ID from the SMTP server on success
 * @throws {ValidationError} If payload validation fails
 * @throws {TemplateRenderError} If template rendering fails
 * @throws {MailSendError} If SMTP transmission fails
 *
 * @example
 * // Using template
 * await sendMail({
 *   to: 'user@example.com',
 *   subject: 'Reset Password',
 *   template: 'password-reset',
 *   vars: { email: 'user@example.com', resetLink: 'https://...' }
 * })
 *
 * @example
 * // Using raw HTML
 * await sendMail({
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   html: '<h1>Hello World</h1>'
 * })
 */
async function sendMail(payload: EmailPayload | TemplateEmailPayload): Promise<string> {
  validateEmailPayload(payload)

  const senderName = protectedEnv.MAILER_FROM_NAME
  const senderEmail = protectedEnv.MAILER_FROM_EMAIL
  const mailFrom = `${senderName} <${senderEmail}>`

  const html = 'template' in payload ? renderTemplate(payload.template, payload.vars) : payload.html
  const text = 'text' in payload ? payload.text : convert(html, { wordwrap: 80 })

  const message = createMessage({
    from: mailFrom,
    to: payload.to,
    subject: payload.subject,
    content: { html, text }
  })

  try {
    const receipt = await smtpTransport.send(message)

    if (!receipt.successful) {
      const err = new Error(
        (receipt.errorMessages ?? []).join('; ') || 'SMTP transport reported failure'
      )
      throw new MailSendError('Failed to send email via SMTP transport', err)
    }

    if (!receipt.messageId) {
      throw new MailSendError('SMTP did not return a messageId', undefined)
    }

    return receipt.messageId
  } catch (err: unknown) {
    if (err instanceof MailSendError || err instanceof ValidationError) throw err
    const message = err instanceof Error ? err.message : 'Unknown SMTP send error'
    throw new MailSendError(message, err instanceof Error ? err : undefined)
  }
}

/**
 * Closes all SMTP connections gracefully.
 * Called automatically on process exit signals.
 */
async function closeSmtpConnection(): Promise<void> {
  try {
    await smtpTransport.closeAllConnections()
  } catch {
    // ignore close errors
  }
}

process.on('beforeExit', closeSmtpConnection)
process.on('SIGINT', closeSmtpConnection)
process.on('SIGTERM', closeSmtpConnection)

export { smtpTransport, sendMail }
