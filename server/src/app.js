import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createAdminController } from './controllers/adminController.js';
import { createApplicationsController } from './controllers/applicationsController.js';
import { createAuthController } from './controllers/authController.js';
import { createResumesController } from './controllers/resumesController.js';
import { createVacanciesController } from './controllers/vacanciesController.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createTrustedOriginMiddleware } from './middleware/trustedOrigin.js';
import { createApplicationsRepository } from './repositories/applicationsRepository.js';
import { createResumesRepository } from './repositories/resumesRepository.js';
import { createSessionsRepository } from './repositories/sessionsRepository.js';
import { createUsersRepository } from './repositories/usersRepository.js';
import { createVacanciesRepository } from './repositories/vacanciesRepository.js';
import { createAdminRoutes } from './routes/adminRoutes.js';
import { createApplicationsRoutes } from './routes/applicationsRoutes.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createResumesRoutes } from './routes/resumesRoutes.js';
import { createVacanciesRoutes } from './routes/vacanciesRoutes.js';
import { createAuthService } from './services/authService.js';
import { createUsersService } from './services/usersService.js';

export const createApp = ({ db, config }) => {
  const usersRepository = createUsersRepository(db);
  const sessionsRepository = createSessionsRepository(db);
  const resumesRepository = createResumesRepository(db);
  const vacanciesRepository = createVacanciesRepository(db);
  const applicationsRepository = createApplicationsRepository(db);
  const authService = createAuthService({
    db,
    usersRepository,
    sessionsRepository,
    config,
  });
  const usersService = createUsersService({
    db,
    usersRepository,
    sessionsRepository,
    resumesRepository,
    vacanciesRepository,
    applicationsRepository,
  });
  const authMiddleware = createAuthMiddleware({ authService, config });

  const app = express();
  app.disable('x-powered-by');
  app.locals.config = config;
  app.use(helmet());
  app.use(cors({
    origin: config.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }));
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => config.isTest,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Слишком много запросов. Повторите позже.',
      },
    },
  }));
  app.use(express.json({ limit: '100kb', type: 'application/json' }));
  app.use(cookieParser());
  app.use(authMiddleware.optionalAuth);
  app.use(createTrustedOriginMiddleware(config));

  app.get('/api/health', (req, res) => {
    res.json({
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    });
  });

  const authController = createAuthController({ authService, usersService, config });
  const resumesController = createResumesController({ resumesRepository });
  const vacanciesController = createVacanciesController({ vacanciesRepository });
  const applicationsController = createApplicationsController({
    applicationsRepository,
    resumesRepository,
    vacanciesRepository,
  });
  const adminController = createAdminController({ usersService });

  app.use('/api/auth', createAuthRoutes({
    controller: authController,
    requireAuth: authMiddleware.requireAuth,
    config,
  }));
  app.use('/api/resumes', createResumesRoutes({
    controller: resumesController,
    requireAuth: authMiddleware.requireAuth,
  }));
  app.use('/api/vacancies', createVacanciesRoutes({
    controller: vacanciesController,
    requireAuth: authMiddleware.requireAuth,
  }));
  app.use('/api/applications', createApplicationsRoutes({
    controller: applicationsController,
    requireAuth: authMiddleware.requireAuth,
    allowRoles: authMiddleware.allowRoles,
  }));
  app.use('/api/admin', createAdminRoutes({
    controller: adminController,
    allowRoles: authMiddleware.allowRoles,
  }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
