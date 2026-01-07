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
import {
  validateProjectName,
  validateTemplateName,
} from "./utils/validators.js";

const readCliArguments = (): Config => {
  const program = createCliParser();
  program.parse();

  const options = program.opts();
  const projectName = program.args[0];

  if (!projectName) {
    throw new Error("Project name is required");
  }

  const projectValidation = validateProjectName(projectName);
  if (!projectValidation.valid) {
    throw new Error(projectValidation.error);
  }

  if (options.example && options.template) {
    throw new Error("Example and template cannot be used together");
  }

  if (options.template) {
    const templateValidation = validateTemplateName(options.template);
    if (!templateValidation.valid) {
      throw new Error(`Invalid template name: ${templateValidation.error}`);
    }
  }

  if (options.example) {
    const exampleValidation = validateTemplateName(options.example);
    if (!exampleValidation.valid) {
      throw new Error(`Invalid example name: ${exampleValidation.error}`);
    }
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
          name: options.example.trim() || "blogger",
        }
      : null,
    template: !options.example
      ? {
          repo: "SkipLabs/create-skip-service",
          path: "templates",
          name: options.template ? options.template.trim() : "default",
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

const showSuccessMessage = (config: Config) => {
  logger.green("\n✓ Project created successfully!\n");

  logger.logTitle("Next steps:");
  logger.green(`  cd ${config.projectName}`);

  if (config.template?.name === "with_react_vite") {
    logger.green("  pnpm install");
    logger.green("  pnpm dev");
  } else {
    logger.green("  # Follow the instructions in the README.md");
  }

  logger.logTitle("\nProject details:");
  logger.green(`  Location: ${config.executionContext}`);

  if (config.template) {
    logger.green(`  Template: ${config.template.name}`);
  } else if (config.example) {
    logger.green(`  Example: ${config.example.name}`);
  }

  logger.green(`  Git initialized: ${config.withGit ? "yes" : "no"}`);

  logger.logTitle("\nDocumentation:");
  logger.green("  https://github.com/SkipLabs/create-skip-service");
  logger.green("  https://github.com/SkipLabs/skip\n");
};

const main = async () => {
  const config: Config = readCliArguments();
  logger.logTitle("Starting setup...");
  for (const step of steps) {
    await step(config);
  }
  showSuccessMessage(config);
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
