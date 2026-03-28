import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../../modules/auth/services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps): React.ReactElement {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default PrivateRoute;
