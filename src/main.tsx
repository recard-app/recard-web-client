import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './main.css';
import './styling/theme-overrides/cardzen.scss';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { StrictMode } from 'react';

// Register SW with auto-update: checks for new SW on page focus and periodically,
// then reloads automatically when a new version is available.
registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
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