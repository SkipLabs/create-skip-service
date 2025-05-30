import path from "path";
import { Config } from "./types.js";
import { execa } from "execa";
import { logger } from "./io.js";
import { CreateSkipServiceError } from "./errors.js";
import { existsSync } from "fs";

const makeExecutable = async (scriptPath: string) => {
  logger.blue(`\tMaking ${scriptPath} executable...`);
  await execa("chmod", ["+x", scriptPath]);
  logger.green(`\t${scriptPath} is now executable`);
};

const initProjectStep = async (config: Config) => {
  try {
    const setupScriptPath = path.join(
      config.execution_context,
      "setup.sh",
    );
    if (existsSync(setupScriptPath)) {
      await makeExecutable(setupScriptPath);
    } else {
      logger.gray("\tsetup.sh does not exist");
    }

    const initScriptPath = path.join(
      config.execution_context,
      "init_server.sh",
    );
    if (existsSync(initScriptPath)) {
      await makeExecutable(initScriptPath);
    } else {
      logger.gray("\tinit_server.sh does not exist");
    }
  } catch (error) {
    throw new CreateSkipServiceError(
      `Failed to make init_server.sh executable: ${(error as Error).message}`,
      config.execution_context,
    );
  }
};

export { initProjectStep };
