import { Config, GitRepo } from "./types.js";
import { logger } from "./io.js";
import { downloadRepo } from "./downloadUtils.js";

const isGitHubRateLimitError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes("GitHub API rate limit exceeded");
  }
  return false;
};

type RepoType = "template" | "example";

const getRepoStep = async (
  config: Config,
  repoType: RepoType,
): Promise<void> => {
  const repo = repoType === "template" ? config.template : config.example;

  if (!repo) {
    return;
  }

  const capitalizedType = repoType.charAt(0).toUpperCase() + repoType.slice(1);

  logger.logTitle(` - Getting ${repoType} '${repo.name}' from ${repo.repo}`);

  try {
    await downloadRepo(repo, config.executionContext, config.verbose);
    logger.green(`\t✓ ${capitalizedType} ${repo.name} downloaded successfully`);
  } catch (error) {
    if (repo.name !== "default" && !isGitHubRateLimitError(error)) {
      const nameFormat = repoType === "template" ? `'${repo.name}` : repo.name;
      logger.yellow(
        `${capitalizedType} ${nameFormat} not found in ${repo.repo} repo...`,
      );
    }
    throw error;
  }
};

export { getRepoStep };
