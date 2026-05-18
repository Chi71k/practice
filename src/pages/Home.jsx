import { useEffect, useState } from "react";
import { getResumes } from "../resumeFakeApi";
import { useNavigate } from "react-router-dom";
import '../styles/Home.css'


function Home() {
  const [count, setCount] = useState(0);
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getResumes().then((data) => {
      setResumes(data);
    });
  }, []);

  return (
    <div>
      <p>Счетчик: {count}</p>
      <button onClick={() => setCount(count + 5)}>
        Нажми
      </button>

      {resumes.map((resume) => (
        <div key={resume.id} className="resume-card">
          <h2>{resume.fullName}</h2> 
          <p><strong>Позиция:</strong> {resume.position}</p>
          <p><strong>Город:</strong> {resume.city}</p>
          <p><strong>Возраст:</strong> {resume.age}</p>
          <button onClick={() => navigate(`/resumes/${resume.id}`)}>Подробнее</button>
        </div>
      ))}
    </div>
  )
}

export default Home