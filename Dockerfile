# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
# Platform options: linux/amd64 or linux/arm64
# ARG PLATFORM=linux/amd64
ARG DISTROLESS_TAG=nonroot
ARG NODE_VERSION=24

# ------------------------------------------------------------------------------
# Base image with pnpm package manager.
# ------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-trixie-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_INTEGRITY_KEYS=0 DO_NOT_TRACK=1
ENV LEFTHOOK=0 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true PNPM_HOME="/pnpm"
ENV CI=true PATH="$PNPM_HOME:$PATH"

# Install and enable PNPM via corepack
RUN corepack enable && corepack prepare pnpm@latest-10 --activate

# Install system dependencies (optional tools for building and debugging)
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN --mount=target=/var/lib/apt/lists,type=cache,sharing=locked \
    --mount=target=/var/cache/apt,type=cache,sharing=locked \
    rm -f /etc/apt/apt.conf.d/docker-clean && apt-get update -y \
    && apt-get -yqq --no-install-recommends install build-essential curl \
       inotify-tools pkg-config libssl-dev git unzip ca-certificates jq \
    && update-ca-certificates

# Add tini for signal handling and zombie reaping
RUN set -eux; \
    TINI_DOWNLOAD_URL="https://github.com/krallin/tini/releases/download/v0.19.0" \
    ARCH="$(dpkg --print-architecture)"; \
    case "${ARCH}" in \
      amd64|x86_64) TINI_BIN_URL="${TINI_DOWNLOAD_URL}/tini" ;; \
      arm64|aarch64) TINI_BIN_URL="${TINI_DOWNLOAD_URL}/tini-arm64" ;; \
      *) echo "unsupported architecture: ${ARCH}"; exit 1 ;; \
    esac; \
    curl -fsSL "${TINI_BIN_URL}" -o /usr/bin/tini; \
    chmod +x /usr/bin/tini

WORKDIR /srv

# ------------------------------------------------------------------------------
# Install dependencies and build the application.
# ------------------------------------------------------------------------------
FROM base AS builder

# Copy the source files
COPY --chown=node:node . .

# Install dependencies and build the application.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install \
    --ignore-scripts --frozen-lockfile --stream \
    && pnpm exec tsc -b --noEmit --extendedDiagnostics \
    && NODE_ENV=production pnpm exec vite build

# ------------------------------------------------------------------------------
# Cleanup the builder stage and create necessary directories.
# ------------------------------------------------------------------------------
FROM base AS pruner

# Copy only necessary files from builder stage
COPY --from=builder /srv/.output /srv
COPY --from=builder /srv/resources/healthcheck.mjs /srv/server/healthcheck.mjs
COPY --from=builder /srv/resources/templates /srv/resources/templates

# Create necessary data directories
RUN mkdir -p /srv/storage/{backup,logs,uploads} && chmod -R 0775 /srv/storage

# Set permissions for the public directory and the server.js file.
RUN chmod -R 0775 /srv/public && chmod +x /srv/server/index.mjs

# ------------------------------------------------------------------------------
# Production image, copy build output files and run the application.
# ------------------------------------------------------------------------------
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian13:${DISTROLESS_TAG} AS runner

# Environment variable with default values
ARG APP_MODE=production
ARG APP_LOG_LEVEL=info
ARG APP_LOG_EXPANDED=false
ARG APP_LOG_TRANSPORT=console

# Read application environment variables
ARG APP_SECRET_KEY
ARG AUTH_PRIVATE_KEY
ARG AUTH_PUBLIC_KEY
ARG AUTH_SECRET_KEY
ARG AUTH_ACCESS_TOKEN_EXPIRY
ARG AUTH_REFRESH_TOKEN_EXPIRY
ARG AUTH_GITHUB_CLIENT_ID
ARG AUTH_GITHUB_CLIENT_SECRET
ARG AUTH_GOOGLE_CLIENT_ID
ARG AUTH_GOOGLE_CLIENT_SECRET
ARG DATABASE_AUTO_MIGRATE
ARG DATABASE_URL
ARG MAILER_FROM_EMAIL
ARG MAILER_FROM_NAME
ARG MAILER_SMTP_HOST
ARG MAILER_SMTP_PORT
ARG MAILER_SMTP_USERNAME
ARG MAILER_SMTP_PASSWORD
ARG MAILER_SMTP_SECURE
ARG PUBLIC_S3_ASSET_URL
ARG PUBLIC_TRUSTED_ORIGINS
ARG PUBLIC_IDENTIFIER
ARG PUBLIC_BASE_URL
ARG PUBLIC_SITE_DOMAIN
ARG PUBLIC_RATE_LIMIT_DEFAULT_MAX
ARG PUBLIC_RATE_LIMIT_DEFAULT_WINDOW
ARG STORAGE_MAX_UPLOAD_SIZE
ARG STORAGE_S3_ACCESS_KEY_ID
ARG STORAGE_S3_BUCKET_DEFAULT
ARG STORAGE_S3_ENDPOINT_URL
ARG STORAGE_S3_FORCE_PATH_STYLE
ARG STORAGE_S3_PATH_PREFIX
ARG STORAGE_S3_REGION
ARG STORAGE_S3_SECRET_ACCESS_KEY
ARG STORAGE_S3_SIGNED_URL_EXPIRES

# Copy the build output files and some necessary system utilities from previous stage.
# To enhance security, consider avoiding the copying of sysutils.
COPY --from=base /usr/bin/tini /usr/bin/tini
COPY --from=pruner --chown=nonroot:nonroot /srv /srv

# Define the host and port to listen on.
ENV PATH="/usr/bin:/usr/local/bin:/nodejs/bin:$PATH"
ARG HOST=0.0.0.0 PORT=3000 TZ=UTC
ENV HOST=$HOST PORT=$PORT TZ=$TZ
ENV TINI_SUBREAPER=true
ENV NODE_ENV=$APP_MODE

# Set Node.js options for better performance and memory management.
# @ref: https://www.akamas.io/resources/tuning-nodejs-v8-performance-efficiency
ARG NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=128"
ENV NODE_OPTIONS="$NODE_OPTIONS --no-warnings --disable-proto=delete"

WORKDIR /srv
USER nonroot:nonroot
EXPOSE $PORT/tcp

# Healthcheck to monitor application status
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD node server/healthcheck.mjs

# SHELL: /busybox/sh
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "--gc-interval=100", "--optimize-for-size", "server/index.mjs"]
