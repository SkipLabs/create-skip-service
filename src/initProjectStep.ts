import path from "path";
import { Config } from "./types.js";
import { chmod } from "fs/promises";
import { logger } from "./io.js";
import { CreateSkipServiceError } from "./errors.js";
import { existsSync } from "fs";
import { getErrorMessage } from "./utils/errorUtils.js";

const makeExecutable = async (scriptPath: string, executionContext: string) => {
  logger.blue(`\tMaking ${scriptPath} executable...`);
  try {
    await chmod(scriptPath, 0o755);
  } catch (error) {
    throw new CreateSkipServiceError(
      `Failed to make ${path.basename(scriptPath)} executable: ${getErrorMessage(error)}`,
      executionContext,
    );
  }
  logger.green(`\t${scriptPath} is now executable`);
};

const initProjectStep = async (config: Config) => {
  for (const script of ["setup.sh", "init_server.sh"]) {
    const scriptPath = path.join(config.executionContext, script);
    if (existsSync(scriptPath)) {
      await makeExecutable(scriptPath, config.executionContext);
    } else {
      logger.gray(`\t${script} does not exist`);
    }
  }
};

export { initProjectStep };
