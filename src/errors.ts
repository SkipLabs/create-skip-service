class CreateSkipServiceError extends Error {
  execution_context: string;

  constructor(message: string, execution_context: string) {
    super(message);
    this.execution_context = execution_context;
  }
}

export { CreateSkipServiceError };
