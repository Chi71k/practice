import { useNavigate } from "react-router-dom";
import styles from "../styles/ResumesList.module.scss";
import Pagination from "./Pagination";
import { useState } from "react";

const ItemsPerPage = 15;

const ResumesList = ({ resumes }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(resumes.length / ItemsPerPage);
  const currentResumes = resumes.slice(
    (currentPage - 1) * ItemsPerPage,
    currentPage * ItemsPerPage
  );


  return (
    <div className={styles.resumesList}>
      {currentResumes.map((resume) => (
        <div key={resume.id} className={styles.resumeCard}>
          <h3>{resume.fullName}</h3>
          <p><strong>Позиция:</strong> {resume.position}</p>
          <p><strong>Возраст:</strong> {resume.age}</p>
          <button className={styles.btnResume} onClick={() => navigate(`/resumes/${resume.id}`)}>
            Подробнее
          </button>
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default ResumesList