import { Link } from "react-router-dom";
import styles from "../styles/Header.module.scss";
import logo from '../assets/Логотип.png'

const Header = () => {
  return (
    <header className={styles.header}>
      <h1>
        <img src={logo} alt="Логотип" className={styles.headerLogo} />
      </h1>
      <Link to="/profile">
        <img src="https://via.placeholder.com/40" alt="Профиль" className={styles.headerAvatar} />
      </Link> 
    </header>
  )
}

export default Header