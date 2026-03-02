import type { LogLevelType } from 'loglayer'
import { env } from 'std-env'
import pkg from '~/package.json' with { type: 'json' }
import { ALLOW_LIST } from './constants'
import { setEnv, setEnvArray } from './helper'

export type AppMode = 'development' | 'production' | 'test'
export type AppLogLevel = LogLevelType | 'none'
export type AppLogTransport = 'console' | 'pretty-console' | 'file'

/**
 * Public environment variables, safe to expose to browser.
 * These variables are prefixed with `PUBLIC_` in the actual environment.
 */
export const publicEnv = {
  APP_MODE: setEnv<AppMode>(env.APP_MODE, 'production'),
  APP_LOG_LEVEL: setEnv<AppLogLevel>(env.APP_LOG_LEVEL, 'info'),
  PUBLIC_BASE_URL: setEnv(env.PUBLIC_BASE_URL, 'http://localhost:3000'),
  PUBLIC_SITE_DOMAIN: setEnv(env.PUBLIC_SITE_DOMAIN, 'example.com'),
  PUBLIC_CORS_ORIGINS: setEnvArray(env.PUBLIC_CORS_ORIGINS, ['*']),
  PUBLIC_DISABLE_SIGNUP: setEnv<boolean>(env.PUBLIC_DISABLE_SIGNUP, false),
  PUBLIC_IDENTIFIER: setEnv(env.PUBLIC_IDENTIFIER, pkg.name),
  PUBLIC_RATE_LIMIT_DEFAULT_MAX: setEnv(env.PUBLIC_RATE_LIMIT_DEFAULT_MAX, 100), // default 100 requests
  PUBLIC_RATE_LIMIT_DEFAULT_WINDOW: setEnv(env.PUBLIC_RATE_LIMIT_DEFAULT_WINDOW, 900) // default 15 minutes
}

/**
 * Protected environment variables (server only) and should not be exposed to browser.
 * These variables are NOT prefixed with `PUBLIC_` in the actual environment.
 * Generate application secret key: `openssl rand -base64 32`
 */
export const protectedEnv = {
  ...publicEnv,
  APP_LOG_EXPANDED: setEnv(env.APP_LOG_EXPANDED, false),
  APP_LOG_TRANSPORT: setEnv<AppLogTransport>(env.APP_LOG_TRANSPORT, 'console'),
  APP_SECRET_KEY: setEnv(env.APP_SECRET_KEY),
  AUTH_PRIVATE_KEY: setEnv(env.AUTH_PRIVATE_KEY),
  AUTH_PUBLIC_KEY: setEnv(env.AUTH_PUBLIC_KEY),
  AUTH_SECRET_KEY: setEnv(env.AUTH_SECRET_KEY),
  AUTH_ACCESS_TOKEN_EXPIRY: setEnv(env.AUTH_ACCESS_TOKEN_EXPIRY, 900), // default 15 minutes
  AUTH_REFRESH_TOKEN_EXPIRY: setEnv(env.AUTH_REFRESH_TOKEN_EXPIRY, 7200), // default 2 hours
  AUTH_GITHUB_CLIENT_ID: setEnv(env.AUTH_GITHUB_CLIENT_ID),
  AUTH_GITHUB_CLIENT_SECRET: setEnv(env.AUTH_GITHUB_CLIENT_SECRET),
  AUTH_GOOGLE_CLIENT_ID: setEnv(env.AUTH_GOOGLE_CLIENT_ID),
  AUTH_GOOGLE_CLIENT_SECRET: setEnv(env.AUTH_GOOGLE_CLIENT_SECRET),
  DATABASE_AUTO_MIGRATE: setEnv(env.DATABASE_AUTO_MIGRATE, false),
  DATABASE_URL: setEnv(env.DATABASE_URL),
  MAILER_FROM_EMAIL: setEnv(env.MAILER_FROM_EMAIL),
  MAILER_FROM_NAME: setEnv(env.MAILER_FROM_NAME),
  MAILER_SMTP_HOST: setEnv(env.MAILER_SMTP_HOST),
  MAILER_SMTP_PORT: setEnv(env.MAILER_SMTP_PORT, 1025),
  MAILER_SMTP_USERNAME: setEnv(env.MAILER_SMTP_USERNAME),
  MAILER_SMTP_PASSWORD: setEnv(env.MAILER_SMTP_PASSWORD),
  MAILER_SMTP_SECURE: setEnv(env.MAILER_SMTP_SECURE, false),
  STORAGE_S3_ACCESS_KEY_ID: setEnv(env.STORAGE_S3_ACCESS_KEY_ID),
  STORAGE_S3_SECRET_ACCESS_KEY: setEnv(env.STORAGE_S3_SECRET_ACCESS_KEY),
  STORAGE_S3_BUCKET_DEFAULT: setEnv(env.STORAGE_S3_BUCKET_DEFAULT),
  STORAGE_S3_FORCE_PATH_STYLE: setEnv(env.STORAGE_S3_FORCE_PATH_STYLE, false),
  STORAGE_S3_PATH_PREFIX: setEnv(env.STORAGE_S3_PATH_PREFIX, null),
  STORAGE_S3_ENDPOINT_URL: setEnv(env.STORAGE_S3_ENDPOINT_URL),
  STORAGE_S3_PUBLIC_URL: setEnv(env.STORAGE_S3_PUBLIC_URL),
  STORAGE_S3_REGION: setEnv(env.STORAGE_S3_REGION),
  STORAGE_S3_SIGNED_URL_EXPIRES: setEnv(env.STORAGE_S3_SIGNED_URL_EXPIRES, 3600), // default 1 hour
  STORAGE_MAX_UPLOAD_SIZE: setEnv(env.STORAGE_MAX_UPLOAD_SIZE, 1048576 * 5), // default 5MB
  STORAGE_ALLOWED_EXTENSIONS: ALLOW_LIST.fileExtensions, // Internal constant, can't be changed via env
  STORAGE_ALLOWED_MIME_TYPES: ALLOW_LIST.mimeTypes // Internal constant, can't be changed via env
  // Do it later when the application was completely functional
  // OTEL_ENABLE_TELEMETRY: setEnv(env.OTEL_ENABLE_TELEMETRY, false), // Enable OpenTelemetry
  // OTEL_EXPORTER_OTLP_ENDPOINT: setEnv(env.OTEL_EXPORTER_OTLP_ENDPOINT, 'http://localhost:4318'), // OpenTelemetry collector endpoint
  // OTEL_EXPORTER_OTLP_HEADERS: setEnv(env.OTEL_EXPORTER_OTLP_HEADERS, 'authorization='), // OpenTelemetry headers
  // OTEL_EXPORTER_OTLP_PROTOCOL: setEnv(env.OTEL_EXPORTER_OTLP_PROTOCOL, 'http/protobuf'), // OpenTelemetry protocol (e.g., "http/protobuf", "http/json")
  // OTEL_INSECURE_MODE: setEnv(env.OTEL_INSECURE_MODE, false), // OpenTelemetry insecure mode
  // OTEL_SERVICE_NAME: setEnv(env.OTEL_SERVICE_NAME, publicEnv.PUBLIC_IDENTIFIER) // OpenTelemetry service name
}
