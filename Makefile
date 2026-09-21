# Makefile for local development and CI workflow.
# Run `make help` to list available targets.

BUN ?= bun
PRETTIER_LOG_LEVEL ?= warn
PRETTIER := $(BUN) run prettier --log-level $(PRETTIER_LOG_LEVEL) --ignore-path .prettierignore

# Template packages, each an independent package with its own lockfile.
TEMPLATES := templates/default \
             templates/with_postgres \
             templates/with_react_vite/reactive_service \
             templates/with_react_vite/frontend

.DEFAULT_GOAL := help

.PHONY: help
help:  ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  %-16s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

.PHONY: deps
deps: node_modules/.install-stamp  ## Install root dependencies

node_modules/.install-stamp: bun.lock package.json
	$(BUN) install --frozen-lockfile
	@touch $@

.PHONY: format
format: deps  ## Format all files in place (Prettier)
	$(PRETTIER) --write .

.PHONY: check-format
check-format: deps  ## Check formatting without writing (CI gate)
	$(PRETTIER) --check .

.PHONY: build
build: deps  ## Build the CLI
	$(BUN) run build

.PHONY: typecheck
typecheck: deps  ## Type-check without emitting
	$(BUN) run typecheck

.PHONY: test
test: deps  ## Run the test suite once
	$(BUN) run test:run

.PHONY: check
check: check-format test typecheck build  ## Run the full root CI suite

.PHONY: check-templates
check-templates:  ## Install, build, and lint each template package
	@set -e; for dir in $(TEMPLATES); do \
	  echo "=== $$dir ==="; \
	  ( cd "$$dir" && $(BUN) install --frozen-lockfile --ignore-scripts && $(BUN) run build && \
	    if node -e "process.exit(require('./package.json').scripts.lint ? 0 : 1)"; then $(BUN) run lint; fi ); \
	done
