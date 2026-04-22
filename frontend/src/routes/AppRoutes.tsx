import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import LoginPage from '../features/auth/pages/LoginPage/LoginPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
};

export default AppRoutes;
