import { Routes, Route } from "react-router-dom";
import Layout from './components/Layout'   
import Home from './pages/Home'            
import MyResumes from './pages/MyResumes'  
import Profile from './pages/Profile'      

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="resumes" element={<MyResumes />} />
        <Route path="profile" element={<Profile />} />
      </Route>   
    </Routes>
  )
}

export default App
