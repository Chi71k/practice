import { z } from 'zod';

export const resumeSchema = z.object({
  fullName: z.string().min(1, 'Введите ФИО').min(2, 'Минимум 2 символа'),
  position: z.string().min(1, 'Введите позицию'),
  city: z.string().min(1, 'Выберите город'),

  age: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: 'Введите возраст' })
      .min(16, 'Возраст не менее 16 лет')
      .max(80, 'Возраст не более 80 лет'),
  ),

  experience: z.string().min(1, 'Введите опыт'),
  about: z.string().min(1, 'Введите информацию о себе').min(10, 'Минимум 10 символов'),
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  phone: z.string().min(1, 'Введите телефон').min(10, 'Минимум 10 символов'),

  skills: z.array(z.string()).min(1, 'Выберите хотя бы один навык'),

  employmentType: z.enum(['office', 'remote', 'hybrid'], {
    message: 'Выберите тип занятости',
  }),

  relocate: z.boolean(),

  salary: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0, 'Не может быть отрицательной').optional(),
  ),
});
