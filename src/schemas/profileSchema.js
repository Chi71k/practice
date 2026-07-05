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

  city: z.string()
    .min(1, 'Введите город'),
});
