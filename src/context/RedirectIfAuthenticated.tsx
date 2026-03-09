import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { PAGES } from '../types';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps): React.ReactElement => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={PAGES.HOME.PATH} replace />;
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated; 