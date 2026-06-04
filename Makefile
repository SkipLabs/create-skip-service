# Makefile for local development and CI workflow.
# Run `make help` to list available targets.

PNPM ?= pnpm
PRETTIER_LOG_LEVEL ?= warn
PRETTIER := $(PNPM) exec prettier --log-level $(PRETTIER_LOG_LEVEL) --ignore-path .prettierignore

# Template packages, each an independent package with its own lockfile.
TEMPLATES := templates/default \
             templates/with_postgres \
             templates/with_react_vite/reactive_service \
             templates/with_react_vite/frontend

# Don't let `pnpm run` re-install before a script; `deps` handles installs.
export npm_config_verify_deps_before_run := false

.DEFAULT_GOAL := help

.PHONY: help
help:  ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  %-16s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

.PHONY: deps
deps: node_modules/.install-stamp  ## Install root dependencies

node_modules/.install-stamp: pnpm-lock.yaml package.json
	$(PNPM) install --frozen-lockfile
	@touch $@

.PHONY: format
format: deps  ## Format all files in place (Prettier)
	$(PRETTIER) --write .

.PHONY: check-format
check-format: deps  ## Check formatting without writing (CI gate)
	$(PRETTIER) --check .

.PHONY: build
build: deps  ## Build the CLI
	$(PNPM) build

.PHONY: typecheck
typecheck: deps  ## Type-check without emitting
	$(PNPM) typecheck

.PHONY: test
test: deps  ## Run the test suite once
	$(PNPM) test:run

.PHONY: check
check: check-format test typecheck build  ## Run the full root CI suite

.PHONY: check-templates
check-templates:  ## Install, build, and lint each template package
	@set -e; for dir in $(TEMPLATES); do \
	  echo "=== $$dir ==="; \
	  ( cd "$$dir" && $(PNPM) install --frozen-lockfile --ignore-scripts --config.confirmModulesPurge=false && $(PNPM) build && \
	    if node -e "process.exit(require('./package.json').scripts.lint ? 0 : 1)"; then $(PNPM) lint; fi ); \
	done
