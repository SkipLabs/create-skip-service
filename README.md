# create-skip-service

A CLI tool to bootstrap Skip services with various templates. It provides a quick way to start new Skip projects with pre-configured templates for different use cases.

## Current status

[![CI](https://circleci.com/gh/SkipLabs/create-skip-service.svg?style=shield)](https://circleci.com/gh/SkipLabs/create-skip-service)
[![npm downloads](https://img.shields.io/npm/dm/create-skip-service.svg)](https://www.npmjs.com/package/create-skip-service)

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

## Usage

To create a new Skip service, run:

```bash
npx create-skip-service <project-name> [options]
```

### Options

- `-t, --template <name>` - Use a specific template (default, with_postgres, with_react_vite)
- `-e, --example <name>` - Use an example from the Skip repository
- `--no-git-init` - Skip git repository initialization
- `-f, --force` - Overwrite existing directory
- `-v, --verbose` - Show detailed output
- `-q, --quiet` - Suppress non-error output

## Available Templates

Templates can be found [here](https://github.com/SkipLabs/create-skip-service/tree/main/templates).

### default

A basic reactive Skip service template that includes:

- Core Skip service structure
- TypeScript configuration
- Development tools setup

### with_postgres

A template that includes:

- PostgreSQL database integration
- Database models and schema
- TypeScript configuration
- Development tools setup

### with_react_vite

A full-stack chat application template that includes:

- React frontend with Vite
- Skip reactive service backend
- Real-time chat functionality
- TypeScript configuration throughout

## Development

To work on this tool locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the project:
   ```bash
   pnpm build
   ```
4. Run in development mode:
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm build` - Build the project
- `pnpm start` - Run the CLI
- `pnpm dev` - Run in development mode with watch
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm typecheck` - Type checking without emitting

### Testing the CLI locally

```bash
node dist/cli.js <project-name> [options]
```

## Available Examples

You can also bootstrap your project using examples from the Skip repository by using the `--example` flag:

```bash
npx create-skip-service my-project --example <example-name>
```

### blogger

A full-stack blogging platform demonstrating:

- Skip reactive service with leader-follower distributed configuration
- Flask web service for REST API
- Vue.js frontend
- PostgreSQL database
- HAProxy reverse proxy
- Docker Compose and distributed deployment options

### chatroom

A real-time chat application featuring:

- Skip reactive service with Kafka event store
- Express.js web service
- React frontend with real-time messaging
- Docker Compose configuration
- Event-driven architecture demonstration

### hackernews

A HackerNews clone showcasing:

- Skip reactive service with distributed leader-follower setup
- Flask web service with read/write separation
- React frontend with real-time updates
- PostgreSQL database
- HAProxy load balancing
- Both Docker Compose and Kubernetes deployment options
- Comprehensive real-time voting and posting system

## Support

Join the [Discord](https://discord.gg/ss4zxfgUBH) to talk to other community members and developers or ask any questions.
