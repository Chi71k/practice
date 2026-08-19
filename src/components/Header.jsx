import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.scss";
import logo from '../assets/Логотип.png'
import { useAuth } from '../hooks/useAuth';
import { useMyResumes } from '../hooks/useMyResumes';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { resumesCount } = useMyResumes();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <h1>
        <img src={logo} alt="Логотип" className={styles.headerLogo} />
      </h1>
      <div className={styles.headerRight}>
        {isAuthenticated ? (
          <>
            <Link to="/my-resumes" className={styles.headerResumesCount}>
              Мои резюме: {resumesCount}
            </Link>
            <Link to="/profile" className={styles.headerProfileLink}>
              <img src="https://via.placeholder.com/40" alt="Профиль" className={styles.headerAvatar} />
              <span>{user?.firstName ?? 'Профиль'}</span>
            </Link>
            <button type="button" onClick={handleLogout} className={styles.headerLogoutBtn}>
              Выйти
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.headerLoginLink}>
            Войти
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header