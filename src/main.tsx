import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp';
import './index.css';

// Check if route is /meo
const isMeoAdminRoute = typeof window !== 'undefined' && (
  window.location.pathname === '/meo' || 
  window.location.pathname.startsWith('/meo/') ||
  window.location.search.includes('meo=true')
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMeoAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>,
);
