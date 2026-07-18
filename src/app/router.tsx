import { createHashRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/login/LoginPage';

export const router = createHashRouter([
  // Public routes — login wrapped in AuthLayout
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },

  // Protected routes — guarded by ProtectedRoute, wrapped in MainLayout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            // element: <DrinksPage />,
          },
        ],
      },
    ],
  },

  // Catch-all — redirect unknown URLs to home (prevents custom URL bypass)
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
