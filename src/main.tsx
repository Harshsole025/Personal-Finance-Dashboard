import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './styles.css';

import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './components/Toast';
import { applyTheme, getSavedTheme } from './lib/theme';

// Apply saved theme before first paint
applyTheme(getSavedTheme());

const router = createBrowserRouter(AppRoutes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
);

