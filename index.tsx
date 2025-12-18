
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  console.log("Iniciando montaje de Nexus ERP...");
  const rootElement = document.getElementById('root');
  const loadingOverlay = document.getElementById('loading-overlay');
  
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
    console.error("CRÍTICO: No se encontró el elemento #root en el DOM.");
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
    console.log("Aplicación Nexus ERP renderizada correctamente.");
    // Aseguramos que el loader se vaya incluso si React tarda unos ms en pintar
    setTimeout(hideOverlay, 100);
  } catch (error) {
    console.error("Error fatal durante el renderizado de React:", error);
    hideOverlay();
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #ef4444; font-family: 'Inter', sans-serif; text-align: center;">
        <h2 style="font-weight: 800; font-size: 24px;">Error de inicialización</h2>
        <p style="color: #64748b;">Hubo un problema al cargar los módulos del sistema.</p>
        <pre style="background: #f1f5f9; padding: 20px; border-radius: 12px; display: inline-block; margin-top: 20px; text-align: left; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
