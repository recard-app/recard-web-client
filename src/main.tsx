import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { StrictMode } from 'react';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);