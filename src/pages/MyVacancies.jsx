import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  memo, useCallback, useEffect, useState,
} from 'react';
import {
  TextField, TextArea, NumberField, MultiSelect, RadioGroup,
} from '../components/form';
import { vacancySchema } from '../schemas/vacancySchema';
import * as vacanciesApi from '../api/vacanciesApi';
import { useAuth } from '../hooks/useAuth';
import { canManageVacancy } from '../utils/permissions';
import { vacancyEmploymentTypeOptions, vacancyStatusOptions } from '../constants/formOptions';
import { skillOptions } from '../constants/skillOptions';
import { ApiError } from '../api/ApiError';
import styles from '../styles/MyResumes.module.scss';

const emptyVacancy = {
  title: '',
  description: '',
  city: '',
  salaryFrom: undefined,
  salaryTo: undefined,
  employmentType: undefined,
  skills: [],
  status: 'DRAFT',
};

const VacancyForm = memo(({ initialValues, onSubmit, onCancel }) => {
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vacancySchema),
    defaultValues: initialValues ?? emptyVacancy,
  });

  const submit = async (data) => {
    setFormError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && Array.isArray(err.details)) {
        err.details.forEach((detail) => setError(detail.path, { message: detail.message }));
        return;
      }
      setFormError(err instanceof ApiError ? err.message : 'Не удалось сохранить вакансию');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <h2>{initialValues ? 'Редактировать вакансию' : 'Добавить вакансию'}</h2>

      <TextField {...register('title')} label="Название" error={errors.title?.message} />

      <TextField {...register('city')} label="Город" error={errors.city?.message} />

      <TextArea {...register('description')} label="Описание" error={errors.description?.message} />

      <Controller
        name="skills"
        control={control}
        render={({ field }) => (
          <MultiSelect
            name={field.name}
            label="Навыки"
            options={skillOptions}
            value={field.value ?? []}
            onChange={field.onChange}
            onBlur={field.onBlur}
            hint="Выбери минимум один навык"
            error={errors.skills?.message}
          />
        )}
      />

      <Controller
        name="employmentType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            name={field.name}
            label="Тип занятости"
            options={vacancyEmploymentTypeOptions}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.employmentType?.message}
          />
        )}
      />

      <NumberField
        {...register('salaryFrom')}
        label="Зарплата от"
        min={0}
        hint="Необязательно"
        error={errors.salaryFrom?.message}
      />

      <NumberField
        {...register('salaryTo')}
        label="Зарплата до"
        min={0}
        hint="Необязательно"
        error={errors.salaryTo?.message}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <RadioGroup
            name={field.name}
            label="Статус"
            options={vacancyStatusOptions}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.status?.message}
          />
        )}
      />

      {formError && <p className={styles.inlineError} role="alert">{formError}</p>}

      <div className={styles.cardActions}>
        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {initialValues ? 'Сохранить' : 'Добавить'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.editBtn}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
});

const VacancyCard = memo(({
  vacancy, canEdit, onEdit, onDelete,
}) => (
  <div className={styles.card}>
    <h3>{vacancy.title}</h3>
    <p><strong>Город:</strong> {vacancy.city}</p>
    {(!!vacancy.salaryFrom || !!vacancy.salaryTo) && (
      <p><strong>Зарплата:</strong> {vacancy.salaryFrom ?? '—'} – {vacancy.salaryTo ?? '—'}</p>
    )}
    <p className={styles.summary}>{vacancy.description}</p>
    <div className={styles.skills}>
      {vacancy.skills.map((skill) => (
        <span key={skill} className={styles.skillTag}>
          {skillOptions.find((s) => s.value === skill)?.label ?? skill}
        </span>
      ))}
    </div>
    <span className={styles.badge}>
      {vacancyStatusOptions.find((s) => s.value === vacancy.status)?.label ?? vacancy.status}
    </span>

    {canEdit && (
      <div className={styles.cardActions}>
        <button type="button" onClick={() => onEdit(vacancy)} className={styles.editBtn}>
          Редактировать
        </button>
        <button type="button" onClick={() => onDelete(vacancy.id)} className={styles.deleteBtn}>
          Удалить
        </button>
      </div>
    )}
  </div>
));

const MyVacancies = () => {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState([]);
  const [status, setStatus] = useState('idle');
  const [listError, setListError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setStatus('loading');
      try {
        const data = await vacanciesApi.getMyVacancies({ signal: controller.signal });
        setVacancies(data);
        setStatus('succeeded');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setStatus('failed');
      }
    };

    load();
    return () => controller.abort();
  }, [reloadKey]);

  const editingVacancy = vacancies.find((vacancy) => vacancy.id === editingId) ?? null;

  const handleCreate = useCallback(async (data) => {
    await vacanciesApi.createVacancy(data);
    refresh();
  }, []);

  const handleUpdate = useCallback(async (data) => {
    await vacanciesApi.updateVacancy(editingId, data);
    setEditingId(null);
    refresh();
  }, [editingId]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Удалить вакансию? Отклики на неё также будут удалены.')) return;
    setListError(null);
    try {
      await vacanciesApi.deleteVacancy(id);
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setListError('Не удалось удалить вакансию из-за связанных данных.');
      } else {
        setListError('Не удалось удалить вакансию.');
      }
    }
  }, []);

  return (
    <div className={styles.page}>
      <h1>Мои вакансии</h1>

      {editingVacancy ? (
        <VacancyForm
          key={editingVacancy.id}
          initialValues={editingVacancy}
          onSubmit={handleUpdate}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <VacancyForm key="new" onSubmit={handleCreate} />
      )}

      <div className={styles.list}>
        <h2>Мои вакансии</h2>

        {listError && <p className={styles.inlineError} role="alert">{listError}</p>}
        {status === 'loading' && <p>Загрузка...</p>}
        {status === 'failed' && <p>Не удалось загрузить вакансии.</p>}
        {status === 'succeeded' && vacancies.length === 0 && <p>Вакансий ещё нет</p>}

        {vacancies.map((vacancy) => (
          <VacancyCard
            key={vacancy.id}
            vacancy={vacancy}
            canEdit={canManageVacancy(user, vacancy)}
            onEdit={(v) => setEditingId(v.id)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MyVacancies;
