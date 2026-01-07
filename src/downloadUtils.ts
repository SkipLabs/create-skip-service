import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { GitRepo } from "./types.js";
import { CreateSkipServiceError } from "./errors.js";
import { logger } from "./io.js";
import { getErrorMessage } from "./utils/errorUtils.js";
const GITHUB_API = "https://api.github.com";

interface GitHubContent {
  name: string;
  type: "file" | "dir";
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
    throw new Error(
      "GitHub API rate limit exceeded.\n" +
        "  Try again later or authenticate with a GitHub token to increase your rate limit.\n" +
        "  See: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting",
    );
  }
  if (response.status === 404) {
    throw new Error(
      "Repository or template not found.\n" +
        "  Check that the template/example name is correct.\n" +
        "  Run with --help to see available options.",
    );
  }
  if (response.status >= 500) {
    throw new Error(
      "GitHub server error. Please try again later.\n" +
        "  Check GitHub status: https://www.githubstatus.com/",
    );
  }
  return response;
};

const downloadFile = async (url: string, path: string) => {
  const response = await fetchWithHeaders(url);
  if (!response.ok) throw new Error(`Failed to download ${url}`);
  const content = await response.text();
  await writeFile(path, content);
};

const downloadDirectory = async (
  template: GitRepo,
  templateUrl: string,
  localPath: string,
  verbose: boolean,
) => {
  const response = await fetchWithHeaders(templateUrl);
  if (!response.ok)
    throw new Error(`Failed to fetch template list ${templateUrl}`);
  const contents = (await response.json()) as GitHubContent[];

  const spinner = ["/", "-", "\\", "|"];
  let spinnerIndex = 0;

  for (const item of contents) {
    const itemPath = join(localPath, item.name);

    if (item.type === "file") {
      process.stdout.write("\r\t" + spinner[spinnerIndex]);
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
      await downloadFile(item.download_url, itemPath);
    } else if (item.type === "dir") {
      await mkdir(itemPath, { recursive: true });
      await downloadDirectory(
        template,
        `${GITHUB_API}/repos/${template.repo}/contents/${item.path}`,
        itemPath,
        verbose,
      );
    }
  }

  process.stdout.write("\r\t      \r");
};

const downloadRepo = async (
  repo: GitRepo,
  executionContext: string,
  verbose: boolean,
) => {
  try {
    const url = `${GITHUB_API}/repos/${repo.repo}/contents/${repo.path}`;
    logger.gray(`\t- Fetching list`);

    const response = await fetchWithHeaders(url);
    logger.gray(`\t- Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error("Failed to fetch repository contents");
    }

    const contents = (await response.json()) as GitHubContent[];
    const availableTemplates = contents
      .filter((item) => item.type === "dir")
      .map((item) => item.name);

    if (!availableTemplates.includes(repo.name)) {
      logger.logError(`  Invalid repository: ${repo.name}`);
      logger.logError("\n  Available repositories:");
      availableTemplates.forEach((t: string) => logger.logError(`    - ${t}`));
      logger.logError("\n  Run with --help to see all available options.");
      throw new CreateSkipServiceError(
        `Invalid repository: ${repo.name}`,
        executionContext,
      );
    }

    const templateUrl = `${url}/${repo.name}`;
    process.stdout.write("\t");
    await downloadDirectory(repo, templateUrl, executionContext, verbose);
    process.stdout.write("\r\t      \r");
  } catch (error) {
    if (error instanceof CreateSkipServiceError) throw error;
    throw new CreateSkipServiceError(getErrorMessage(error), executionContext);
  }
};

export { downloadRepo };
