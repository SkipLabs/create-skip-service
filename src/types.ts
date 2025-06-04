type Template = {
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
  template: Template;
};

export { Config };
