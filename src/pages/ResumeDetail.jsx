import { useParams, useNavigate } from "react-router-dom";
import { getResumeById } from "../resumeFakeApi";
import { useEffect, useState } from "react";
import styles from "../styles/ResumeDetail.module.scss";

const ResumeDetail = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);    
  const navigate = useNavigate();  

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const data = await getResumeById(id);
        setResume(data);
      }
      catch (err) {
        setError('Ошибка при загрузке резюме');
      }
      finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [id]);

  if (loading) {
    return <p>Загрузка...</p>;
  }
  if (error) {
    return <p>Ошибка: {error}</p>;
  }
  if (!resume) return null;

  return (
    <div className={styles.resumeDetail}>
      <h1>{resume.fullName}</h1>
      <p><strong>Позиция:</strong> {resume.position}</p>
      <p><strong>Город:</strong> {resume.city}</p>
      <p><strong>Возраст:</strong> {resume.age}</p>
      <p><strong>Зарплата:</strong> {resume.salary}</p>
      <p><strong>Опыт:</strong> {resume.experience}</p>
      <div className={styles.skills}>
        {resume.skills.map(skill => (
          <span key={skill} className={styles.skillTag}>
            {skill}
          </span>
        ))}
      </div>
      <div className={styles.resumeSection}>
        <p><strong>О себе:</strong> {resume.about}</p>
      </div>
      <div className={styles.resumeSection}>
        <p><strong>Контакты:</strong></p>
        <ul>
          <li><strong>Email:</strong> {resume.contacts.email}</li>
          <li><strong>Телефон:</strong> {resume.contacts.phone}</li>
        </ul>
      </div>
      <button className={styles.btnBack} onClick={() => navigate(-1)}>
        Назад
      </button>
    </div>
  );
}

export default ResumeDetail