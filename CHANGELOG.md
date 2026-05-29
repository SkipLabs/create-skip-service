# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0]

### Changed

- **Node.js baseline raised to ≥ 22.12.0.** Added an `engines` field to the CLI
  and to every template `package.json`. This follows `commander@15`, which
  requires Node 22.12+. Node 18 (end-of-life) and 20 are no longer supported.
- **CLI dependencies bumped to latest majors:** `commander` 14 → 15,
  `vite` 7 → 8 (dev-only), `lint-staged` 16 → 17, plus in-range bumps of
  `vitest`/`@vitest/ui` (4.1.7) and `@types/node` (25.9.1).
- **Templates now scaffold with the current Skip runtime** `^0.0.23`
  (was `^0.0.19`, which a caret pinned exactly on `0.0.x`) across
  `@skiplabs/skip`, `@skipruntime/*`, and `@skip-adapter/postgres`.
- **`with_react_vite/frontend` modernized:** `vite` 6 → 8,
  `@vitejs/plugin-react` 4 → 6, `eslint` 9 → 10,
  `eslint-plugin-react-hooks` 5 → 7, `eslint-plugin-react-refresh` 0.4 → 0.5,
  `globals` 16 → 17, `typescript` 5.8 → 6.0.
- **`with_react_vite/reactive_service` migrated to ESLint 10 flat config**
  (`eslint.config.js`); the legacy `.eslintrc.json` was removed (ESLint 10
  dropped the eslintrc system). Switched the split `@typescript-eslint/*`
  packages to the unified `typescript-eslint`.
- **TypeScript standardized to `^6.0.3`** across all templates (previously a mix
  of `~5.8.3` and `^5.9.3`).
- **CI:** test matrix updated to Node `22.12` and `24.10`; dropped EOL Node 18
  and odd-numbered 23. `test-local` image bumped to `cimg/node:22.12`.

### Removed

- Dead `@typescript-eslint/*` devDependencies from `with_postgres` (it has no
  ESLint configuration).
