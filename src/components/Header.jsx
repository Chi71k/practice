import { Link } from "react-router-dom";
import '../styles/Header.css'

function Header() {
  return (
    <header>
      <h1>Логотип</h1>
      <Link to="/profile">
        <img src="https://via.placeholder.com/40" alt="Профиль" />
      </Link> 
    </header>
  )
}

export default Header