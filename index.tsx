
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  console.log("Iniciando montaje de Nexus ERP...");
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("CRÍTICO: No se encontró el elemento #root en el DOM.");
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
  } catch (error) {
    console.error("Error fatal durante el renderizado de React:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h2>Error de carga</h2>
        <p>Hubo un problema al iniciar la aplicación. Por favor, revisa la consola del navegador.</p>
        <pre style="background: #eee; padding: 10px;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
};

// Asegurar que el DOM esté listo antes de intentar montar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
