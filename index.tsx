
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    if (typeof (window as any).markAsLoaded === 'function') {
      (window as any).markAsLoaded();
    }
    
  } catch (error) {
    console.error("Nexus ERP Initialization Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; font-family: 'Inter', sans-serif; color: #1e293b; background: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="background: #fee2e2; padding: 30px; border-radius: 24px; border: 1px solid #fecaca; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <h1 style="color: #ef4444; margin-bottom: 10px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase; font-size: 24px;">Error de Inicio</h1>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">${error instanceof Error ? error.message : "Error desconocido al montar la aplicación"}</p>
            <button onclick="location.reload()" style="margin-top: 24px; padding: 12px 24px; background: #1e293b; color: white; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s;">Reintentar Conexión</button>
        </div>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
