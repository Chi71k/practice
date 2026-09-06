import { memo } from 'react';
import styles from '../../styles/MyResumes.module.scss';
import { skillOptions } from '../../constants/skillOptions';

const ResumeCard = ({
  resume, canEdit, onEdit, onDelete,
}) => (
  <div className={styles.card}>
    <h3>{resume.title}</h3>
    <p><strong>Город:</strong> {resume.city}</p>
    {!!resume.salary && <p><strong>Зарплата:</strong> {resume.salary}</p>}
    <p className={styles.summary}>{resume.summary}</p>
    <div className={styles.skills}>
      {resume.skills.map((skill) => (
        <span key={skill} className={styles.skillTag}>
          {skillOptions.find((s) => s.value === skill)?.label ?? skill}
        </span>
      ))}
    </div>
    <span className={styles.badge}>{resume.isPublished ? 'Опубликовано' : 'Черновик'}</span>

    {canEdit && (
      <div className={styles.cardActions}>
        <button type="button" onClick={() => onEdit(resume)} className={styles.editBtn}>
          Редактировать
        </button>
        <button type="button" onClick={() => onDelete(resume.id)} className={styles.deleteBtn}>
          Удалить
        </button>
      </div>
    )}
  </div>
);

export default memo(ResumeCard);
