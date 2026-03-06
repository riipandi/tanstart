# Better Start

[![Release](https://img.shields.io/github/v/release/riipandi/better-start?logo=tanstack&color=orange)](https://github.com/riipandi/better-start/releases)
[![Languages](https://img.shields.io/github/languages/top/riipandi/better-start)](https://github.com/riipandi/better-start)
[![Contribution](https://badgen.net/badge/icon/Contributions%20Welcome?icon=bitcoin-lightning&label&color=black&labelColor=black)](https://github.com/riipandi/better-start/pulse)
<!-- [![Test](https://github.com/riipandi/better-start/actions/workflows/test.yml/badge.svg)](https://github.com/riipandi/better-start/actions/workflows/test.yml) -->

Better Start is a robust SaaS starter kit designed to boost developer productivity. Built with React,
TanStack Start, TypeScript, Kysely, and Better Auth this boilerplate offers a solid foundation for modern
web applications. It comes pre-configured with authentication, user invitation functionality, and admin
capabilities. Docker configuration is included for easy deployment, with the option to deploy to
[Fly.io][fly-io] or other edge platforms.

Unit testing with Vitest and E2E testing are provided out of the box. Code formatting and linting are
handled by [Oxlint][oxlint] and [Oxfmt][oxfmt] This starter kit empowers developers to quickly launch
and scale their SaaS products with best practices and essential features ready to go.

## What's in the stack?

- [TanStack Start](https://tanstack.com/start) the full-stack framework powered by TanStack Router
- [TypeScript][typescript] for static type checking
- [Kysely](https://kysely.dev/) for type-safe database queries
- [Better Auth](https://better-auth.com/) for authentication and authorization
- [PostgreSQL](https://www.postgresql.org/) as the default database (easily switchable)
- [Base UI][baseui] UI components for building accessible user interfaces
- Deploy to [Fly.io](https://fly.io) using [Docker][docker] container (easy to switch to other edge platforms)
- Styling with [Tailwind CSS][tailwindcss] and [tailwind-merge][tailwind-merge]
- Code formatting and linting with [Oxlint][oxlint] and [Oxfmt][oxfmt]
- Unit testing with [Vitest][vitest], E2E testing with [Playwright][playwright]
- [Storybook][storybook] for UI component development and testing.

## 🏁 Quickstart

```sh
pnpm dlx tiged riipandi/better-start my-app
```

To get started with setting up this project, refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for step-by-step instructions.

## 👷‍♂️ Contributions

Contributions are welcome! Please open a pull requests for your changes and tickets
in case you would like to discuss something or have a question.

## ✨ Implemented Features

- [x] Authentication and Authorization
    - [x] Sign in
        - [x] Email and password
        - [x] Username and password
        - [x] Magic link
        - [x] Social provider (Google, GitHub, etc)
        - [x] Account Recovery (forgot password)
        - [x] Remember me
        - [ ] Passkey
    - [x] Sign up
        - [x] Email, username and password
        - [x] Social provider (Google, GitHub, etc)
        - [x] Account verification via email
    - [x] Two Factor Authentication (2FA)
        - [x] Using TOTP (Google Authenticator, Authy, etc)
        - [x] OTP Code via email
    - [x] Session management
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
- [x] Using S3 for file storage (avatar, etc)
- [x] Automatic Kysely database migrations
- [ ] Deployment via Docker container

## 🙏 Thanks to...

In general, I'd like to thank every single one who open-sources their source code for their
effort to contribute something to the open-source community. Your work means the world! 🌍 ❤️

## 📝 License

This project licensed under the [MIT license][license-mit]. See the [LICENSE](./LICENSE) file for more information.

---

<sub>🤫 Psst! If you like my work you can support me via [GitHub sponsors](https://github.com/sponsors/riipandi).</sub>

[![Made by](https://badgen.net/badge/icon/Aris%20Ripandi?label=Made+by&color=black&labelColor=black)][riipandi-x]

<!-- link reference definition -->
[baseui]: https://base-ui.com/react/overview/quick-start
[clsx]: https://www.npmjs.com/package/clsx
[docker]: https://docs.docker.com/engine/install
[fly-io]: https://fly.io/docs/getting-started/launch/
[kysely-dialects]: https://www.kysely.dev/docs/dialects
[license-mit]: https://choosealicense.com/licenses/mit/
[oxfmt]: https://oxc.rs/docs/guide/usage/formatter
[oxlint]: https://oxc.rs/docs/guide/usage/linter
[playwright]: https://playwright.dev
[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
[storybook]: https://storybook.js.org/docs
[tailwind-merge]: https://www.npmjs.com/package/tailwind-merge
[tailwindcss]: https://tailwindcss.com
[typescript]: https://typescriptlang.org
[vitest]: https://vitest.dev
