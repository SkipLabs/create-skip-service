import { Config } from "./types.js";
import { getRepoStep } from "./getRepoStep.js";

const getExampleStep = async (config: Config) => {
  await getRepoStep(config, "example");
};

export { getExampleStep };
