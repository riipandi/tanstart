# Better Start

[![Release](https://img.shields.io/github/v/release/riipandi/better-start?logo=tanstack&color=orange)](https://github.com/riipandi/better-start/releases)
[![Languages](https://img.shields.io/github/languages/top/riipandi/better-start)](https://github.com/riipandi/better-start)
[![Test](https://github.com/riipandi/better-start/actions/workflows/test.yml/badge.svg)](https://github.com/riipandi/better-start/actions/workflows/test.yml)
[![Contribution](https://badgen.net/badge/icon/Contributions%20Welcome?icon=bitcoin-lightning&label&color=black&labelColor=black)](https://github.com/riipandi/better-start/pulse)

Better Start is a robust SaaS starter kit designed to boost developer productivity. Built with React, 
TanStack Start, TypeScript, Kysely, and Better Auth this boilerplate offers a solid foundation for modern
web applications. It comes pre-configured with authentication, user invitation functionality, and admin
capabilities. While LibSQL (SQLite compatible) is the default database, developers can easily switch to
any database [supported by Kysely][kysely-dialects]. The project embraces minimalism by not including
a UI kit, but it's set up with Tailwind CSS for flexible styling. Docker configuration is included for
easy deployment, with the option to deploy to Vercel or other edge platforms.

Unit testing with Vitest and E2E testing are provided out of the box. Code formatting and linting are
handled by Oxlint and Oxfmt This starter kit empowers developers to quickly launch and scale their
SaaS products with best practices and essential features ready to go.

## What's in the stack?

- [TanStack Start](https://tanstack.com/start) the full-stack framework powered by TanStack Router
- [TypeScript][typescript] for static type checking
- [Kysely](https://kysely.dev/) for type-safe database queries
- [Better Auth](https://better-auth.com/) for authentication and authorization
- [PostgreSQL](https://www.postgresql.org/) as the default database (easily switchable)
- [Tailwind CSS][tailwindcss] for flexible styling
- Deploy to [Fly.io](https://fly.io) using [Docker][docker] container (easy to switch to other edge platforms)
- Ready for multi-tenant (multiple subdomains with a single codebase)
- Healthcheck endpoint for [Fly backups region fallbacks][fly-io]
- Custom [Express][expressjs] server for production
- Styling with [Tailwind CSS][tailwindcss], [clsx][clsx], and [tailwind-merge][tailwind-merge]
- Code formatting and linting with [Oxlint][oxlint] and [Oxfmt][oxfmt]
- Unit testing with [Vitest][vitest]
- E2E testing with [Playwright][playwright]

## 🏁 Quickstart

```sh
pnpm dlx tiged riipandi/blueprint-nitrojs my-app
```

To get started with setting up this project, refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for step-by-step instructions.

## 👷‍♂️ Contributions

Contributions are welcome! Please open a pull requests for your changes and tickets
in case you would like to discuss something or have a question.

## ✨ Implemented Features

- [ ] Authentication and Authorization
    - [ ] Sign in
        - [ ] Email and password
        - [ ] Username and password
        - [ ] Magic link
        - [ ] Passkey
        - [ ] Social provider (Google, GitHub, etc)
        - [ ] Account Recovery (forgot password)
        - [ ] Remember me
    - [ ] Sign up
        - [ ] Email, username and password
        - [ ] Social provider (Google, GitHub, etc)
        - [ ] Account verification via email
    - [ ] Two Factor Authentication (2FA)
        - [ ] Using TOTP (Google Authenticator, Authy, etc)
        - [ ] OTP Code via email
    - [ ] Session management
    - [ ] Role-based access control (RBAC)
    - [ ] Impersonation (login as another user)
    - [ ] JWT/JWKS authentication
- [ ] Account Management
    - [ ] Update user profile (name, username, email)
    - [ ] Update user password
    - [ ] Update user avatar
    - [ ] Delete user account
- [ ] Organization Management
    - [ ] User invitation
    - [ ] Create organization
    - [ ] Update organization
    - [ ] Delete organization
- [ ] Better logging integration
- [ ] Roles and Permissions management
- [ ] Using S3 for file storage (avatar, etc)
- [ ] Automatic Kysely database migrations
- [ ] Deployment via Docker container

## 🙏 Thanks to...

In general, I'd like to thank every single one who open-sources their source code for their
effort to contribute something to the open-source community. Your work means the world! 🌍 ❤️

## 📝 License

Licensed under either of [Apache License 2.0][license-apache] or [MIT license][license-mit] at your option.

> Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this project by you,
> as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

Copyrights in this project are retained by their contributors.

See the [LICENSE-APACHE](./LICENSE-APACHE) and [LICENSE-MIT](./LICENSE-MIT) files for more information.

---

<sub>🤫 Psst! If you like my work you can support me via [GitHub sponsors](https://github.com/sponsors/riipandi).</sub>

[![Made by](https://badgen.net/badge/icon/Aris%20Ripandi?label=Made+by&color=black&labelColor=black)][riipandi-x]

<!-- link reference definition -->
[clsx]: https://www.npmjs.com/package/clsx
[docker]: https://docs.docker.com/engine/install
[expressjs]: https://expressjs.com/
[fly-io]: https://fly.io/docs/reference/configuration/#services-http_checks
[kysely-dialects]: https://www.kysely.dev/docs/dialects
[license-apache]: https://choosealicense.com/licenses/apache-2.0/
[license-mit]: https://choosealicense.com/licenses/mit/
[playwright]: https://playwright.dev
[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
[tailwind-merge]: https://www.npmjs.com/package/tailwind-merge
[tailwindcss]: https://tailwindcss.com
[typescript]: https://typescriptlang.org
[vitest]: https://vitest.dev
[oxlint]: https://oxc.rs/docs/guide/usage/linter
[oxfmt]: https://oxc.rs/docs/guide/usage/formatter
