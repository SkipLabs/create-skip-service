import { Config } from "./types.js";
import { getRepoStep } from "./getRepoStep.js";

const getTemplateStep = async (config: Config) => {
  await getRepoStep(config, "template");
};

export { getTemplateStep };
