import chalk from "chalk";
import { execa } from "execa";
import fs from "fs";
import path from "path";
import { Config } from "./types.js";
import { prompt } from "./prompt_utils.js";
import { chdir } from "process";
import { logger } from "./io.js";

const checkDirectoryExists = async (dirPath: string): Promise<boolean> => {
  try {
    await fs.promises.access(dirPath);
    return true;
  } catch {
    return false;
  }
};

const createDirectoryAndEnterStep = async (config: Config) => {
  logger.logTitle(` - Creating directory:\t${config.project_name}`);
  const dirPath = path.resolve(config.execution_context);
  const exists = await checkDirectoryExists(dirPath);

  if (exists) {
    if (!config.force) {
      logger.yellow(`\nDirectory "${config.project_name}" already exists.`);
      const answer = await prompt(
        chalk.yellow("Do you want to delete it and continue? (y/N) "),
      );

      if (answer.toLowerCase() !== "y") {
        logger.red("Operation aborted.");
        process.exit(1);
      }
    }

    logger.blue(`Removing existing directory: ${config.execution_context}`);
    await execa("rm", ["-rf", config.execution_context]);
  }

  await execa("mkdir", ["-p", config.execution_context]);
  logger.green(`\t✓ Creating directory`);
  chdir(config.execution_context);
  logger.green(`\t✓ cd ${config.project_name}`);
};

export { createDirectoryAndEnterStep };
