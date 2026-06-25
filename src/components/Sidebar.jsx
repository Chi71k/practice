import { NavLink } from "react-router-dom";
import styles from "../styles/Sidebar.module.scss";


const Sidebar = () => {
  return (
    <nav className={styles.nav}>
      <NavLink to="/">
       Главная
      </NavLink>
      <br />
      {/* <NavLink to="/resumes">
        Резюме
      </NavLink> */}
      <br />
      <NavLink to="/my-resumes">
        Мои резюме
      </NavLink>
    </nav>
  )
}

export default Sidebar