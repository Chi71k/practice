import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import TextField from '../components/TextField';
import { profileSchema } from '../schemas/profileSchema';
import styles from '../styles/Profile.module.scss';

const Profile = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const saved = localStorage.getItem('profile');
    if (saved) {
      reset(JSON.parse(saved));
    }
  }, []);

  const onSubmit = (data) => {
    localStorage.setItem('profile', JSON.stringify(data));
    console.log('Данные формы:', data);
  };

  return (
    <div className={styles.profile}>
      <h1>Профиль</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <TextField
          {...register('fullName')}
          label="ФИО"
          error={errors.fullName?.message}
        />
        <TextField
          {...register('email')}
          label="Email"
          type="email"
          error={errors.email?.message}
        />
        <TextField
          {...register('phone')}
          label="Телефон"
          type="tel"
          error={errors.phone?.message}
        />
        <TextField
          {...register('city')}
          label="Город"
          error={errors.city?.message}
        />
        <button type="submit" className={styles.submitBtn}>
          Сохранить
        </button>
      </form>
    </div>
  );
};

export default Profile;
