
import React from 'react';
import { ICONS } from '../constants.tsx';
import { Role, ViewType, User } from '../types.ts';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: User;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'DASHBOARD' as ViewType, label: 'Dashboard', icon: ICONS.Dashboard, roles: [Role.ADMIN, Role.SELLER, Role.WAREHOUSE] },
    { id: 'USERS' as ViewType, label: 'Usuarios', icon: ICONS.Users, roles: [Role.ADMIN] },
    { id: 'CLIENTS' as ViewType, label: 'Clientes', icon: ICONS.Clients, roles: [Role.ADMIN, Role.SELLER, Role.WAREHOUSE] },
    { id: 'PROVIDERS' as ViewType, label: 'Proveedores', icon: ICONS.Providers, roles: [Role.ADMIN, Role.WAREHOUSE, Role.SELLER] },
    { id: 'PRODUCTS' as ViewType, label: 'Inventario', icon: ICONS.Inventory, roles: [Role.ADMIN, Role.WAREHOUSE, Role.SELLER] },
    { id: 'PURCHASES' as ViewType, label: 'Compras', icon: ICONS.Purchases, roles: [Role.ADMIN, Role.WAREHOUSE] },
    { id: 'NEW_SALE' as ViewType, label: 'Nueva Venta', icon: ICONS.Sales, roles: [Role.ADMIN, Role.SELLER] },
    { id: 'SALES_HISTORY' as ViewType, label: 'Historial Ventas', icon: ICONS.History, roles: [Role.ADMIN, Role.SELLER] },
    { id: 'REPORTS' as ViewType, label: 'Reportes', icon: ICONS.Reports, roles: [Role.ADMIN, Role.WAREHOUSE, Role.SELLER] },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/60 z-50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        w-64 bg-slate-900 text-white h-full lg:h-screen flex flex-col fixed left-0 top-0 z-[60] transition-transform duration-300 lg:translate-x-0 border-r border-white/5 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-slate-950">
          <ICONS.Logo className="w-9 h-9" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Nexstock</h1>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] leading-none">Smart Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1.5 px-3">
            {menuItems.filter(item => item.roles.includes(user.role)).map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                  currentView === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                    <item.icon />
                </div>
                <span className="ml-3 uppercase tracking-tighter text-[11px]">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-white/5 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center mb-6 px-1">
            <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-blue-500 overflow-hidden shadow-2xl shrink-0">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user.name}</p>
              <p className="text-[9px] text-blue-500 uppercase font-black tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded-md inline-block mt-1">ID: {user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 border border-rose-500/20 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <ICONS.Logout />
            <span className="ml-2">Salir</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
