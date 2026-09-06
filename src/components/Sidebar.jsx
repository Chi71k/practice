import { NavLink } from 'react-router-dom';
import styles from '../styles/Sidebar.module.scss';
import { useAuth } from '../hooks/useAuth';
import {
  isCandidate, isEmployer, isAdmin,
} from '../utils/permissions';

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className={styles.nav}>
      <NavLink to="/">
        Главная
      </NavLink>
      <br />

      {isAuthenticated && isCandidate(user) && (
        <>
          <NavLink to="/my-resumes">
            Мои резюме
          </NavLink>
          <br />
        </>
      )}

      {isAuthenticated && isEmployer(user) && (
        <>
          <NavLink to="/my-vacancies">
            Мои вакансии
          </NavLink>
          <br />
        </>
      )}

      {isAuthenticated && (
        <>
          <NavLink to="/applications">
            Отклики
          </NavLink>
          <br />
        </>
      )}

      {isAuthenticated && isAdmin(user) && (
        <>
          <NavLink to="/admin">
            Админ-панель
          </NavLink>
          <br />
        </>
      )}

      <NavLink to="/http-playground">
        HTTP Playground
      </NavLink>
    </nav>
  );
};

export default Sidebar;
