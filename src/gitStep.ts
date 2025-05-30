import chalk from "chalk";
import { execa } from "execa";
import { Config } from "./types.js";
import path from "path";
import fs from "fs";
import { logger } from "./io.js";

const gitStep = async (config: Config) => {
  logger.logTitle(" - Initializing git repository");
  if (config.with_git) {
    await execa("git", ["init"]);
    logger.green("\t✓ initialized");

    await execa("git", ["add", "."]);
    await execa("git", ["commit", "-m", "Initial commit"]);
    logger.green("\t✓ initial commit created");
  } else {
    logger.gray("\t- Skipping git initialization");
  }
};

export { gitStep };
