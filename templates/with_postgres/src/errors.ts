export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(404, message);
  }
}

export class InternalError extends APIError {
  constructor(message: string) {
    super(500, message);
  }
}
