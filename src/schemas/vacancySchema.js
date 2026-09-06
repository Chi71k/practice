import { z } from 'zod';

export const vacancySchema = z.object({
  title: z.string().min(1, 'Введите название').min(2, 'Минимум 2 символа').max(150),
  description: z.string().min(1, 'Опишите вакансию').min(10, 'Минимум 10 символов').max(10000),
  city: z.string().min(1, 'Выберите город'),

  salaryFrom: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().min(0, 'Не может быть отрицательной').optional(),
  ),
  salaryTo: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().min(0, 'Не может быть отрицательной').optional(),
  ),

  employmentType: z.enum(['OFFICE', 'REMOTE', 'HYBRID'], {
    message: 'Выберите тип занятости',
  }),

  skills: z.array(z.string()).min(1, 'Выберите хотя бы один навык').max(30),

  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED'], {
    message: 'Выберите статус',
  }),
}).refine(
  (value) => value.salaryFrom == null || value.salaryTo == null || value.salaryFrom <= value.salaryTo,
  { message: 'Зарплата "от" не может быть больше "до"', path: ['salaryTo'] },
);
