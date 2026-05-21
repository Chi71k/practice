import { useNavigate } from "react-router-dom";
import "../styles/ResumesList.css";

const ResumesList = ({ resumes }) => {
  const navigate = useNavigate();

  const grouped = resumes.reduce((acc, resume) => {
    const city = resume.city.label;
    if (!acc[city]) acc[city] = [];
    acc[city].push(resume);
    return acc;
  }, {});

  return (
    <div className="resumes-list">
      {Object.entries(grouped).map(([city, cityResumes]) => (
        <div key={city} className="city-group">
          <h2>{city}</h2>
          <div className="city-group-cards">
          {cityResumes.map((resume) => (
            <div key={resume.id} className="resume-card">
              <h3>{resume.fullName}</h3>
              <p><strong>Позиция:</strong> {resume.position}</p>
              <p><strong>Возраст:</strong> {resume.age}</p>
              <button className="btn-resume" onClick={() => navigate(`/resumes/${resume.id}`)}>Подробнее</button>
            </div>
          ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResumesList