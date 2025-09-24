import type { RouteObject } from 'react-router-dom';
import { createElement } from 'react';
import { AuthLayout } from '../views/auth/AuthLayout';
import { DashboardLayout } from '../views/dashboard/DashboardLayout';

export const AppRoutes: RouteObject[] = [
  {
    path: '/',
    element: createElement(AuthLayout),
  },
  {
    path: '/app',
    element: createElement(DashboardLayout),
  },
];

