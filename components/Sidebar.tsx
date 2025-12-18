
import React from 'react';
import { ICONS } from '../constants.tsx';
import { Role, ViewType, User } from '../types.ts';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const menuItems = [
    { id: 'DASHBOARD' as ViewType, label: 'Dashboard', icon: ICONS.Dashboard, roles: [Role.ADMIN, Role.SELLER, Role.WAREHOUSE] },
    { id: 'USERS' as ViewType, label: 'Usuarios', icon: ICONS.Users, roles: [Role.ADMIN] },
    { id: 'CLIENTS' as ViewType, label: 'Clientes', icon: ICONS.Clients, roles: [Role.ADMIN, Role.SELLER] },
    { id: 'PROVIDERS' as ViewType, label: 'Proveedores', icon: ICONS.Providers, roles: [Role.ADMIN, Role.WAREHOUSE] },
    { id: 'PRODUCTS' as ViewType, label: 'Inventario', icon: ICONS.Inventory, roles: [Role.ADMIN, Role.WAREHOUSE, Role.SELLER] },
    { id: 'PURCHASES' as ViewType, label: 'Compras', icon: ICONS.Purchases, roles: [Role.ADMIN, Role.WAREHOUSE] },
    { id: 'NEW_SALE' as ViewType, label: 'Nueva Venta', icon: ICONS.Sales, roles: [Role.ADMIN, Role.SELLER] },
    { id: 'SALES_HISTORY' as ViewType, label: 'Historial Ventas', icon: ICONS.History, roles: [Role.ADMIN, Role.SELLER] },
    { id: 'REPORTS' as ViewType, label: 'Reportes', icon: ICONS.Reports, roles: [Role.ADMIN] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">NEXUS ERP</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Enterprise System</p>
      </div>
      
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon />
              <span className="ml-3 font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white overflow-hidden border border-slate-700 shadow-inner">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-900/20 rounded-lg transition-all group"
        >
          <ICONS.Logout />
          <span className="ml-3 group-hover:translate-x-1 transition-transform">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
