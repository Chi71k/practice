import { z } from 'zod';

export const resumeSchema = z.object({
  title: z.string().min(1, 'Введите название').min(2, 'Минимум 2 символа').max(150),
  summary: z.string().min(1, 'Опишите опыт').min(10, 'Минимум 10 символов').max(5000),
  city: z.string().min(1, 'Выберите город'),

  salary: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().min(0, 'Не может быть отрицательной').optional(),
  ),

  skills: z.array(z.string()).min(1, 'Выберите хотя бы один навык').max(30),

  isPublished: z.boolean(),
});
