import { useState } from 'react';
import TextField from '../components/TextField'; 
import validateForm from '../utils/validators/validateForm';
import { hasErrors, createChangeHandler, createClearFieldError, createInitialValues } from '../utils/formUtils';
import styles from '../styles/Profile.module.scss';

const validatorConfig = {
  fullName: {
    isRequired: { message: 'Введите имя' },
    minLength: { value: 2, message: 'Имя должно быть не короче 2 символов' },
  },
  email: {
    isRequired: { message: 'Введите email' },
    isEmail: { message: 'Некорректный email' },
  },
  phone: {
    isRequired: { message: 'Введите телефон' },
    minLength: { value: 10, message: 'Телефон должен содержать минимум 10 символов' },
  },
  city: {
    isRequired: { message: 'Введите город' },
  },
};

const Profile = () => {
  const [values, setValues] = useState(
    createInitialValues(['fullName', 'email', 'phone', 'city'])
  );
  const [errors, setErrors] = useState({});

  const handleChange = createChangeHandler(setValues);
  const clearFieldError = createClearFieldError(setErrors);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm(values, validatorConfig);
    if (hasErrors(newErrors)) {
      setErrors(newErrors);
      return;
    }
    console.log('Данные формы:', values);
  };

  return (
    <div className={styles.profile}>
      <h1>Профиль</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          name="fullName"
          label="ФИО"
          value={values.fullName}
          onChange={handleChange}
          onBlur={() => clearFieldError('fullName')}
          error={errors.fullName ?? ''}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={() => clearFieldError('email')}
          error={errors.email ?? ''}
        />
        <TextField
          name="phone"
          label="Телефон"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          onBlur={() => clearFieldError('phone')}
          error={errors.phone ?? ''}
        />
        <TextField
          name="city"
          label="Город"
          value={values.city}
          onChange={handleChange}
          onBlur={() => clearFieldError('city')}
          error={errors.city ?? ''}
        />
        <button type="submit" className={styles.submitBtn}>
          Сохранить
        </button>
      </form>
    </div>
  );
};

export default Profile;
