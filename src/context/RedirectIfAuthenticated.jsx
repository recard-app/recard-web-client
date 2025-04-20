import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RedirectIfAuthenticated({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/account" replace />;
  }

  return children;
}

export default RedirectIfAuthenticated; 