import { NavLink } from "react-router-dom";
import '../styles/Sidebar.css'


function Sidebar() {
  return (
    <nav>
      <NavLink to="/">Главная</NavLink>
      <br />
      <NavLink to="/resumes">Резюме</NavLink>
      <br />
      <NavLink to="/my-resumes">Мои резюме</NavLink>
    </nav>
  )
}

export default Sidebar