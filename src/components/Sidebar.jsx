import { NavLink } from "react-router-dom";
import styles from "../styles/Sidebar.module.scss";


const Sidebar = () => {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={styles.navLink}>
       Главная
      </NavLink>
      <br />
      {/* <NavLink to="/resumes" className={styles.navLink}>
        Резюме
      </NavLink> */}
      <br />
      <NavLink to="/my-resumes" className={styles.navLink}>
        Мои резюме
      </NavLink>
    </nav>
  )
}

export default Sidebar