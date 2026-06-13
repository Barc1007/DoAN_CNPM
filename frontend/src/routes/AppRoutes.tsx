import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import LoginPage from '../features/auth/pages/LoginPage/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage/RegisterPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import TransactionsPage from '../features/transactions/pages/TransactionsPage';
import CategoryPage from '../features/category/pages/CategoryPage';
import WalletPage from '../features/wallet/pages/WalletPage';
import NotificationsPage from '../features/notifications/page/NotificationsPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import GoalsPage from '../features/goals/pages/GoalsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/categories" element={<CategoryPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

export default AppRoutes;
