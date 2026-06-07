import { Outlet } from "react-router-dom";
import Header from './Header'  
import Sidebar from './Sidebar' 
import styles from "../styles/Layout.module.scss";

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.layoutBody}>
        <Sidebar />
        <main className={styles.layoutContent}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout