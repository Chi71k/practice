export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  get code() {
    return this.data?.error?.code;
  }

  get details() {
    return this.data?.error?.details;
  }
}
