#!/usr/bin/env node

// cli.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
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

interface Arguments {
  project_name: string;
  git: boolean;
  verbose: boolean;
  quiet: boolean;
  force: boolean;
  template: string;
  _: (string | number)[];
  $0: string;
}

const read_cli_arguments = (): Config => {
  const argv = yargs(hideBin(process.argv))
    .version(packageJson.version)
    .command(
      "$0 <project_name>",
      "Initialize a new skip service project",
      (yargs) => {
        return yargs
          .positional("project_name", {
            describe: "Project name",
            type: "string",
            demandOption: true,
          })
          .option("git", {
            alias: "g",
            describe: "Initialize a git repository",
            type: "boolean",
            default: true,
          })
          .option("template", {
            alias: "t",
            describe: "Template to use",
            type: "string",
            default: "default",
          })
          .option("verbose", {
            alias: "v",
            describe: "Run with verbose logging",
            type: "boolean",
            default: false,
          })
          .option("quiet", {
            alias: "q",
            describe: "Run with quiet logging, overrides verbose",
            type: "boolean",
            default: false,
          })
          .option("force", {
            alias: "f",
            describe: "Force overwrite if directory exists",
            type: "boolean",
            default: false,
          });
      },
    )
    .help()
    .alias("help", "h")
    .parse() as unknown as Arguments;

  if (argv.project_name === undefined) {
    logger.logError("Project name is required");
    process.exit(1);
  }

  if (argv.quiet) {
    logger.setQuiet(true);
  }

  if (argv.verbose) {
    logger.setVerbose(true);
  }

  return {
    project_name: argv.project_name,
    execution_context: path.join(process.cwd(), argv.project_name),
    with_git: argv.git,
    quiet: argv.quiet,
    verbose: argv.verbose,
    force: argv.force,
    template: argv.template,
  };
};

const steps = [
  createDirectoryAndEnterStep,
  getTemplateStep,
  initProjectStep,
  gitStep,
];

const main = async () => {
  const config: Config = read_cli_arguments();
  logger.logTitle("Starting setup...");
  for (const step of steps) {
    await step(config);
  }
};

main().catch((error) => {
  if (error instanceof CreateSkipServiceError) {
    logger.logError("Reverting everything...");
    process.chdir(path.join(error.execution_context, ".."));
    rmSync(error.execution_context, { recursive: true, force: true });
    logger.gray(error.message);
  } else {
    logger.logError("Error:", error);
  }
  process.exit(1);
});
