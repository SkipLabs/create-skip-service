# Testing & Quality Assurance

This project includes comprehensive testing and quality assurance measures to ensure code reliability.

## Test Suite

The suite lives in `src/__tests__/`, one test file per module. Run
`bun run test:run` for the current test and file counts — this document
deliberately avoids hard-coding them.

### Running Tests

```bash
# Run tests in watch mode (development)
bun run test

# Run tests once
bun run test:run

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage

# TypeScript type checking
bun run typecheck
```

## Git Hooks

The hooks invoke `bun run ...`, so `bun` must be on the PATH of whatever runs
git. GUI clients that do not load your shell profile can export it from
`~/.config/husky/init.sh` (for example `export PATH="$HOME/.bun/bin:$PATH"`).

The project uses [Husky](https://typicode.github.io/husky/) with automated quality checks:

### Pre-commit Hook

Runs automatically before each commit:

- **Prettier formatting** on staged files
- **Full test suite** execution
- Prevents commits if tests fail

### Pre-push Hook

Runs automatically before each push:

- **Full test suite** execution
- **TypeScript type checking**
- Prevents pushes if tests fail or types are invalid

### Manual Execution

You can run the same checks manually:

```bash
# Pre-commit checks
bun run pre-commit

# Pre-push checks
bun run pre-push
```

## Test Coverage

The test suite covers:

- **CLI argument parsing and Config building** (`cli.test.ts`, exercising the real `buildConfig`)
- **Input validation** (`validators.test.ts`)
- **Error handling** (`errors.test.ts`)
- **Logger functionality** (`logger.test.ts`)
- **User prompts** (`promptUtils.test.ts`)
- **Download utilities** (`downloadUtils.test.ts`)
- **Template/example download step** (`getRepoStep.test.ts`)
- **Directory creation and overwrite prompting** (`createDirectoryAndEnterStep.test.ts`)
- **Git operations** (`gitStep.test.ts`)
- **Project initialization** (`initProjectStep.test.ts`)

## Quality Standards

All code must:

- ✅ Pass the full test suite
- ✅ Pass TypeScript type checking
- ✅ Be formatted with Prettier
- ✅ Follow existing code patterns

These standards are automatically enforced via git hooks.
