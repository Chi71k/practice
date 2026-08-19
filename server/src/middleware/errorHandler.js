import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Маршрут ${req.method} ${req.originalUrl} не найден`,
    },
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }

  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Тело запроса содержит некорректный JSON',
      },
    });
    return;
  }

  if (error?.type === 'entity.too.large') {
    res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Тело запроса превышает допустимый размер',
      },
    });
    return;
  }

  if (error?.type === 'encoding.unsupported') {
    res.status(415).json({
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Content-Encoding не поддерживается',
      },
    });
    return;
  }

  if (error?.status === 400 && error?.expose) {
    res.status(400).json({
      error: {
        code: 'INVALID_BODY',
        message: 'Тело запроса не удалось декодировать',
      },
    });
    return;
  }

  if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Ресурс с такими уникальными данными уже существует',
      },
    });
    return;
  }

  if (['SQLITE_CONSTRAINT_FOREIGNKEY', 'SQLITE_CONSTRAINT_TRIGGER'].includes(error?.code)) {
    res.status(409).json({
      error: {
        code: 'RESOURCE_IN_USE',
        message: 'Ресурс связан с другими данными и не может быть удалён',
      },
    });
    return;
  }

  if (error?.code === 'SQLITE_CONSTRAINT_CHECK') {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Данные нарушают ограничения ресурса',
      },
    });
    return;
  }

  if (req.app.locals.config?.nodeEnv !== 'test') {
    console.error(error);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Внутренняя ошибка сервера',
    },
  });
};
