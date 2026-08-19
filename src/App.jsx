import { Routes, Route } from "react-router-dom";
import Layout from './components/Layout'
import Home from './pages/Home'
import MyResumes from './pages/MyResumes'
import Profile from './pages/Profile'
import ResumeDetail from './pages/ResumeDetail'
import Login from './pages/Login'
import HttpPlayground from './pages/HttpPlayground'
import ProtectedRoute from './components/routing/ProtectedRoute'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="http-playground" element={<HttpPlayground />} />
        <Route path="resumes/:id" element={<ResumeDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="my-resumes" element={<MyResumes />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
