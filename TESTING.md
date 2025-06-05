# Testing & Quality Assurance

This project includes comprehensive testing and quality assurance measures to ensure code reliability.

## Test Suite

- **154 tests** across **9 test files**
- **100% pass rate**
- Covers all CLI modules and functionality

### Running Tests

```bash
# Run tests in watch mode (development)
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage (requires @vitest/coverage package)
pnpm test:coverage

# TypeScript type checking
pnpm typecheck
```

## Git Hooks

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
pnpm pre-commit

# Pre-push checks
pnpm pre-push
```

## Test Coverage

The test suite covers:

- **CLI argument parsing** (13 tests)
- **Error handling** (12 tests)
- **Logger functionality** (25 tests)
- **User prompts** (16 tests)
- **Download utilities** (17 tests)
- **Template operations** (16 tests)
- **Example operations** (20 tests)
- **Git operations** (18 tests)
- **Project initialization** (17 tests)

## Quality Standards

All code must:

- ✅ Pass the full test suite
- ✅ Pass TypeScript type checking
- ✅ Be formatted with Prettier
- ✅ Follow existing code patterns

These standards are automatically enforced via git hooks.
