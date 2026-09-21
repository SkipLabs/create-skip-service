#!/usr/bin/env node

// cli.ts
import { rmSync } from "fs";
import path from "path";

import { Config } from "./types.js";
import { createDirectoryAndEnterStep } from "./createDirectoryAndEnterStep.js";
import { gitStep } from "./gitStep.js";
import { logger } from "./io.js";
import { CreateSkipServiceError } from "./errors.js";
import { initProjectStep } from "./initProjectStep.js";
import { getRepoStep } from "./getRepoStep.js";
import { parseCliArguments } from "./cliParser.js";

const steps = [
  (config: Config) => getRepoStep(config, "template"),
  (config: Config) => getRepoStep(config, "example"),
  initProjectStep,
  gitStep,
];

const showSuccessMessage = (config: Config) => {
  logger.green("\n✓ Project created successfully!\n");

  logger.logTitle("Next steps:");
  logger.green(`  cd ${config.projectName}`);

  if (config.template?.name === "with_react_vite") {
    logger.green("  ./setup.sh");
    logger.green("  cd reactive_service && bun run start");
    logger.green("  # In a second terminal: cd frontend && bun run dev");
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
  const config: Config = parseCliArguments();

  if (config.quiet) {
    logger.setQuiet(true);
  }
  if (config.verbose) {
    logger.setVerbose(true);
  }

  logger.logTitle("Starting setup...");
  await createDirectoryAndEnterStep(config);
  try {
    for (const step of steps) {
      await step(config);
    }
  } catch (error) {
    // The project directory exists at this point: remove it whatever the error.
    logger.logError("Reverting everything...");
    process.chdir(path.join(config.executionContext, ".."));
    rmSync(config.executionContext, { recursive: true, force: true });
    throw error;
  }
  showSuccessMessage(config);
};

// Run main function
main().catch((error) => {
  if (error instanceof CreateSkipServiceError) {
    logger.logError(error.message);
  } else {
    logger.logError("Error:", error);
  }
  process.exit(1);
});
