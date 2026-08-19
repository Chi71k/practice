import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { TextField } from '../components/form';
import { loginSchema } from '../schemas/loginSchema';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Login.module.scss';

const Login = () => {
  const {
    status, error, isAuthenticated, login, clearError,
  } = useAuth();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => () => {
    abortControllerRef.current?.abort();
  }, []);

  const onSubmit = useCallback(async (data) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await login(data, { signal: controller.signal });
      navigate('/profile');
    } catch (err) {
      void err;
    }
  }, [login, navigate]);

  const handleFormSubmit = useCallback((event) => {
    handleSubmit(onSubmit)(event);
  }, [handleSubmit, onSubmit]);

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const usernameField = register('username');
  const passwordField = register('password');

  const handleFieldChange = (field) => (event) => {
    field.onChange(event);
    if (error) clearError();
  };

  return (
    <div className={styles.login}>
      <h1>Вход</h1>
      <form onSubmit={handleFormSubmit} noValidate className={styles.form}>
        <TextField
          {...usernameField}
          onChange={handleFieldChange(usernameField)}
          label="Логин"
          placeholder="emilys"
          error={errors.username?.message}
        />

        <TextField
          {...passwordField}
          onChange={handleFieldChange(passwordField)}
          label="Пароль"
          type="password"
          error={errors.password?.message}
        />

        {error && <p className={styles.apiError} role="alert">{error}</p>}

        <button type="submit" disabled={status === 'loading'} className={styles.submitBtn}>
          {status === 'loading' ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default Login;
