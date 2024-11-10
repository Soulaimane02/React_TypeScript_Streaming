import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAccess } from './AccesProvider';

const ProtectedAccessRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { hasAccess } = useAccess();
  return hasAccess ? children : <Navigate to="/access-code" />;
};

export default ProtectedAccessRoute;
