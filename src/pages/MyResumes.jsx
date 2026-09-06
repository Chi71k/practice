import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  memo, useCallback, useMemo, useState,
} from 'react';
import {
  TextField, TextArea, NumberField, MultiSelect, Checkbox,
} from '../components/form';
import ResumeCard from '../components/resumes/ResumeCard';
import { resumeSchema } from '../schemas/resumeSchema';
import { useMyResumes } from '../hooks/useMyResumes';
import { useAuth } from '../hooks/useAuth';
import { useResumeFilters } from '../hooks/useResumeFilters';
import { filterAndSortResumes } from '../utils/filterAndSortResumes';
import { canEditResume } from '../utils/permissions';
import { skillOptions } from '../constants/skillOptions';
import { ApiError } from '../api/ApiError';
import styles from '../styles/MyResumes.module.scss';

const emptyResume = {
  title: '',
  summary: '',
  city: '',
  salary: undefined,
  skills: [],
  isPublished: false,
};

const ResumeForm = memo(({ initialValues, onSubmit, onCancel }) => {
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: initialValues ?? emptyResume,
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
      setFormError(err instanceof ApiError ? err.message : 'Не удалось сохранить резюме');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <h2>{initialValues ? 'Редактировать резюме' : 'Добавить резюме'}</h2>

      <TextField {...register('title')} label="Название" error={errors.title?.message} />

      <TextField {...register('city')} label="Город" error={errors.city?.message} />

      <TextArea {...register('summary')} label="Опыт и навыки" error={errors.summary?.message} />

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

      <NumberField
        {...register('salary')}
        label="Ожидаемая зарплата"
        min={0}
        hint="Необязательно"
        error={errors.salary?.message}
      />

      <Controller
        name="isPublished"
        control={control}
        render={({ field }) => (
          <Checkbox
            name={field.name}
            label="Опубликовать резюме"
            checked={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.isPublished?.message}
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

const MyResumes = () => {
  const {
    resumes, status, createResume, updateResume, deleteResume,
  } = useMyResumes();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [listError, setListError] = useState(null);
  const {
    filters, search, setSearch, city, setCity, sortBy, setSortBy, isActive, reset: resetFilters,
  } = useResumeFilters();

  const visibleResumes = useMemo(
    () => filterAndSortResumes(resumes, filters),
    [resumes, filters],
  );

  const editingResume = resumes.find((resume) => resume.id === editingId) ?? null;

  const handleCreate = useCallback(async (data) => {
    await createResume(data);
  }, [createResume]);

  const handleUpdate = useCallback(async (data) => {
    await updateResume(editingId, data);
    setEditingId(null);
  }, [editingId, updateResume]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Удалить резюме? Это действие необратимо.')) return;
    setListError(null);
    try {
      await deleteResume(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setListError('Нельзя удалить резюме: на него уже есть отклик.');
      } else {
        setListError('Не удалось удалить резюме.');
      }
    }
  }, [deleteResume]);

  return (
    <div className={styles.page}>
      <h1>Мои резюме</h1>

      {editingResume ? (
        <ResumeForm
          key={editingResume.id}
          initialValues={editingResume}
          onSubmit={handleUpdate}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <ResumeForm key="new" onSubmit={handleCreate} />
      )}

      <div className={styles.list}>
        <div className={styles.listHeader}>
          <h2>Сохранённые резюме</h2>
        </div>

        {listError && <p className={styles.inlineError} role="alert">{listError}</p>}

        {status === 'loading' && <p>Загрузка...</p>}
        {status === 'failed' && <p>Не удалось загрузить резюме.</p>}

        {resumes.length > 0 && (
          <div className={styles.filters}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или описанию"
              className={styles.filterInput}
            />

            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Город"
              className={styles.filterInput}
            />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.filterSelect}>
              <option value="">Без сортировки</option>
              <option value="salary">По зарплате (выше сначала)</option>
            </select>

            {isActive && (
              <button type="button" onClick={resetFilters} className={styles.filterResetBtn}>
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {status === 'succeeded' && resumes.length === 0 && <p>Резюме ещё нет</p>}
        {resumes.length > 0 && visibleResumes.length === 0 && <p>Ничего не найдено</p>}

        {visibleResumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            canEdit={canEditResume(user, resume)}
            onEdit={(r) => setEditingId(r.id)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MyResumes;
