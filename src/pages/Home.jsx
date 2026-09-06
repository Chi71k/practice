import { useEffect, useState } from 'react';
import * as resumesApi from '../api/resumesApi';
import ResumesList from '../components/ResumesList';
import Pagination from '../components/Pagination';
import styles from '../styles/Home.module.scss';

const Home = () => {
  const [resumes, setResumes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, meta: responseMeta } = await resumesApi.getResumes(
          { page },
          { signal: controller.signal },
        );
        setResumes(data);
        setMeta(responseMeta);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('Ошибка при загрузке резюме');
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
    return () => controller.abort();
  }, [page]);

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  return (
    <div className={styles.home}>
      <ResumesList resumes={resumes} />
      {meta && meta.pages > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.pages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default Home;
