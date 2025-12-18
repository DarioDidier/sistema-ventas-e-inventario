
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = async () => {
  console.log("Nexus ERP: Iniciando secuencia de montaje...");
  const rootElement = document.getElementById('root');
  const loadingOverlay = document.getElementById('loading-overlay');
  const debugStatus = document.getElementById('debug-status');
  
  if (debugStatus) debugStatus.innerText = 'Inicializando componentes...';

  const hideOverlay = () => {
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
        }, 500);
    }
  };

  if (!rootElement) {
    console.error("Nexus ERP: No se encontró #root");
    hideOverlay();
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Nexus ERP: Renderizado exitoso.");
    // Un pequeño delay para asegurar que el DOM inicial de React esté listo
    setTimeout(hideOverlay, 200);
  } catch (error) {
    console.error("Nexus ERP: Error fatal en React:", error);
    if (debugStatus) debugStatus.innerText = 'Fallo al renderizar.';
    hideOverlay();
    
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #ef4444; font-family: 'Inter', sans-serif; text-align: center; background: white; height: 100vh;">
        <h2 style="font-weight: 800; font-size: 24px; margin-bottom: 10px;">Error de inicialización</h2>
        <p style="color: #64748b; margin-bottom: 20px;">No se pudo cargar el motor del sistema.</p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; display: inline-block; text-align: left; max-width: 80%;">
          <code style="font-size: 12px; white-space: pre-wrap; word-break: break-all;">${error instanceof Error ? error.stack || error.message : String(error)}</code>
        </div>
        <div style="margin-top: 20px;">
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer;">Reintentar carga</button>
        </div>
      </div>
    `;
  }
};

// Asegurar que el montaje ocurra después de que es-module-shims haya procesado el importmap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountApp());
} else {
  mountApp();
}
