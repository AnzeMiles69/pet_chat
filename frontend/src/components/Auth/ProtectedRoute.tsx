import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  
  // Проверяем наличие токена в localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    // сохраняя текущий URL для редиректа после успешной авторизации
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь авторизован, показываем защищенный контент
  return <>{children}</>;
}; 