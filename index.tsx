
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const init = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    if (typeof (window as any).markAsLoaded === 'function') {
      (window as any).markAsLoaded();
    }
  } catch (err) {
    console.error("Fatal Nexus Error:", err);
    container.innerHTML = `<div style="padding:20px;color:red;font-family:sans-serif;">Error al cargar la aplicación. Revisa la consola.</div>`;
  }
};

init();
