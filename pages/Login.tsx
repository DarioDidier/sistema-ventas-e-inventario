
import React, { useState } from 'react';
import { dataService } from '../services/dataService.ts';

interface LoginProps {
  onLogin: (username: string, password?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password Flow
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT' | 'RESET'>('LOGIN');
  const [resetUser, setResetUser] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const handleStartForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = dataService.getUsers().find(u => u.username.toLowerCase() === resetUser.toLowerCase());
    if (user && user.securityQuestion) {
      setSecurityQuestion(user.securityQuestion);
      setMode('RESET');
    } else {
      setError('Usuario no encontrado o no configuró pregunta de seguridad.');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const success = dataService.resetPassword(resetUser, answer, newPassword);
    if (success) {
      alert('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
      setMode('LOGIN');
      setUsername(resetUser);
      setPassword(newPassword);
    } else {
      setError('Respuesta incorrecta.');
    }
  };

  if (mode === 'FORGOT' || mode === 'RESET') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 p-8 text-center">
            <h1 className="text-3xl font-black text-blue-500 tracking-tight">RECUPERACIÓN</h1>
            <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.3em] font-black">Nexus Security Protocol</p>
          </div>
          
          <div className="p-8 space-y-6">
            {error && <div className="bg-rose-50 text-rose-500 p-4 rounded-xl text-xs font-bold border border-rose-100">{error}</div>}
            
            {mode === 'FORGOT' ? (
              <form onSubmit={handleStartForgot} className="space-y-4">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Ingresa tu ID de usuario para buscar tu pregunta secreta configurada.</p>
                <input 
                  required
                  placeholder="ID Usuario"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono"
                  value={resetUser}
                  onChange={e => setResetUser(e.target.value)}
                />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl">Continuar</button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-4">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Pregunta de Seguridad:</p>
                  <p className="text-sm font-bold text-slate-800">{securityQuestion}</p>
                </div>
                <input 
                  required
                  placeholder="Tu respuesta aquí..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                />
                <input 
                  required
                  type="password"
                  placeholder="Nueva Contraseña"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl">Resetear Password</button>
              </form>
            )}
            
            <button onClick={() => setMode('LOGIN')} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 py-2">Volver al Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-10 text-center">
          <h1 className="text-4xl font-black text-blue-500 tracking-tighter italic">NEXUS ERP</h1>
          <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.4em] font-black">Enterprise Resource Management</p>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Identificación</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Credencial</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-300 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2.5"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.273 4.273M19.727 19.727L14.12 14.12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 uppercase text-xs tracking-[0.2em] active:scale-95"
          >
            Acceder al Sistema
          </button>

          <div className="flex justify-center">
            <button 
              type="button"
              onClick={() => { setResetUser(username); setMode('FORGOT'); }}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Versión Enterprise v2.5</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
