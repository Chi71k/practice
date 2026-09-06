import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MyResumes from './pages/MyResumes';
import MyVacancies from './pages/MyVacancies';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import ResumeDetail from './pages/ResumeDetail';
import Login from './pages/Login';
import HttpPlayground from './pages/HttpPlayground';
import AdminUsers from './pages/admin/AdminUsers';
import ProtectedRoute from './components/routing/ProtectedRoute';

const App = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="http-playground" element={<HttpPlayground />} />
      <Route path="resumes/:id" element={<ResumeDetail />} />

      <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<Profile />} />
        <Route path="applications" element={<Applications />} />
      </Route>

      <Route element={<ProtectedRoute roles={['CANDIDATE']} />}>
        <Route path="my-resumes" element={<MyResumes />} />
      </Route>

      <Route element={<ProtectedRoute roles={['EMPLOYER']} />}>
        <Route path="my-vacancies" element={<MyVacancies />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="admin" element={<AdminUsers />} />
      </Route>
    </Route>
  </Routes>
);

export default App;
