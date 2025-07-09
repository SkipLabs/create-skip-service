import { Config, GitRepo } from "./types.js";
import { logger } from "./io.js";
import { downloadRepo } from "./downloadUtils.js";

const getTemplateStep = async (config: Config) => {
  const template = config.template;
  if (!template) {
    return;
  }
  logger.logTitle(
    ` - Getting template '${template.name}' from ${template.repo}`,
  );
  try {
    await downloadRepo(template, config.executionContext, config.verbose);
    logger.green(`\t✓ Template ${template.name} downloaded successfully`);
  } catch (error) {
    if (
      template.name !== "default" &&
      !(error as Error).message.includes("GitHub API rate limit exceeded")
    ) {
      logger.yellow(
        `Template '${template.name} not found in ${template.repo} repo...`,
      );
    }
    throw error;
  }
};

export { getTemplateStep };
