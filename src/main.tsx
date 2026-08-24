import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initMobileApp } from './utils/mobileNative';

// Initialize native features (Capacitor status bar, splash screen) when on mobile
initMobileApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
