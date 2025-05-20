type Config = {
  project_name: string;
  execution_context: string;
  with_git: boolean;
  verbose: boolean;
  quiet: boolean;
  force: boolean;
  template: string;
};

export { Config };
