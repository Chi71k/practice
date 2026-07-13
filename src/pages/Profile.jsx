import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { TextField, Select, TextArea, RadioGroup, Checkbox, NumberField } from '../components/form';
import { profileSchema } from '../schemas/profileSchema';
import { cityOptions, experienceLevelOptions } from '../constants/formOptions';
import styles from '../styles/Profile.module.scss';

const Profile = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      city: '',
      bio: '',
      experienceLevel: undefined,
      openToOffers: false,
      salaryExpectation: undefined,
    },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('profile');
      if (saved) {
        reset(JSON.parse(saved));
      }
    } catch {
      console.error('Ошибка загрузки профиля');
    }
  }, [reset]);

  const onSubmit = (data) => {
    try {
      localStorage.setItem('profile', JSON.stringify(data));
    } catch {
      console.error('Ошибка сохранения профиля');
    }
  };

  return (
    <div className={styles.profile}>
      <h1>Профиль</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <TextField {...register('fullName')} label="ФИО" required error={errors.fullName?.message} />
        <TextField {...register('email')} label="Email" type="email" required error={errors.email?.message} />
        <TextField {...register('phone')} label="Телефон" type="tel" required error={errors.phone?.message} />

        <Select
          {...register('city')}
          label="Город"
          options={cityOptions}
          placeholder="Выберите город"
          required
          error={errors.city?.message}
        />

        <TextArea
          {...register('bio')}
          label="О себе"
          hint="Минимум 10 символов"
          required
          error={errors.bio?.message}
        />

        <Controller
          name="experienceLevel"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              label="Уровень опыта"
              options={experienceLevelOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              required
              error={errors.experienceLevel?.message}
            />
          )}
        />

        <Controller
          name="openToOffers"
          control={control}
          render={({ field }) => (
            <Checkbox
              name={field.name}
              label="Открыт к предложениям"
              checked={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.openToOffers?.message}
            />
          )}
        />

        <NumberField
          {...register('salaryExpectation')}
          label="Ожидаемая зарплата"
          min={0}
          max={10000000}
          hint="Необязательное поле"
          error={errors.salaryExpectation?.message}
        />

        <button type="submit" className={styles.submitBtn}>
          Сохранить
        </button>
      </form>
    </div>
  );
};

export default Profile;
