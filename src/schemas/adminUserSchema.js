import { z } from 'zod';

export const adminCreateUserSchema = z.object({
  email: z.email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов').max(128),
  name: z.string().min(2, 'Минимум 2 символа').max(100),
  role: z.enum(['CANDIDATE', 'EMPLOYER', 'ADMIN'], { message: 'Выберите роль' }),
});
