import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  memo, useCallback, useMemo, useState,
} from 'react';
import {
  TextField, TextArea, Select, MultiSelect, NumberField, RadioGroup, Checkbox,
} from '../components/form';
import ResumeCard from '../components/resumes/ResumeCard';
import { resumeSchema } from '../schemas/resumeSchema';
import { useMyResumes } from '../hooks/useMyResumes';
import { useResumeFilters } from '../hooks/useResumeFilters';
import { filterAndSortResumes } from '../utils/filterAndSortResumes';
import { cityOptions, positionOptions, employmentTypeOptions } from '../constants/formOptions';
import { skillOptions } from '../constants/skillOptions';
import styles from '../styles/MyResumes.module.scss';

const emptyResume = {
  fullName: '',
  position: '',
  city: '',
  age: undefined,
  experience: '',
  about: '',
  email: '',
  phone: '',
  skills: [],
  employmentType: undefined,
  relocate: false,
  salary: undefined,
};

const AddResumeForm = memo(({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: emptyResume,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <h2>Добавить резюме</h2>

      <TextField {...register('fullName')} label="ФИО" error={errors.fullName?.message} />

      <Select
        {...register('position')}
        label="Позиция"
        options={positionOptions}
        placeholder="Выберите позицию"
        error={errors.position?.message}
      />

      <Select
        {...register('city')}
        label="Город"
        options={cityOptions}
        placeholder="Выберите город"
        error={errors.city?.message}
      />

      <NumberField {...register('age')} label="Возраст" min={16} max={80} error={errors.age?.message} />

      <TextField {...register('experience')} label="Опыт" error={errors.experience?.message} />

      <TextArea {...register('about')} label="О себе" error={errors.about?.message} />

      <TextField {...register('email')} label="Email" type="email" error={errors.email?.message} />

      <TextField {...register('phone')} label="Телефон" type="tel" error={errors.phone?.message} />

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
            options={employmentTypeOptions}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.employmentType?.message}
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
        name="relocate"
        control={control}
        render={({ field }) => (
          <Checkbox
            name={field.name}
            label="Готов к релокации"
            checked={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.relocate?.message}
          />
        )}
      />

      <button type="submit" className={styles.submitBtn}>
        Добавить
      </button>
    </form>
  );
});

const MyResumes = () => {
  const { resumes, addResume, deleteResume, clearResumes } = useMyResumes();
  const {
    filters, search, setSearch, city, setCity,
    employmentType, setEmploymentType, sortBy, setSortBy, isActive, reset: resetFilters,
  } = useResumeFilters();
  const [formKey, setFormKey] = useState(0);

  const visibleResumes = useMemo(
    () => filterAndSortResumes(resumes, filters),
    [resumes, filters],
  );

  const handleAdd = useCallback((data) => {
    const resume = {
      id: crypto.randomUUID(),
      fullName: data.fullName,
      position: data.position,
      city: data.city,
      age: data.age,
      salary: data.salary ?? 0,
      experience: data.experience,
      about: data.about,
      skills: data.skills,
      employmentType: data.employmentType,
      relocate: data.relocate,
      contacts: {
        email: data.email,
        phone: data.phone,
      },
    };

    addResume(resume);
    setFormKey((key) => key + 1);
  }, [addResume]);

  const handleDelete = useCallback((id) => {
    deleteResume(id);
  }, [deleteResume]);

  const handleClearAll = () => {
    if (window.confirm('Удалить все резюме? Это действие необратимо.')) {
      clearResumes();
    }
  };

  return (
    <div className={styles.page}>
      <h1>Мои резюме</h1>

      <AddResumeForm key={formKey} onSubmit={handleAdd} />

      <div className={styles.list}>
        <div className={styles.listHeader}>
          <h2>Сохранённые резюме</h2>
          {resumes.length > 0 && (
            <button type="button" onClick={handleClearAll} className={styles.deleteAllBtn}>
              Удалить все резюме
            </button>
          )}
        </div>

        {resumes.length > 0 && (
          <div className={styles.filters}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО или позиции"
              className={styles.filterInput}
            />

            <select value={city} onChange={(e) => setCity(e.target.value)} className={styles.filterSelect}>
              <option value="">Все города</option>
              {cityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Любая занятость</option>
              {employmentTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.filterSelect}>
              <option value="">Без сортировки</option>
              <option value="age">По возрасту</option>
              <option value="salary">По зарплате (выше сначала)</option>
            </select>

            {isActive && (
              <button type="button" onClick={resetFilters} className={styles.filterResetBtn}>
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {resumes.length === 0 && <p>Резюме ещё нет</p>}
        {resumes.length > 0 && visibleResumes.length === 0 && <p>Ничего не найдено</p>}

        {visibleResumes.map((resume) => (
          <ResumeCard key={resume.id} resume={resume} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default MyResumes;
