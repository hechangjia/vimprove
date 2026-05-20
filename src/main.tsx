import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppWithI18n } from './AppWithI18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithI18n />
  </StrictMode>
);
