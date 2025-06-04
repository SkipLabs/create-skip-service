import chalk from "chalk";
import { execa } from "execa";
import fs from "fs";
import path from "path";
import { Config } from "./types.js";
import { prompt } from "./promptUtils.js";
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
  logger.logTitle(` - Creating directory:\t${config.projectName}`);
  const dirPath = path.resolve(config.executionContext);
  const exists = await checkDirectoryExists(dirPath);

  if (exists) {
    if (!config.force) {
      logger.yellow(`\nDirectory "${config.projectName}" already exists.`);
      const answer = await prompt(
        chalk.yellow("Do you want to delete it and continue? (y/N) "),
      );

      if (answer.toLowerCase() !== "y") {
        logger.red("Operation aborted.");
        process.exit(1);
      }
    }

    logger.blue(`Removing existing directory: ${config.executionContext}`);
    await execa("rm", ["-rf", config.executionContext]);
  }

  await execa("mkdir", ["-p", config.executionContext]);
  logger.green(`\t✓ Creating directory`);
  chdir(config.executionContext);
  logger.green(`\t✓ cd ${config.projectName}`);
};

export { createDirectoryAndEnterStep };
