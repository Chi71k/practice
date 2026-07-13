import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  TextField, TextArea, Select, MultiSelect, NumberField, RadioGroup, Checkbox,
} from '../components/form';
import { resumeSchema } from '../schemas/resumeSchema';
import { getMyResumes, saveMyResume, deleteMyResume } from '../utils/myResumesStorage';
import { cityOptions, positionOptions, employmentTypeOptions } from '../constants/formOptions';
import { skillOptions } from '../constants/skillOptions';
import styles from '../styles/MyResumes.module.scss';

const MyResumes = () => {
  const [resumes, setResumes] = useState(getMyResumes);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = (data) => {
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

    saveMyResume(resume);
    setResumes(getMyResumes());
    reset();
  };

  const handleDelete = (id) => {
    deleteMyResume(id);
    setResumes(getMyResumes());
  };

  return (
    <div className={styles.page}>
      <h1>Мои резюме</h1>

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

      <div className={styles.list}>
        <h2>Сохранённые резюме</h2>
        {resumes.length === 0 && <p>Резюме ещё нет</p>}
        {resumes.map((resume) => (
          <div key={resume.id} className={styles.card}>
            <h3>{resume.fullName}</h3>
            <p><strong>Позиция:</strong> {positionOptions.find((o) => o.value === resume.position)?.label ?? resume.position}</p>
            <p><strong>Город:</strong> {cityOptions.find((o) => o.value === resume.city)?.label ?? resume.city}</p>
            <p><strong>Возраст:</strong> {resume.age}</p>
            <p><strong>Опыт:</strong> {resume.experience}</p>
            {resume.employmentType && (
              <p>
                <strong>Занятость:</strong>{' '}
                {employmentTypeOptions.find((o) => o.value === resume.employmentType)?.label}
              </p>
            )}
            {!!resume.salary && <p><strong>Зарплата:</strong> {resume.salary}</p>}
            <div className={styles.skills}>
              {resume.skills.map((skill) => (
                <span key={skill} className={styles.skillTag}>
                  {skillOptions.find((s) => s.value === skill)?.label ?? skill}
                </span>
              ))}
            </div>
            {resume.relocate && <span className={styles.badge}>Готов к релокации</span>}
            <button onClick={() => handleDelete(resume.id)} className={styles.deleteBtn}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyResumes;
