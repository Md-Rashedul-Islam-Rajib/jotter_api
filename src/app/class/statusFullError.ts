


export type TErrorName =
  | 'ValidationError'
  | 'ZodValidationError'
  | 'NotFoundError'
  | 'StorageError'
  | 'AuthenticationError'
  | 'AuthorizationError'
  | 'InternalServerError';
export class StatusFullError extends Error {
  constructor(
    public name: TErrorName,
    public message: string,
    public success: boolean,
    public status: number,
    public path: string = '',
  ) {
    super(message);
    this.success = success;
    this.name = name;
    this.status = status;
    this.path = path;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
