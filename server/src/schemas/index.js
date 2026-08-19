import { z } from 'zod';

const id = z.string().min(1).max(100);
const email = z.email().max(254);
const bcryptPassword = (schema) => schema.refine(
  (value) => Buffer.byteLength(value, 'utf8') <= 72,
  'Пароль не должен превышать 72 байта в UTF-8',
);
const password = bcryptPassword(z.string().min(8).max(128));
const loginPassword = bcryptPassword(z.string().min(1).max(128));
const name = z.string().trim().min(2).max(100);
const skills = z.array(z.string().trim().min(1).max(50)).max(30);
const nullableMoney = z.number().int().min(0).max(1_000_000_000).nullable().optional();

export const idParamsSchema = z.object({ id });

export const registerSchema = z.strictObject({
  email,
  password,
  name,
  role: z.enum(['CANDIDATE', 'EMPLOYER']).default('CANDIDATE'),
});

export const loginSchema = z.strictObject({
  email,
  password: loginPassword,
});

export const updateProfileSchema = z.strictObject({
  email: email.optional(),
  name: name.optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'Передайте хотя бы одно поле для обновления',
});

export const changePasswordSchema = z.strictObject({
  currentPassword: loginPassword,
  newPassword: password,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
});

const resumeFields = {
  title: z.string().trim().min(2).max(150),
  summary: z.string().trim().min(10).max(5000),
  city: z.string().trim().min(2).max(100),
  salary: nullableMoney,
  skills,
  isPublished: z.boolean(),
};

export const createResumeSchema = z.strictObject({
  ...resumeFields,
  skills: skills.default([]),
  isPublished: z.boolean().default(false),
});
export const updateResumeSchema = z.strictObject({
  ...Object.fromEntries(
    Object.entries(resumeFields).map(([key, schema]) => [key, schema.optional()]),
  ),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'Передайте хотя бы одно поле для обновления',
});

export const resumeListQuerySchema = paginationQuerySchema;

const vacancyFields = {
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(10_000),
  city: z.string().trim().min(2).max(100),
  salaryFrom: nullableMoney,
  salaryTo: nullableMoney,
  employmentType: z.enum(['OFFICE', 'REMOTE', 'HYBRID']),
  skills,
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']),
};

const salaryRangeIsValid = (value) => (
  value.salaryFrom == null
  || value.salaryTo == null
  || value.salaryFrom <= value.salaryTo
);

export const createVacancySchema = z.strictObject({
  ...vacancyFields,
  skills: skills.default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).default('DRAFT'),
}).refine(salaryRangeIsValid, {
  message: 'salaryFrom не может быть больше salaryTo',
  path: ['salaryTo'],
});

export const updateVacancySchema = z.strictObject({
  ...Object.fromEntries(
    Object.entries(vacancyFields).map(([key, schema]) => [key, schema.optional()]),
  ),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'Передайте хотя бы одно поле для обновления',
}).refine(salaryRangeIsValid, {
  message: 'salaryFrom не может быть больше salaryTo',
  path: ['salaryTo'],
});

export const vacancyListQuerySchema = paginationQuerySchema.extend({
  employmentType: z.enum(['OFFICE', 'REMOTE', 'HYBRID']).optional(),
});

export const createApplicationSchema = z.strictObject({
  vacancyId: id,
  resumeId: id,
  coverLetter: z.string().trim().max(5000).default(''),
});

export const updateApplicationStatusSchema = z.strictObject({
  status: z.enum(['REVIEWING', 'REJECTED', 'ACCEPTED']),
});

export const updateUserRoleSchema = z.strictObject({
  role: z.enum(['CANDIDATE', 'EMPLOYER', 'ADMIN']),
});

export const adminCreateUserSchema = z.strictObject({
  email,
  password,
  name,
  role: z.enum(['CANDIDATE', 'EMPLOYER', 'ADMIN']),
});

export const adminUpdateUserSchema = z.strictObject({
  email: email.optional(),
  name: name.optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'Передайте хотя бы одно поле для обновления',
});
