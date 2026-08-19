CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CANDIDATE', 'EMPLOYER', 'ADMIN')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE resumes (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  city TEXT NOT NULL,
  salary INTEGER,
  skills TEXT NOT NULL DEFAULT '[]',
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX resumes_owner_id_idx ON resumes(owner_id);
CREATE INDEX resumes_published_idx ON resumes(is_published);
CREATE INDEX resumes_city_idx ON resumes(city);

CREATE TABLE vacancies (
  id TEXT PRIMARY KEY,
  employer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  salary_from INTEGER,
  salary_to INTEGER,
  employment_type TEXT NOT NULL
    CHECK (employment_type IN ('OFFICE', 'REMOTE', 'HYBRID')),
  skills TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (salary_from IS NULL OR salary_from >= 0),
  CHECK (salary_to IS NULL OR salary_to >= 0),
  CHECK (salary_from IS NULL OR salary_to IS NULL OR salary_from <= salary_to)
);

CREATE INDEX vacancies_employer_id_idx ON vacancies(employer_id);
CREATE INDEX vacancies_status_idx ON vacancies(status);
CREATE INDEX vacancies_city_idx ON vacancies(city);

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  vacancy_id TEXT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE RESTRICT,
  cover_letter TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'SUBMITTED'
    CHECK (status IN ('SUBMITTED', 'REVIEWING', 'REJECTED', 'ACCEPTED', 'WITHDRAWN')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(candidate_id, vacancy_id)
);

CREATE INDEX applications_candidate_id_idx ON applications(candidate_id);
CREATE INDEX applications_vacancy_id_idx ON applications(vacancy_id);
CREATE INDEX applications_resume_id_idx ON applications(resume_id);
