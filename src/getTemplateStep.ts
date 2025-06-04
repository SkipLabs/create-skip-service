import path, { join } from "path";
import { Config } from "./types.js";
import { logger } from "./io.js";
import { writeFileSync, mkdirSync } from "fs";
import { CreateSkipServiceError } from "./errors.js";

const GITHUB_API = "https://api.github.com";

interface GitHubContent {
  name: string;
  type: string;
  path: string;
  download_url: string;
}

const fetchWithHeaders = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "create-skip-service",
    },
  });
  if (response.status === 403) {
    throw new Error("GitHub API rate limit exceeded. Please try again later.");
  }
  return response;
};

const downloadFile = async (url: string, path: string) => {
  const response = await fetchWithHeaders(url);
  if (!response.ok) throw new Error(`Failed to download ${url}`);
  const content = await response.text();
  writeFileSync(path, content);
};

const downloadDirectory = async (
  config: Config,
  url: string,
  localPath: string,
) => {
  const response = await fetchWithHeaders(url);
  if (!response.ok) throw new Error(`Failed to fetch template list ${url}`);
  const contents = (await response.json()) as GitHubContent[];
  const spinner = ['/', '-', '\\', '|'];
  let spinnerIndex = 0;
  
  for (const item of contents) {
    const itemPath = join(localPath, item.name);
    if (item.type === "file") {
      if (config.verbose) {
        process.stdout.write('\r\t' + spinner[spinnerIndex]);
        spinnerIndex = (spinnerIndex + 1) % spinner.length;
      }
      await downloadFile(item.download_url, itemPath);
    } else if (item.type === "dir") {
      mkdirSync(itemPath, { recursive: true });
      await downloadDirectory(
        config,
        `${GITHUB_API}/repos/${config.template.repo}/contents/${item.path}`,
        itemPath,
      );
    }
  }
  if (config.verbose) {
    process.stdout.write('\r\t      \r');
  }
};

const downloadTemplate = async (config: Config) => {
  try {
    logger.blue(` - Getting template: from '${path}'`);
    const template = config.template;

    const url = `${GITHUB_API}/repos/${template.repo}/contents/${template.path}`;
    logger.gray(`\t- Fetching template list`);

    const response = await fetchWithHeaders(url);
    logger.gray(`\t- Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error("Failed to fetch repository contents");
    }

    const contents = (await response.json()) as GitHubContent[];
    const availableTemplates = contents
      .filter((item) => item.type === "dir")
      .map((item) => item.name);

    if (!availableTemplates.includes(template.name)) {
      logger.logError(`  Invalid template: ${template.name}`);
      logger.logError("  Available templates:");
      availableTemplates.forEach((t: string) => logger.logError(`\t- ${t}`));
      throw new CreateSkipServiceError(
        "Invalid template",
        config.execution_context,
      );
    }

    const templateUrl = `${url}/${template.name}`;
    process.stdout.write("\t");
    await downloadDirectory(config, templateUrl, config.execution_context);
    process.stdout.write('\r\t      \r');
    logger.green(`\t✓ Template ${template} downloaded successfully`);
  } catch (error) {
    if (error instanceof CreateSkipServiceError) throw error;
    throw new CreateSkipServiceError(
      (error as Error).message,
      config.execution_context,
    );
  }
};

const getTemplateStep = async (config: Config) => {
  const template = config.template;
  logger.logTitle(` - Getting template:'${template}'`);
  try {
    await downloadTemplate(config);
  } catch (error) {
    if (template.name !== "default") {
      logger.yellow(
        `Template not found in main repo...`,
      );
      throw error;
    } else {
      throw error;
    }
  }
};

export { getTemplateStep };
