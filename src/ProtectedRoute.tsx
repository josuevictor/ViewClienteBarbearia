import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Verifica se o token de autenticação está presente

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;