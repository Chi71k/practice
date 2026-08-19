export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new ApiError(400, 'BAD_REQUEST', message, details);
export const unauthorized = (message = 'Требуется аутентификация') => (
  new ApiError(401, 'UNAUTHORIZED', message)
);
export const forbidden = (message = 'Недостаточно прав') => new ApiError(403, 'FORBIDDEN', message);
export const notFound = (message = 'Ресурс не найден') => new ApiError(404, 'NOT_FOUND', message);
export const conflict = (message, details) => new ApiError(409, 'CONFLICT', message, details);
export const payloadTooLarge = (message = 'Тело запроса превышает допустимый размер') => (
  new ApiError(413, 'PAYLOAD_TOO_LARGE', message)
);
export const unsupportedMediaType = (message = 'Неподдерживаемый формат тела запроса') => (
  new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', message)
);
export const unprocessable = (message, details) => (
  new ApiError(422, 'VALIDATION_ERROR', message, details)
);
