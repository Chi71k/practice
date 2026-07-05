import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import TextField from '../components/TextField';
import { resumeSchema } from '../schemas/resumeSchema';
import { getMyResumes, saveMyResume, deleteMyResume } from '../utils/myResumesStorage';
import styles from '../styles/MyResumes.module.scss';

const MyResumes = () => {
  const [resumes, setResumes] = useState(getMyResumes);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
  });

  const onSubmit = (data) => {
    const resume = {
      id: crypto.randomUUID(),
      fullName: data.fullName,
      position: data.position,
      city: data.city,
      age: data.age,
      salary: 0,
      experience: data.experience,
      about: data.about,
      skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
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
        <TextField {...register('position')} label="Позиция" error={errors.position?.message} />
        <TextField {...register('city')} label="Город" error={errors.city?.message} />
        <TextField {...register('age')} label="Возраст" type="number" error={errors.age?.message} />
        <TextField {...register('experience')} label="Опыт" error={errors.experience?.message} />
        <TextField {...register('about')} label="О себе" error={errors.about?.message} />
        <TextField {...register('email')} label="Email" type="email" error={errors.email?.message} />
        <TextField {...register('phone')} label="Телефон" type="tel" error={errors.phone?.message} />
        <TextField
          {...register('skills')}
          label="Навыки (через запятую)"
          placeholder="React, JavaScript, SCSS"
          error={errors.skills?.message}
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
            <p><strong>Позиция:</strong> {resume.position}</p>
            <p><strong>Город:</strong> {resume.city}</p>
            <p><strong>Возраст:</strong> {resume.age}</p>
            <p><strong>Опыт:</strong> {resume.experience}</p>
            <div className={styles.skills}>
              {resume.skills.map((skill) => (
                <span key={skill} className={styles.skillTag}>{skill}</span>
              ))}
            </div>
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
