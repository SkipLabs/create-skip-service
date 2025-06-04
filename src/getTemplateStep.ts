import { Config, GitRepo } from "./types.js";
import { logger } from "./io.js";
import { downloadRepo } from "./downloadUtils.js";

const getTemplateStep = async (config: Config) => {
  const template = config.template;
  if (!template) {
    return;
  }
  logger.logTitle(` - Getting template:'${template.name}'`);
  try {
    logger.blue(` - Getting template: from '${template.path}'`);
    await downloadRepo(template, config.executionContext, config.verbose);
    logger.green(`\t✓ Template  ${template} downloaded successfully`);
  } catch (error) {
    if (template.name !== "default") {
      logger.yellow(`Template not found in main repo...`);
    }
    throw error;
  }
};

export { getTemplateStep };
