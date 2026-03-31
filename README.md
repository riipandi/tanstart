# TanStart

A starter template featuring TanStack libs (Start, Query, DevTools), Tailwind CSS, and TypeScript.
TanStack Start is a full-stack web framework built on top of [Vite](https://vitejs.dev/),
[React](https://react.dev/), and [TanStack Router](https://tanstack.com/router/latest).

> [!WARNING]
> This project just a template that I use for my personal use, so you may encounter bugs.
> Please review the release notes thoroughly before updating, as breaking changes can occur!

## Quick Start

You will need [`Node.js >= 24.14`][nodejs], [`PNPM >= 10.33`][pnpm], and [`Docker >= 20.10`][docker] installed on your machine.

```sh
pnpm dlx tiged riipandi/tanstart my-app
```

Read the [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on contributing to this project.

```bash
# Clone the repository
git clone <repository-url>
cd myapp

# Install dependencies
pnpm install

# Copy envar for local development
cp .env.example .env.local

# Generate application secrets
pnpm --silent generate:key

# Start development services
pnpm compose:up

# Start dev server
pnpm dev
```

The application will be accessible at: <http://localhost:3000>.

## Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

## Documentation

For more detailed information about the system architecture, design decisions, and project structure,
please refer to the documentation in the [`docs`](./docs) directory.

## License

This project licensed under the [MIT license][license-mit]. See the [LICENSE](./LICENSE) file for more information.

---

<sub>🤫 Psst! If you like my work you can support me via [GitHub sponsors](https://github.com/sponsors/riipandi).</sub>

[![Made by](https://badgen.net/badge/icon/Aris%20Ripandi?label=Made+by&color=black&labelColor=black)][riipandi-x]

<!-- References -->
[docker]: https://docs.docker.com/engine/install/
[license-mit]: https://choosealicense.com/licenses/mit/
[nodejs]: https://nodejs.org/en/download
[pnpm]: https://pnpm.io/installation
[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
