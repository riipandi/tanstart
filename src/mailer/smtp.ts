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

/** Template variables for email rendering */
export interface TemplateVars {
  [key: string]: string | number
}

/** Email payload with raw HTML content */
export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

/** Email payload using template file */
export interface TemplateEmailPayload {
  to: string
  subject: string
  template: string
  vars: TemplateVars
  text?: string
}

/** Render HTML template from `resources/templates` directory */
export function renderTemplate(templateName: string, vars: TemplateVars): string {
  const templatesDir = join(process.cwd(), 'resources/templates')
  const templatePath = join(templatesDir, `${templateName}.html`)

  try {
    let html = readFileSync(templatePath, 'utf-8')

    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, String(value))
    }

    return html
  } catch (error) {
    throw new Error(`Failed to render template "${templateName}": ${error}`)
  }
}

/** Error thrown when email sending fails */
class MailSendError extends Error {
  public override cause?: Error
  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'MailSendError'
    this.cause = cause
  }
}

/** Send email via SMTP. Returns message ID on success */
async function sendMail(payload: EmailPayload | TemplateEmailPayload): Promise<string> {
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
  } catch (err: any) {
    if (err instanceof MailSendError) throw err
    throw new MailSendError(err?.message ?? 'SMTP send error', err)
  } finally {
    try {
      await smtpTransport.closeAllConnections()
    } catch {
      // ignore close errors
    }
  }
}

export { smtpTransport, sendMail }
