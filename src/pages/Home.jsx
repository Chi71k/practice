import { useEffect, useState } from "react";
import { getResumes } from "../resumeFakeApi";
import ResumesList from "../components/ResumesList";
import '../styles/Home.css'


const Home = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const data = await getResumes();
        setResumes(data); 
      } catch (err) {
        setError('Ошибка при загрузке резюме');
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  return (
    <div>
      <ResumesList resumes={resumes} />
    </div>
  )
}

export default Home