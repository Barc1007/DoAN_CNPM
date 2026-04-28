import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import LoginPage from '../features/auth/pages/LoginPage/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage/RegisterPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import TransactionsPage from '../features/transactions/pages/TransactionsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
    </Routes>
  );
};

export default AppRoutes;
