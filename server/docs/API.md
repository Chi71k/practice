# API contract

Base URL:

```text
http://localhost:3001/api
```

## Frontend request

Cookie не читается JavaScript-кодом. Browser отправляет её автоматически:

```js
const response = await fetch('http://localhost:3001/api/auth/me', {
  credentials: 'include',
});
```

Для JSON:

```js
await fetch('http://localhost:3001/api/resumes', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

## Формат ответа

Успех:

```json
{
  "data": {}
}
```

Коллекция с pagination:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

Ошибка:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Запрос не прошёл валидацию",
    "details": [
      { "path": "email", "message": "Invalid email address" }
    ]
  }
}
```

## Статусы

- `200` — успешное чтение/изменение/удаление;
- `201` — ресурс создан;
- `400` — некорректный JSON;
- `401` — нет действующей session;
- `403` — роль пользователя явно не позволяет выполнить действие;
- `404` — endpoint/resource не найден либо чужой private resource скрыт от вызывающего;
- `409` — duplicate/conflict/resource in use;
- `413` — JSON body превышает `100kb`;
- `415` — неподдерживаемый `Content-Type` или `Content-Encoding`;
- `422` — validation error;
- `429` — rate limit;
- `500` — внутренняя ошибка без утечки деталей.

## Authentication

### `POST /auth/register`

```json
{
  "email": "student@example.test",
  "password": "StrongPassword123!",
  "name": "Student",
  "role": "CANDIDATE"
}
```

`role`: только `CANDIDATE` или `EMPLOYER`. Пароль — 8–128 символов и не более 72 байт UTF-8. Ответ `201`, session cookie устанавливается автоматически.

### `POST /auth/login`

```json
{
  "email": "candidate@example.test",
  "password": "Candidate123!"
}
```

Ответ содержит public user и устанавливает новую session cookie. Другие активные sessions пользователя сохраняются.

### `GET /auth/me`

Требует session. Возвращает текущего public user.

### `PATCH /auth/me`

Изменяет `name` и/или `email` текущего пользователя.

### `PATCH /auth/me/password`

```json
{
  "currentPassword": "Candidate123!",
  "newPassword": "NewStrongPassword123!"
}
```

После успешной смены пароля все sessions пользователя отзываются, cookie очищается, требуется повторный login.

### `POST /auth/logout`

Принимает JSON `{}`, удаляет текущую session из SQLite и очищает cookie.

## Resumes

### `GET /resumes`

Публичный список только опубликованных resumes.

Query:

```text
page, limit, search, city
```

### `GET /resumes/:id`

Публично возвращает опубликованный resume. Draft доступен owner и ADMIN.

### `GET /resumes/mine`

Только CANDIDATE. Возвращает resumes текущего пользователя.

### `POST /resumes`

Только CANDIDATE.

```json
{
  "title": "Frontend Developer",
  "summary": "Описание опыта минимум десять символов.",
  "city": "Astana",
  "salary": 500000,
  "skills": ["JavaScript", "React"],
  "isPublished": true
}
```

### `PATCH /resumes/:id`

Owner или ADMIN. Body содержит минимум одно поле create-схемы.

### `DELETE /resumes/:id`

Owner или ADMIN. Resume, используемый application, не удаляется и возвращает `409`.

## Vacancies

### `GET /vacancies`

Публичный список только `PUBLISHED`.

Query:

```text
page, limit, search, city, employmentType
```

`employmentType`: `OFFICE`, `REMOTE`, `HYBRID`.

### `GET /vacancies/:id`

Draft/closed доступны owner и ADMIN; опубликованная vacancy публична.

### `GET /vacancies/mine`

Только EMPLOYER.

### `POST /vacancies`

Только EMPLOYER.

```json
{
  "title": "React Developer",
  "description": "Подробное описание вакансии.",
  "city": "Almaty",
  "salaryFrom": 400000,
  "salaryTo": 800000,
  "employmentType": "HYBRID",
  "skills": ["JavaScript", "React"],
  "status": "PUBLISHED"
}
```

`status`: `DRAFT`, `PUBLISHED`, `CLOSED`.

### `PATCH /vacancies/:id`

Owner employer или ADMIN.

### `DELETE /vacancies/:id`

Owner employer или ADMIN. Applications удаляются каскадно вместе с vacancy.

## Applications

Все endpoints требуют session.

### `GET /applications`

- CANDIDATE видит свои;
- EMPLOYER видит отклики на свои vacancies;
- ADMIN видит все.

Все роли получают pagination через `page`, `limit` и объект `meta`.

### `GET /applications/:id`

Доступ: candidate отклика, employer вакансии, ADMIN.

### `POST /applications`

Только CANDIDATE.

```json
{
  "vacancyId": "vacancy-id",
  "resumeId": "resume-id",
  "coverLetter": "Сопроводительное письмо"
}
```

Условия:

- vacancy опубликована;
- resume принадлежит текущему candidate;
- один candidate может отправить только один application на vacancy.

### `PATCH /applications/:id/status`

Employer вакансии или ADMIN.

```json
{
  "status": "REVIEWING"
}
```

Допустимы: `REVIEWING`, `REJECTED`, `ACCEPTED`. Статусы `REJECTED`, `ACCEPTED`, `WITHDRAWN` финальные.

### `POST /applications/:id/withdraw`

Candidate отправляет JSON `{}` и отзывает свой `SUBMITTED` или `REVIEWING` application.

### `DELETE /applications/:id`

Только ADMIN.

## Admin

Все endpoints требуют роль ADMIN.

### `GET /admin/users`

Query: `page`, `limit`.

### `POST /admin/users`

Создаёт пользователя без автоматического login. Body: `email`, `password`, `name`, `role`.

### `GET /admin/users/:id`

Возвращает public user.

### `PATCH /admin/users/:id`

Изменяет `name` и/или `email`.

### `PATCH /admin/users/:id/role`

```json
{
  "role": "EMPLOYER"
}
```

Допустимы `CANDIDATE`, `EMPLOYER`, `ADMIN`. Смена роли возвращает `409`, если у пользователя есть role-specific данные или понижается последний ADMIN. При фактическом изменении роли активные sessions целевого пользователя отзываются. Повторная установка уже текущей роли является idempotent no-op и сохраняет sessions.

### `DELETE /admin/users/:id`

Физически удаляет пользователя без domain-данных. Возвращает `409` для собственной admin-учётной записи, последнего ADMIN или пользователя со связанными resumes, vacancies, applications.

## Permission matrix

| Действие | CANDIDATE | EMPLOYER | ADMIN |
|---|---:|---:|---:|
| Читать published resumes | Да | Да | Да |
| Создать resume | Да | Нет | Нет |
| Изменить чужой resume | Нет | Нет | Да |
| Читать published vacancies | Да | Да | Да |
| Создать vacancy | Нет | Да | Нет |
| Изменить чужую vacancy | Нет | Нет | Да |
| Создать application | Да | Нет | Нет |
| Изменить application status | Нет | Для своей vacancy | Да |
| Управлять users/roles | Нет | Нет | Да |
