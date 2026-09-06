import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as resumesApi from '../api/resumesApi';
import styles from '../styles/ResumeDetail.module.scss';

const ResumeDetail = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchResume = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const data = await resumesApi.getResumeById(id, { signal: controller.signal });
        setResume(data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <p>Загрузка...</p>;
  }
  if (notFound) {
    return <p>Резюме не найдено</p>;
  }
  if (!resume) return null;

  return (
    <div className={styles.resumeDetail}>
      <h1>{resume.title}</h1>
      <p><strong>Автор:</strong> {resume.ownerName}</p>
      <p><strong>Город:</strong> {resume.city}</p>
      {!!resume.salary && <p><strong>Зарплата:</strong> {resume.salary}</p>}
      <div className={styles.skills}>
        {resume.skills.map((skill) => (
          <span key={skill} className={styles.skillTag}>
            {skill}
          </span>
        ))}
      </div>
      <div className={styles.resumeSection}>
        <p><strong>О себе:</strong> {resume.summary}</p>
      </div>
      <button type="button" className={styles.btnBack} onClick={() => navigate(-1)}>
        Назад
      </button>
    </div>
  );
};

export default ResumeDetail;
