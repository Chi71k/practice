import { NavLink } from "react-router-dom";
import '../styles/Sidebar.css'


function Sidebar() {
  return (
    <nav>
      <NavLink to="/">Главная</NavLink>
      <br />
      <NavLink to="/resumes">Резюме</NavLink>
    </nav>
  )
}

export default Sidebar