import { useNavigate } from 'react-router-dom';
import styles from '../styles/ResumesList.module.scss';

const ResumesList = ({ resumes }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.resumesList}>
      {resumes.map((resume) => (
        <div key={resume.id} className={styles.resumeCard}>
          <h3>{resume.title}</h3>
          <p><strong>Город:</strong> {resume.city}</p>
          {!!resume.salary && <p><strong>Зарплата:</strong> {resume.salary}</p>}
          <button type="button" className={styles.btnResume} onClick={() => navigate(`/resumes/${resume.id}`)}>
            Подробнее
          </button>
        </div>
      ))}
    </div>
  );
};

export default ResumesList;
