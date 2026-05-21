import { Outlet } from "react-router-dom";
import Header from './Header'  
import Sidebar from './Sidebar' 
import '../styles/Layout.css'

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <Sidebar />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout