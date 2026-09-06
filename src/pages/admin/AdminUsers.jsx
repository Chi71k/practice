import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { TextField, Select } from '../../components/form';
import { adminCreateUserSchema } from '../../schemas/adminUserSchema';
import * as adminApi from '../../api/adminApi';
import { ApiError } from '../../api/ApiError';
import Pagination from '../../components/Pagination';
import styles from '../../styles/AdminUsers.module.scss';

const ROLE_OPTIONS = [
  { value: 'CANDIDATE', label: 'Кандидат' },
  { value: 'EMPLOYER', label: 'Работодатель' },
  { value: 'ADMIN', label: 'Администратор' },
];

const LIMIT = 20;

const formatConflictMessage = (err) => {
  const { details } = err;
  if (details && typeof details === 'object') {
    const parts = Object.entries(details)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => `${key}: ${count}`);
    if (parts.length) return `${err.message} (${parts.join(', ')})`;
  }
  return err.message;
};

const describeMutationError = (err) => {
  if (err instanceof ApiError) {
    if (err.status === 409) return formatConflictMessage(err);
    return err.message || `Ошибка (${err.status})`;
  }
  return 'Нет соединения с сервером.';
};

const CreateUserForm = ({ onCreated }) => {
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      email: '', password: '', name: '', role: 'CANDIDATE',
    },
  });

  const submit = async (data) => {
    setFormError(null);
    try {
      const user = await adminApi.createUser(data);
      reset();
      onCreated(user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && Array.isArray(err.details)) {
        err.details.forEach((detail) => setError(detail.path, { message: detail.message }));
        return;
      }
      setFormError(describeMutationError(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <TextField {...register('name')} label="Имя" error={errors.name?.message} />
      <TextField {...register('email')} label="Email" type="email" error={errors.email?.message} />
      <TextField {...register('password')} label="Пароль" type="password" error={errors.password?.message} />
      <Select
        {...register('role')}
        label="Роль"
        options={ROLE_OPTIONS}
        error={errors.role?.message}
      />

      {formError && <p className={`${styles.banner} ${styles.bannerError}`} role="alert">{formError}</p>}

      <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
        Создать пользователя
      </button>
    </form>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('idle');
  const [rowErrors, setRowErrors] = useState({});

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setStatus('loading');
      try {
        const { data, meta: responseMeta } = await adminApi.getUsers(
          { page, limit: LIMIT },
          { signal: controller.signal },
        );
        setUsers(data);
        setMeta(responseMeta);
        setStatus('succeeded');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setStatus('failed');
      }
    };

    load();
    return () => controller.abort();
  }, [page, reloadKey]);

  const setRowError = (id, message) => {
    setRowErrors((prev) => ({ ...prev, [id]: message }));
  };

  const handleRoleChange = async (userItem, nextRole) => {
    if (!nextRole || nextRole === userItem.role) return;
    if (!window.confirm(`Сменить роль пользователя ${userItem.email} на ${nextRole}? Активные сессии пользователя будут отозваны.`)) {
      return;
    }
    setRowError(userItem.id, null);
    try {
      await adminApi.updateUserRole(userItem.id, nextRole);
      refresh();
    } catch (err) {
      setRowError(userItem.id, describeMutationError(err));
    }
  };

  const handleDelete = async (userItem) => {
    if (!window.confirm(`Удалить пользователя ${userItem.email}? Это необратимо.`)) return;
    setRowError(userItem.id, null);
    try {
      await adminApi.deleteUser(userItem.id);
      refresh();
    } catch (err) {
      setRowError(userItem.id, describeMutationError(err));
    }
  };

  return (
    <div className={styles.page}>
      <h1>Управление пользователями</h1>

      <h2>Создать пользователя</h2>
      <CreateUserForm onCreated={refresh} />

      <h2>Пользователи</h2>

      {status === 'loading' && <p>Загрузка...</p>}
      {status === 'failed' && <p>Не удалось загрузить пользователей.</p>}

      {status === 'succeeded' && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem) => (
              <tr key={userItem.id}>
                <td>{userItem.name}</td>
                <td>{userItem.email}</td>
                <td>
                  <select
                    className={styles.roleSelect}
                    value={userItem.role}
                    onChange={(e) => handleRoleChange(userItem, e.target.value)}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(userItem)}
                  >
                    Удалить
                  </button>
                  {rowErrors[userItem.id] && (
                    <p className={styles.rowError} role="alert">{rowErrors[userItem.id]}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {meta && meta.pages > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.pages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default AdminUsers;
