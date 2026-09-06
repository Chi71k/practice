import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Forbidden from './Forbidden';

const ProtectedRoute = ({ roles }) => {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <p>Загрузка...</p>;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Forbidden />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
