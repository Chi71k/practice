import { Link } from "react-router-dom";
import '../styles/Header.css'
import logo from '../assets/Логотип.png'

function Header() {
  return (
    <header>
      <h1>
        <img src={logo} alt="Логотип" className="header-logo" />
      </h1>
      <Link to="/profile">
        <img src="https://via.placeholder.com/40" alt="Профиль" className="header-avatar" />
      </Link> 
    </header>
  )
}

export default Header