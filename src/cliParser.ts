import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
);

export const createCliParser = () => {
  const program = new Command();

  program
    .name("create-skip-service")
    .description("Initialize a new skip service project")
    .version(packageJson.version)
    .argument("<project_name>", "Project name")
    .option("--no-git-init", "Do not initialize a git repository", true)
    .option("-t, --template <template>", "Template to use")
    .option("-e, --example <example>", "Example to use")
    .option("-v, --verbose", "Run with verbose logging")
    .option("-q, --quiet", "Run with quiet logging, overrides verbose")
    .option("-f, --force", "Force overwrite if directory exists");

  return program;
};
