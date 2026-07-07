# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI tool (`create-skip-service`) that bootstraps Skip services with various templates. It's a project scaffolding tool similar to create-react-app but for Skip services. The CLI downloads templates from GitHub repositories and sets up new projects with proper initialization.

## Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm build           # Build the TypeScript project
pnpm dev             # Build with watch mode for development
pnpm start           # Run the built CLI
pnpm clean           # Clean build artifacts
pnpm format          # Format code with Prettier

# Testing
pnpm test            # Run tests in watch mode
pnpm test:run        # Run tests once
pnpm test:ui         # Run tests with UI
pnpm test:coverage   # Run tests with coverage report
pnpm typecheck       # Type checking without emitting

# Git hooks (run automatically)
pnpm pre-commit      # Prettier + test:run (runs before commits)
pnpm pre-push        # test:run + typecheck (runs before pushes)

# Testing the CLI locally
node dist/cli.js <project-name> [options]

# Running a single test file
pnpm vitest run src/__tests__/cli.test.ts
```

## Architecture

### Core Components

- **cli.ts**: Main entry point that orchestrates the setup steps and executes the main function
- **cliParser.ts**: Commander.js parser factory (`createCliParser`) plus `buildConfig`, which validates arguments and assembles the `Config` — both exported for direct unit testing
- **Step-based execution**: The tool uses a pipeline of steps executed sequentially:
  1. `createDirectoryAndEnterStep` - Creates project directory
  2. `getRepoStep` (called once for "template", once for "example") - Downloads the selected template or example from GitHub
  3. `initProjectStep` - Initializes the project (makes scripts executable)
  4. `gitStep` - Initializes git repository

### Key Modules

- **downloadUtils.ts**: GitHub API integration for recursive repository downloads; honors the `GITHUB_TOKEN` env var to raise the API rate limit
- **io.ts**: Multi-level logging system (verbose, normal, quiet) with colored output using chalk; `logger.progress` writes raw spinner output that respects quiet mode
- **promptUtils.ts**: Interactive user prompts for confirmations and directory overwrite handling
- **types.ts**: Core data structures including Config and GitRepo interfaces
- **errors.ts**: Custom error class (`CreateSkipServiceError`) that carries execution context
- **utils/**: `validators.ts` (project/template name validation), `errorUtils.ts` (error message extraction), `stringUtils.ts`
- Individual step files: `createDirectoryAndEnterStep.ts`, `getRepoStep.ts`, `initProjectStep.ts`, `gitStep.ts`

### Key Features

- **Template system**: Downloads templates from `SkipLabs/create-skip-service/templates/` or examples from `SkipLabs/skip/examples/`
- **Error handling**: Any step failure after the project directory is created triggers automatic cleanup - the partially created project directory is removed
- **CLI options**: Supports templates (`--template`), examples (`--example`), git init control (`--no-git-init`), verbose/quiet modes, and force overwrite (`--force`)
- **GitHub API integration**: Uses GitHub API for template/example downloads with progress indicators and rate limiting

### Templates Available

- `default`: Basic reactive Skip service
- `with_postgres`: PostgreSQL integration template
- `with_react_vite`: React + Vite chat application template

### Examples Available (from SkipLabs/skip repository)

- `blogger`: Full-stack blogging platform with leader-follower Skip service, Flask API, Vue.js frontend, PostgreSQL
- `chatroom`: Real-time chat with Skip service + Kafka, Express.js API, React frontend
- `hackernews`: HackerNews clone with distributed Skip service, Flask API, React frontend, PostgreSQL

### Configuration Structure

The `Config` type defines the execution context with project name, paths, git settings, and selected template/example info including GitHub repository details.

### Development Patterns

- **Pipeline Architecture**: Sequential step execution with shared configuration object
- **Error Recovery**: Automatic cleanup of partially created projects on any failure
- **Modular Design**: Each functionality isolated in its own module for testability
- **Factory Pattern**: CLI parser creation separated for unit testing
- **Mock-based Testing**: External dependencies mocked for reliable test execution

## Important Notes

- Uses ES modules (`"type": "module"` in package.json)
- Built as an npm package with bin entry point; `pnpm build` uses `tsconfig.build.json`, which excludes tests from `dist/`
- Templates and examples are downloaded from separate GitHub repositories; set `GITHUB_TOKEN` to avoid the unauthenticated GitHub API rate limit (~60 requests/hour)
- Error recovery includes automatic cleanup of partially created projects
- Husky is configured for pre-commit hooks (lint-staged + test:run) and pre-push hooks (test:run + typecheck)
- Test framework: Vitest with Node.js environment; tests live in `src/__tests__/` (vitest is scoped to `src/` so stale compiled tests in `dist/` never run)
- CI (CircleCI) runs the root suite on Node 22/24, a repo-wide Prettier check (`make check-format`), and builds/lints every template package (`make check-templates`)
- TypeScript with strict configuration and ES2022 target
- Dependencies: Commander.js (CLI), Chalk (colors), Execa (git invocation)
