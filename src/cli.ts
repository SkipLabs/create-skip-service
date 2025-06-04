#!/usr/bin/env node

// cli.ts
import { Command } from "commander";
import chalk from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { rmSync } from "fs";

import { Config } from "./types.js";
import { createDirectoryAndEnterStep } from "./createDirectoryAndEnterStep.js";
import path from "path";
import { gitStep } from "./gitStep.js";
import { logger } from "./io.js";
import { getTemplateStep } from "./getTemplateStep.js";
import { CreateSkipServiceError } from "./errors.js";
import { initProjectStep } from "./initProjectStep.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
);

const readCliArguments = (): Config => {
  const program = new Command();

  program
    .name("create-skip-service")
    .description("Initialize a new skip service project")
    .version(packageJson.version)
    .argument("<project_name>", "Project name")
    .option("--no-git-init", "Do not initialize a git repository", true)
    .option("-t, --template <template>", "Template to use", "default")
    .option("-v, --verbose", "Run with verbose logging")
    .option("-q, --quiet", "Run with quiet logging, overrides verbose")
    .option("-f, --force", "Force overwrite if directory exists");

  program.parse();

  const options = program.opts();
  const projectName = program.args[0];

  if (!projectName) {
    logger.logError("Project name is required");
    process.exit(1);
  }

  if (options.quiet) {
    logger.setQuiet(true);
  }

  if (options.verbose) {
    logger.setVerbose(true);
  }

  return {
    projectName: projectName,
    executionContext: path.join(process.cwd(), projectName),
    withGit: options.gitInit,
    quiet: options.quiet || false,
    verbose: options.verbose || false,
    force: options.force || false,
    template: {
      repo: "SkipLabs/create-skip-service",
      path: "templates",
      name: options.template || "default",
    },
  };
};

const steps = [
  createDirectoryAndEnterStep,
  getTemplateStep,
  initProjectStep,
  gitStep,
];

const main = async () => {
  const config: Config = readCliArguments();
  logger.logTitle("Starting setup...");
  for (const step of steps) {
    await step(config);
  }
};

main().catch((error) => {
  if (error instanceof CreateSkipServiceError) {
    logger.logError("Reverting everything...");
    process.chdir(path.join(error.executionContext, ".."));
    rmSync(error.executionContext, { recursive: true, force: true });
    logger.gray(error.message);
  } else {
    logger.logError("Error:", error);
  }
  process.exit(1);
});
