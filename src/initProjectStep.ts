import path from "path";
import { Config } from "./types.js";
import { execa } from "execa";
import { logger } from "./io.js";
import { CreateSkipServiceError } from "./errors.js";
import { existsSync } from "fs";

const initProjectStep = async (config: Config) => {
  try {
    const initScriptPath = path.join(
      config.execution_context,
      "init_server.sh",
    );
    if (existsSync(initScriptPath)) {
      logger.blue("Making init_server.sh executable...");
      await execa("chmod", ["+x", initScriptPath]);
      logger.green("init_server.sh is now executable");
    } else {
      logger.gray("init_server.sh does not exist");
    }
  } catch (error) {
    throw new CreateSkipServiceError(
      `Failed to make init_server.sh executable: ${(error as Error).message}`,
      config.execution_context,
    );
  }
};

export { initProjectStep };
