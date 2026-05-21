import { Routes, Route } from "react-router-dom";
import Layout from './components/Layout'   
import Home from './pages/Home'            
import MyResumes from './pages/MyResumes'  
import Profile from './pages/Profile'  
import ResumeDetail from './pages/ResumeDetail'    

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="my-resumes" element={<MyResumes />} />
        <Route path="profile" element={<Profile />} />
        <Route path="resumes/:id" element={<ResumeDetail />} />
      </Route>   
    </Routes>
  )
}

export default App
