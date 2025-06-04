#!/usr/bin/env node

// cli.ts
import { Command } from "commander";
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
import { getExampleStep } from "./getExampleStep.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
);

const createCliParser = () => {
  const program = new Command();

  program
    .name("create-skip-service")
    .description("Initialize a new skip service project")
    .version("1.0.0")
    .argument("<project_name>", "Project name")
    .option("--no-git-init", "Do not initialize a git repository", true)
    .option("-t, --template <template>", "Template to use")
    .option("-e, --example <example>", "Example to use")
    .option("-v, --verbose", "Run with verbose logging")
    .option("-q, --quiet", "Run with quiet logging, overrides verbose")
    .option("-f, --force", "Force overwrite if directory exists");

  return program;
};

export { createCliParser };

const readCliArguments = (): Config => {
  const program = createCliParser();
  program.parse();

  const options = program.opts();
  const projectName = program.args[0];

  console.log(options);

  if (!projectName) {
    logger.logError("Project name is required");
    process.exit(1);
  }

  if (options.example && options.template) {
    logger.logError("Example and template cannot be used together");
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
    example: options.example
      ? {
          repo: "SkipLabs/skip",
          path: "examples",
          name: options.example || "blogger",
        }
      : null,
    template: !options.example
      ? {
          repo: "SkipLabs/create-skip-service",
          path: "templates",
          name: options.template || "default",
        }
      : null,
  };
};

const steps = [
  createDirectoryAndEnterStep,
  getTemplateStep,
  getExampleStep,
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

// Only run main when this file is executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
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
}
