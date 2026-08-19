# Practice Learning API

Локальный backend для учебного React-проекта: регистрация, cookie-сессии, CRUD и базовый RBAC.

## Стек

- Node.js 22+ (рекомендуется актуальная LTS);
- Express 5;
- SQLite через `better-sqlite3`;
- Zod;
- HttpOnly session cookie;
- Vitest + Supertest.

## Первый запуск

Из корня проекта:

```bash
npm run server:install
cp server/.env.example server/.env
npm run server:reset
npm run server:dev
```

Или из `server/`:

```bash
npm install
cp .env.example .env
npm run db:reset
npm run dev
```

API: `http://localhost:3001/api`

Health check:

```bash
curl http://localhost:3001/api/health
```

## Настройки окружения

```dotenv
HOST=127.0.0.1
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/practice.sqlite
SESSION_TTL_HOURS=168
NODE_ENV=development
```

- `HOST=127.0.0.1` ограничивает учебный API loopback-интерфейсом. Внешний bind включайте только осознанно.
- `CLIENT_ORIGIN` должен точно совпадать с origin frontend.
- Для cookie-запросов frontend передаёт `credentials: 'include'`.
- В production cookie автоматически получает `Secure`; локальная разработка работает по HTTP.

## Seed-аккаунты

| Роль | Email | Пароль |
|---|---|---|
| CANDIDATE | `candidate@example.test` | `Candidate123!` |
| EMPLOYER | `employer@example.test` | `Employer123!` |
| ADMIN | `admin@example.test` | `Admin123!` |

Это только локальные учебные credentials.

## Команды

```bash
npm run dev          # сервер с Node watch mode
npm start            # обычный запуск
npm run db:migrate   # применить новые миграции
npm run db:seed      # перезаписать данные seed-набором
npm run db:reset     # удалить DB, мигрировать и заполнить seed
npm test             # интеграционные тесты
npm run test:watch
npm run lint
```

## Быстрая проверка cookie-сессии

```bash
curl -i -c /tmp/practice-cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"email":"candidate@example.test","password":"Candidate123!"}' \
  http://localhost:3001/api/auth/login

curl -i -b /tmp/practice-cookies.txt \
  http://localhost:3001/api/auth/me

curl -i -b /tmp/practice-cookies.txt -c /tmp/practice-cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{}' \
  http://localhost:3001/api/auth/logout
```

## Документация

- [API contract](docs/API.md)
- [Architecture and security model](docs/ARCHITECTURE.md)

## Важные ограничения

Это локальный учебный backend, а не production identity provider.

Для production дополнительно нужны:

- HTTPS и secure deployment configuration;
- централизованный session store для нескольких инстансов;
- полноценная CSRF-модель;
- password reset и email verification;
- аудит действий, мониторинг и secret management;
- backup/migration strategy;
- более строгие abuse-prevention и account-lockout правила.
