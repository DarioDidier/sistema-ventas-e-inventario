
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-screen min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-extrabold text-blue-500 tracking-tight">NEXUS ERP</h1>
          <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest font-medium">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Usuario</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin, juan, maria..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 transform active:scale-[0.98]"
          >
            Acceder al Sistema
          </button>
          
          <div className="text-center mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter">Cuentas de demostración:</p>
            <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-400">
              <p><span className="font-semibold text-slate-600">admin</span> / password (Acceso Total)</p>
              <p><span className="font-semibold text-slate-600">juan</span> / password (Vendedor)</p>
              <p><span className="font-semibold text-slate-600">maria</span> / password (Almacén)</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
