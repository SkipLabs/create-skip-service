type Template = {
  repo: string;
  path: string;
  name: string;
};

type Config = {
  project_name: string;
  execution_context: string;
  with_git: boolean;
  verbose: boolean;
  quiet: boolean;
  force: boolean;
  template: Template;
};

export { Config };
