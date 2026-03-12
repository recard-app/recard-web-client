import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './main.css';
import './styling/theme-overrides/cardzen.scss';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { StrictMode } from 'react';

// Show a branded overlay and immediately activate the new service worker.
// Uses "prompt" registerType so we control timing -- overlay appears before reload.
function showUpdateOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'pwa-update-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed; inset: 0; z-index: 999999;
      display: flex; align-items: center; justify-content: center;
      background:
        radial-gradient(ellipse at 20% 20%, var(--color-primary-lightest) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, var(--color-primary-lightest) 0%, transparent 50%),
        radial-gradient(ellipse at 60% 10%, var(--color-primary-lightest) 0%, transparent 40%),
        var(--color-neutral-light-gray);
    ">
      <div style="
        display: flex; flex-direction: column; align-items: center; gap: 12px;
        background: var(--color-neutral-white); padding: 40px 48px;
        border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      ">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--color-neutral-dark-gray)" stroke-width="2" xmlns="http://www.w3.org/2000/svg" style="animation: pwa-spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px; font-weight: 500; color: var(--color-neutral-dark-gray);
        ">App Updating...</span>
      </div>
    </div>
    <style>@keyframes pwa-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
  `;
  document.body.appendChild(overlay);
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    showUpdateOverlay();
    updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    // Check for updates every 15 minutes
    setInterval(() => {
      registration.update();
    }, 15 * 60 * 1000);
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);