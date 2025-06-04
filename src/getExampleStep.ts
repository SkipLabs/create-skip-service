import { Config, GitRepo } from "./types.js";
import { logger } from "./io.js";
import { downloadRepo } from "./downloadUtils.js";

const getExampleStep = async (config: Config) => {
  const example = config.example;
  if (!example) {
    return;
  }
  logger.logTitle(` - Getting example:'${example.name}'`);
  try {
    logger.blue(` - Getting example: from '${example.path}'`);
    await downloadRepo(example, config.executionContext, config.verbose);
    logger.green(`\t✓ Example  ${example} downloaded successfully`);
  } catch (error) {
    if (example.name !== "default") {
      logger.yellow(`Example not found in main repo...`);
    }
    throw error;
  }
};

export { getExampleStep };
