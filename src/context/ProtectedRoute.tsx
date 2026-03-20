import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { PAGES } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, authSyncState, syncAccount } = useAuth();

  if (!user) {
    return <Navigate to={PAGES.SIGN_IN.PATH} replace />;
  }

  if (authSyncState === 'error') {
    // Don't boot the user -- they have a valid Firebase session.
    // Show a retry option so transient network errors don't lose their context.
    return (
      <div className="auth-sync-loading">
        <p>Something went wrong loading your account.</p>
        <button onClick={() => syncAccount().catch(() => {})}>
          Try again
        </button>
      </div>
    );
  }

  if (authSyncState !== 'ready') {
    return <div className="auth-sync-loading">Finishing account setup...</div>;
  }

  return children;
};

export default ProtectedRoute;
