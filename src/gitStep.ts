import { execa } from "execa";
import { Config } from "./types.js";
import { logger } from "./io.js";

const gitStep = async (config: Config) => {
  logger.logTitle(" - Initializing git repository");
  if (config.withGit) {
    await execa("git", ["init"]);
    logger.green("\t✓ initialized");

    await execa("git", ["add", "."]);

    let repoInfo = "Unknown source";
    if (config.example) {
      repoInfo = `Cloned '${config.example.name}' example from github.com/${config.example.repo}`;
    } else if (config.template) {
      repoInfo = `Cloned '${config.template.name}' template from github.com/${config.template.repo}`;
    }

    const commitMsg = `Initial setup by \`create-skip-service\`\n\n${repoInfo}`;

    await execa("git", ["commit", "-m", commitMsg]);

    logger.green("\t✓ initial commit created");
  } else {
    logger.gray("\t- Skipping git initialization");
  }
};

export { gitStep };
