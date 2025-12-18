
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = async () => {
  console.log("Nexus ERP: Montando aplicación...");
  const rootElement = document.getElementById('root');
  const debugStatus = document.getElementById('debug-status');
  
  if (debugStatus) debugStatus.innerText = 'Inicializando React...';

  if (!rootElement) {
    console.error("Nexus ERP: Error crítico - Elemento #root no encontrado.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("Nexus ERP: Aplicación lista.");
    
    // Notificar al index.html que el renderizado comenzó con éxito
    if (typeof (window as any).markAsLoaded === 'function') {
      (window as any).markAsLoaded();
    }
    
  } catch (error) {
    console.error("Nexus ERP: Error en tiempo de ejecución:", error);
    if (debugStatus) debugStatus.innerText = 'Error fatal en la inicialización.';
    
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #ef4444; font-family: sans-serif; text-align: center;">
        <h2 style="font-size: 20px; font-weight: bold;">Error de Carga</h2>
        <p style="color: #64748b; margin: 10px 0;">Ocurrió un problema al iniciar el sistema.</p>
        <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 11px; text-align: left; overflow: auto; max-width: 600px; margin: 20px auto;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Reintentar</button>
      </div>
    `;
  }
};

// Ejecución segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
