import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string()
    .min(1, 'Введите имя')
    .min(2, 'Имя должно быть не короче 2 символов'),

  email: z.string()
    .min(1, 'Введите email')
    .email('Некорректный email'),

  phone: z.string()
    .min(1, 'Введите телефон')
    .min(10, 'Телефон должен содержать минимум 10 символов'),

  city: z.string().min(1, 'Выберите город'),

  bio: z.string()
    .min(1, 'Расскажите о себе')
    .min(10, 'Минимум 10 символов'),

  experienceLevel: z.enum(['junior', 'middle', 'senior'], {
    message: 'Выберите уровень',
  }),

  openToOffers: z.boolean(),

  salaryExpectation: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number()
      .min(0, 'Не может быть отрицательной')
      .max(10_000_000, 'Слишком большое число')
      .optional(),
  ),
});
