import path from "path";
import { Config } from "./types.js";
import { execa } from "execa";
import { logger } from "./io.js";
import { CreateSkipServiceError } from "./errors.js";
import { existsSync } from "fs";
import { getErrorMessage } from "./utils/errorUtils.js";

const makeExecutable = async (scriptPath: string) => {
  logger.blue(`\tMaking ${scriptPath} executable...`);
  await execa("chmod", ["+x", scriptPath]);
  logger.green(`\t${scriptPath} is now executable`);
};

const initProjectStep = async (config: Config) => {
  try {
    const setupScriptPath = path.join(config.executionContext, "setup.sh");
    if (existsSync(setupScriptPath)) {
      await makeExecutable(setupScriptPath);
    } else {
      logger.gray("\tsetup.sh does not exist");
    }

    const initScriptPath = path.join(config.executionContext, "init_server.sh");
    if (existsSync(initScriptPath)) {
      await makeExecutable(initScriptPath);
    } else {
      logger.gray("\tinit_server.sh does not exist");
    }
  } catch (error) {
    throw new CreateSkipServiceError(
      `Failed to make init_server.sh executable: ${getErrorMessage(error)}`,
      config.executionContext,
    );
  }
};

export { initProjectStep };
