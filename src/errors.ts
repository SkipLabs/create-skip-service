class CreateSkipServiceError extends Error {
  executionContext: string;

  constructor(message: string, executionContext: string) {
    super(message);
    this.name = "CreateSkipServiceError";
    this.executionContext = executionContext;
  }
}

export { CreateSkipServiceError };
