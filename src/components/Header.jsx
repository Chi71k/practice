import { Link } from "react-router-dom";
import styles from "../styles/Header.module.scss";
import logo from '../assets/Логотип.png'
import { useProfile } from '../hooks/useProfile';
import { useMyResumes } from '../hooks/useMyResumes';

const Header = () => {
  const { profile, isProfileFilled } = useProfile();
  const { resumesCount } = useMyResumes();

  return (
    <header className={styles.header}>
      <h1>
        <img src={logo} alt="Логотип" className={styles.headerLogo} />
      </h1>
      <div className={styles.headerRight}>
        <Link to="/my-resumes" className={styles.headerResumesCount}>
          Мои резюме: {resumesCount}
        </Link>
        <Link to="/profile" className={styles.headerProfileLink}>
          <img src="https://via.placeholder.com/40" alt="Профиль" className={styles.headerAvatar} />
          <span>{isProfileFilled ? profile.fullName : 'Профиль'}</span>
        </Link>
      </div>
    </header>
  )
}

export default Header