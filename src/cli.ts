#!/usr/bin/env node

// cli.ts
import { rmSync } from "fs";
import path from "path";

import { Config } from "./types.js";
import { createDirectoryAndEnterStep } from "./createDirectoryAndEnterStep.js";
import { gitStep } from "./gitStep.js";
import { logger } from "./io.js";
import { getTemplateStep } from "./getTemplateStep.js";
import { CreateSkipServiceError } from "./errors.js";
import { initProjectStep } from "./initProjectStep.js";
import { getExampleStep } from "./getExampleStep.js";
import { createCliParser } from "./cliParser.js";

const readCliArguments = (): Config => {
  const program = createCliParser();
  program.parse();

  const options = program.opts();
  const projectName = program.args[0];

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

// Run main function
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
