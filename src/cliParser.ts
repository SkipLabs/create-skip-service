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
    .description(
      "Bootstrap Skip services with customizable templates and examples",
    )
    .version(packageJson.version)
    .argument("<project_name>", "Name of the project to create")
    .option("--no-git-init", "Skip git repository initialization")
    .option(
      "-t, --template <template>",
      "Use a specific template (default, with_postgres, with_react_vite)",
    )
    .option(
      "-e, --example <example>",
      "Use an example from the Skip repository (blogger, chatroom, hackernews)",
    )
    .option("-v, --verbose", "Show detailed output including debug information")
    .option("-q, --quiet", "Suppress all output except errors")
    .option("-f, --force", "Overwrite existing directory without prompting")
    .addHelpText(
      "after",
      `
Examples:
  $ npx create-skip-service my-project
  $ npx create-skip-service my-app --template with_postgres
  $ npx create-skip-service chat-app --template with_react_vite
  $ npx create-skip-service my-blog --example blogger

Available Templates:
  default         - Basic reactive Skip service
  with_postgres   - Skip service with PostgreSQL integration
  with_react_vite - Full-stack chat app with React + Vite frontend

Available Examples:
  blogger    - Full-stack blogging platform with Vue.js
  chatroom   - Real-time chat with Kafka and React
  hackernews - HackerNews clone with distributed setup

Documentation:
  https://github.com/SkipLabs/create-skip-service
  https://github.com/SkipLabs/skip
`,
    );

  return program;
};
