import { Config, GitRepo } from "./types.js";
import { logger } from "./io.js";
import { downloadRepo } from "./downloadUtils.js";

const getExampleStep = async (config: Config) => {
  const example = config.example;
  if (!example) {
    return;
  }
  logger.logTitle(` - Getting example '${example.name}' from ${example.repo}`);
  try {
    await downloadRepo(example, config.executionContext, config.verbose);
    logger.green(`\t✓ Example ${example.name} downloaded successfully`);
  } catch (error) {
    if (example.name !== "default") {
      logger.yellow(
        `Example ${example.name} not found in ${example.repo} repo...`,
      );
    }
    throw error;
  }
};

export { getExampleStep };
