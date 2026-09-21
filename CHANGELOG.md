# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Malformed "not found" message for unknown templates (unbalanced quote).
- `initProjectStep` errors now name the script that actually failed instead of
  always blaming `init_server.sh`.
- Partial project directories are now cleaned up on **any** step failure, not
  only `CreateSkipServiceError`s, and error messages are always printed
  (previously only in `--verbose`).
- `--quiet` now silences the download progress spinner.
- Declining the overwrite prompt exits with code 0 instead of 1.
- `bun run test:coverage` works (added the missing `@vitest/coverage-v8`).
- The npm tarball no longer ships compiled tests, and `prettier` is no longer
  installed as a runtime dependency.

### Changed

- **Package manager switched from pnpm to Bun** for the CLI repo and every
  template. Install with `bun install` and run scripts with `bun run <script>`;
  lockfiles are now `bun.lock`. The runtime is unchanged: the CLI and generated
  services still run on Node.js ≥ 22.12 and tests still run on Vitest.
  `@skipruntime/native` is whitelisted through `trustedDependencies` instead of
  `pnpm-workspace.yaml`, and the unused `reactive_service/bootstrap.sh` was
  removed. The `with_react_vite` next-steps output now points at `./setup.sh`
  instead of a non-existent root package.
- **Dependency upgrade (root CLI).** TypeScript 6 → 7 (native Go `tsc`),
  Vitest 4 → 5, chalk 5 → 6, execa 9 → 10, `@types/node` 25 → 26, plus the
  latest Vite, Prettier, lint-staged and prettier-plugin-sql. No source changes
  were needed; the Node.js ≥ 22.12 baseline is unchanged.
- **Dependency upgrade (templates).** All template packages bumped to the latest
  Fastify, pg, React 19.3, Vite 8.3, ESLint 10.11, typescript-eslint 8.70 and
  friends. Templates stay on TypeScript 6.x and `@types/node` 22.x because
  typescript-eslint does not yet support TypeScript 7 (which ships without a
  programmatic API). The `with_react_vite` chat form now uses
  `React.SubmitEvent`, since `@types/react` 19.3 deprecates `FormEvent`.
- `coverage/` is now excluded from the Prettier check so `make check-format`
  passes after running `bun run test:coverage`.
- `GITHUB_TOKEN` is honored on GitHub API requests to raise the rate limit.
- Filesystem operations use `fs/promises` instead of shelling out to
  `rm`/`mkdir`/`chmod`; `execa` is only used for git.
- Templates aligned: MIT license everywhere (was a mix of ISC/MIT), unified
  Prettier config, `engines` added to `with_react_vite/frontend`, and the
  `default` template package renamed from `reactive_social_network_service_poc`
  to `skip-default`.
- Added a root `LICENSE` file (MIT).

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
