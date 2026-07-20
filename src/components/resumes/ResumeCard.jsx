import { memo } from 'react';
import styles from '../../styles/MyResumes.module.scss';
import { positionOptions, cityOptions, employmentTypeOptions } from '../../constants/formOptions';
import { skillOptions } from '../../constants/skillOptions';

const ResumeCard = ({ resume, onDelete }) => {
  return (
    <div className={styles.card}>
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
      <button onClick={() => onDelete(resume.id)} className={styles.deleteBtn}>
        Удалить
      </button>
    </div>
  );
};

export default memo(ResumeCard);
