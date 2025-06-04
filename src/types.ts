type GitRepo = {
  repo: string;
  path: string;
  name: string;
};

type Config = {
  projectName: string;
  executionContext: string;
  withGit: boolean;
  verbose: boolean;
  quiet: boolean;
  force: boolean;
  example: GitRepo | null;
  template: GitRepo | null;
};

export { Config, GitRepo };
