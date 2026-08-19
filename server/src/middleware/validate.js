import { unsupportedMediaType, unprocessable } from '../utils/ApiError.js';

const formatIssues = (issues) => issues.map((issue) => ({
  path: issue.path.join('.'),
  message: issue.message,
}));

export const validate = ({ body, params, query } = {}) => (req, res, next) => {
  const targets = [
    ['body', body],
    ['params', params],
    ['query', query],
  ];

  for (const [key, schema] of targets) {
    if (!schema) continue;

    const result = schema.safeParse(req[key]);
    if (!result.success) {
      next(unprocessable('Запрос не прошёл валидацию', formatIssues(result.error.issues)));
      return;
    }

    if (key === 'query') {
      // Express 5 exposes req.query as a getter, поэтому сохраняем parsed/default values отдельно.
      req.validatedQuery = result.data;
    } else {
      req[key] = result.data;
    }
  }

  next();
};

export const requireJson = (req, res, next) => {
  if (!req.is('application/json')) {
    next(unsupportedMediaType('Content-Type должен быть application/json'));
    return;
  }
  next();
};
