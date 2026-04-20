import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth';
import AppWrapper from './AppWrapper.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  </StrictMode>,
);
