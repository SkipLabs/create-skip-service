class CreateSkipServiceError extends Error {
  executionContext: string;

  constructor(message: string, executionContext: string) {
    super(message);
    this.executionContext = executionContext;
  }
}

export { CreateSkipServiceError };
