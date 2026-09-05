import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { CardsProvider } from './context/CardsContext';

createRoot(
  document.getElementById('root')!
).render(
  <StrictMode>
    <AuthProvider>
      <CardsProvider>
        <App />
      </CardsProvider>
    </AuthProvider>
  </StrictMode>
);