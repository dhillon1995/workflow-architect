import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.js';

// Apply the saved theme before first paint so every route honours it.
try {
  if (localStorage.getItem('wa-theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
} catch {
  /* private mode */
}

const root = document.getElementById('root');
if (!root) throw new Error('No #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
