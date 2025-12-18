
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Role, ViewType, Product, Client, Sale, Provider } from './types';
import { dataService } from './services/dataService';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewSale from './pages/NewSale';
import Inventory from './pages/Inventory';
import Clients from './pages/Clients';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Componente para gestión de usuarios (CRUD) con visibilidad de contraseña y confirmación personalizada
const UserManagement: React.FC<{ users: User[], onSave: (u: User) => void, onDelete: (id: string) => void }> = ({ users, onSave, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Partial<User>>({ 
    name: '', 
    email: '', 
    username: '', 
    password: '', 
    role: Role.SELLER, 
    isActive: true, 
    imageUrl: '' 
  });

  const roleLabels: Record<Role, string> = {
    [Role.ADMIN]: 'Administrador',
    [Role.SELLER]: 'Vendedor',
    [Role.WAREHOUSE]: 'Almacén / Depósito'
  };

  const openModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setForm({ ...u });
    } else {
      setEditingUser(null);
      setForm({ 
        name: '', 
        email: '', 
        username: '', 
        password: '', 
        role: Role.SELLER, 
        isActive: true, 
        imageUrl: '' 
      });
    }
    setShowPassword(false);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const onPreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true); // Abrir el popup de confirmación
  };

  const handleConfirmSave = () => {
    const isEditing = !!editingUser;
    const userData: User = { 
      ...form as User, 
      id: isEditing ? editingUser!.id : `u-${Date.now()}` 
    };
    
    onSave(userData);
    setShowConfirm(false);
    setShowModal(false);
    
    alert(isEditing 
      ? `¡Éxito! El usuario "${userData.name}" ha sido actualizado.` 
      : `¡Éxito! El usuario "${userData.name}" ha sido creado correctamente.`
    );
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500">Administra el acceso y roles del personal</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">+ Nuevo Usuario</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
            <tr className="border-b">
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                    {u.imageUrl ? <img src={u.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">{u.name.charAt(0)}</div>}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.username}</td>
                <td className="px-4 py-3">
                   <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
                     {roleLabels[u.role]}
                   </span>
                </td>
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <span className="flex items-center text-emerald-600 font-bold text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div> ACTIVO
                    </span>
                  ) : (
                    <span className="flex items-center text-rose-600 font-bold text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></div> INACTIVO
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Editar</button>
                  <button onClick={() => { if(window.confirm(`¿Está seguro de eliminar a ${u.name}?`)) onDelete(u.id) }} className="text-rose-500 hover:text-rose-700 font-bold transition-colors">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{editingUser ? 'Editar Datos' : 'Registrar Nuevo'} Usuario</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            
            <form onSubmit={onPreSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden mb-2 relative group cursor-pointer hover:border-blue-400 transition-all shadow-inner">
                  {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Foto de Perfil</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                  <input required placeholder="Ej. Juan Manuel Pérez" className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Usuario</label>
                    <input required placeholder="nombre_user" className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                    <div className="relative">
                      <input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" 
                        value={form.password} 
                        onChange={e => setForm({...form, password: e.target.value})} 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                  <input required type="email" placeholder="email@ejemplo.com" className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rol</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={form.role} onChange={e => setForm({...form, role: e.target.value as Role})}>
                    <option value={Role.ADMIN}>Administrador</option>
                    <option value={Role.SELLER}>Vendedor</option>
                    <option value={Role.WAREHOUSE}>Almacén</option>
                  </select>
                </div>
                
                <div className="flex items-center pt-2">
                   <input 
                    type="checkbox" 
                    id="userActive"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})}
                   />
                   <label htmlFor="userActive" className="ml-2 text-sm font-medium text-slate-700 cursor-pointer">Usuario Activo</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingUser ? 'Aplicar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup de Confirmación para "Aplicar Cambios" */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
             </div>
             <h4 className="text-lg font-bold text-slate-900 text-center mb-2">¿Confirmar Cambios?</h4>
             <p className="text-sm text-slate-500 text-center mb-6">Estás a punto de modificar la información de <strong>{form.name}</strong>. ¿Deseas continuar?</p>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowConfirm(false)} className="py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Volver</button>
                <button onClick={handleConfirmSave} className="py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Confirmar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para gestión de proveedores (CRUD)
const ProviderManagement: React.FC<{ providers: Provider[], onSave: (p: Provider) => void, onDelete: (id: string) => void, isAdmin: boolean }> = ({ providers, onSave, onDelete, isAdmin }) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form, setForm] = useState<Partial<Provider>>({ name: '', contactName: '', email: '', phone: '', category: 'General', imageUrl: '' });

  const openModal = (p?: Provider) => {
    if (!isAdmin) return;
    if (p) {
      setEditing(p);
      setForm(p);
    } else {
      setEditing(null);
      setForm({ name: '', contactName: '', email: '', phone: '', category: 'General', imageUrl: '' });
    }
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form as Provider, id: editing ? editing.id : `pr-${Date.now()}` });
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Proveedores</h2>
          <p className="text-sm text-slate-500">Administra los suministros de tu negocio</p>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">+ Nuevo Proveedor</button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(p => (
          <div key={p.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm group hover:border-blue-300 transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">{p.name.charAt(0)}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{p.name}</h3>
                <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase">{p.category}</span>
              </div>
            </div>
            <div className="space-y-2 mb-4 text-xs text-slate-600">
              <div className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {p.contactName}
              </div>
              <div className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {p.email}
              </div>
              <div className="flex items-center font-mono text-blue-600">
                <svg className="w-3.5 h-3.5 mr-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {p.phone}
              </div>
            </div>
            {isAdmin && (
              <div className="pt-3 border-t flex justify-end space-x-3">
                <button onClick={() => openModal(p)} className="text-blue-600 text-xs font-bold hover:underline">Editar</button>
                <button onClick={() => { if(window.confirm('¿Eliminar proveedor?')) onDelete(p.id) }} className="text-rose-600 text-xs font-bold hover:underline">Borrar</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-slate-900">{editing ? 'Actualizar' : 'Registrar'} Proveedor</h3>
            <form onSubmit={submit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden mb-1 relative group cursor-pointer hover:border-blue-400 transition-colors">
                  {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Logo del Proveedor</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre de la Empresa</label>
                  <input required placeholder="Ej: Global Solutions S.A." className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Persona de Contacto</label>
                  <input required placeholder="Ej: Carlos Méndez" className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Correo Corporativo</label>
                  <input required type="email" placeholder="ventas@empresa.com" className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                  <input required placeholder="Ej: +54 11 2345 6789" className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categoría</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="General">Insumos Generales</option>
                    <option value="Tecnología">Tecnología y Electrónica</option>
                    <option value="Servicios">Servicios Profesionales</option>
                    <option value="Limpieza">Artículos de Limpieza</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cerrar</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                  {editing ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente App Principal
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Estados para reportes
  const [reportStartDate, setReportStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const activeUser = dataService.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
      loadSystemData();
    }
  }, []);

  const loadSystemData = () => {
    setProducts(dataService.getProducts());
    setClients(dataService.getClients());
    setSales(dataService.getSales());
    setProviders(dataService.getProviders());
    setUsers(dataService.getUsers());
  };

  const handleLogin = (username: string, password?: string) => {
    const loggedInUser = dataService.login(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      loadSystemData();
    } else {
      alert('Credenciales inválidas o usuario inactivo');
    }
  };

  const handleLogout = () => {
    dataService.logout();
    setUser(null);
    setCurrentView('DASHBOARD');
  };

  const onCompleteSale = (sale: Sale) => {
    dataService.completeSale(sale);
    loadSystemData();
    setCurrentView('SALES_HISTORY');
  };

  const handleSaveProduct = (p: Product) => {
    dataService.saveProduct(p);
    loadSystemData();
  };

  const handleDeleteProduct = (id: string) => {
    dataService.deleteProduct(id);
    loadSystemData();
  };

  const handleSaveClient = (c: Client) => {
    dataService.saveClient(c);
    loadSystemData();
  };

  const handleDeleteClient = (id: string) => {
    dataService.deleteClient(id);
    loadSystemData();
  };

  const handleSaveUser = (u: User) => {
    dataService.saveUser(u);
    loadSystemData();
  };

  const handleDeleteUser = (id: string) => {
    dataService.deleteUser(id);
    loadSystemData();
  };

  const handleSaveProvider = (p: Provider) => {
    dataService.saveProvider(p);
    loadSystemData();
  };

  const handleDeleteProvider = (id: string) => {
    dataService.deleteProvider(id);
    loadSystemData();
  };

  // Filtrado de ventas por rango seleccionado
  const filteredSalesForReport = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.date.split('T')[0];
      return saleDate >= reportStartDate && saleDate <= reportEndDate;
    });
  }, [sales, reportStartDate, reportEndDate]);

  // Funciones de Generación de Reportes
  const handleExportSalesPDF = () => {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Por favor, permite las ventanas emergentes para ver el reporte.');
      return;
    }
    
    const total = filteredSalesForReport.reduce((acc, s) => acc + s.total, 0);
    
    const salesGrouped = filteredSalesForReport.reduce((acc: any, s) => {
      const d = new Date(s.date).toLocaleDateString();
      acc[d] = (acc[d] || 0) + s.total;
      return acc;
    }, {});
    
    const chartLabels = JSON.stringify(Object.keys(salesGrouped));
    const chartData = JSON.stringify(Object.values(salesGrouped));

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Ventas - Nexus ERP</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .header { border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { margin: 0; color: #1e293b; }
            .meta { font-size: 13px; color: #64748b; }
            .chart-container { margin: 30px 0; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #475569; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; }
            .total-section { margin-top: 30px; display: flex; justify-content: flex-end; }
            .total-box { padding: 20px 40px; background: #1e293b; color: white; border-radius: 12px; text-align: right; }
            .total-box h2 { margin: 0; color: #60a5fa; font-size: 24px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Reporte de Ventas</h1>
              <p class="meta">Rango: ${reportStartDate} al ${reportEndDate}</p>
            </div>
            <div class="meta" style="text-align: right;">
              <strong>NEXUS ERP SYSTEM</strong><br>
              Generado: ${new Date().toLocaleString()}
            </div>
          </div>

          <div class="chart-container">
            <h3 style="margin-top:0">Tendencia de Ventas en el Periodo</h3>
            <canvas id="salesReportChart" height="100"></canvas>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSalesForReport.map(s => `
                <tr>
                  <td style="font-family: monospace;">${s.id}</td>
                  <td>${new Date(s.date).toLocaleDateString()}</td>
                  <td>${s.clientName}</td>
                  <td style="font-weight: bold;">$${s.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              ${filteredSalesForReport.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding: 40px; color: #94a3b8;">No se encontraron registros en este rango de fechas.</td></tr>' : ''}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <span style="text-transform: uppercase; font-size: 11px; letter-spacing: 1px; opacity: 0.7;">Venta Total del Periodo</span>
              <h2>$${total.toFixed(2)}</h2>
            </div>
          </div>

          <button onclick="window.print()" class="no-print" style="margin-top: 40px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Imprimir Reporte</button>

          <script>
            const ctx = document.getElementById('salesReportChart').getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: ${chartLabels},
                datasets: [{
                  label: 'Ventas ($)',
                  data: ${chartData},
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                  tension: 0.3,
                  borderWidth: 3,
                  pointBackgroundColor: '#3b82f6'
                }]
              },
              options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } }
                }
              }
            });
          </script>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  const handleGenerateInventoryStatus = () => {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Por favor, permite las ventanas emergentes para ver el reporte.');
      return;
    }
    
    const criticos = products.filter(p => p.stock <= p.minStock);
    const valorInventario = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Estado de Inventario - Nexus ERP</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 3px solid #ef4444; padding-bottom: 10px; margin-bottom: 20px; }
            .summary { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; }
            .alert-card { border-color: #fecaca; background: #fef2f2; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; border: 1px solid #e2e8f0; font-size: 12px; }
            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
            .critical { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Estado Actual de Inventario</h1>
            <p>Generado: ${new Date().toLocaleString()}</p>
          </div>
          <div class="summary">
            <div class="card">
              <h3 style="margin-top:0">Resumen de Almacén</h3>
              <p>Total SKUs Activos: <strong>${products.length}</strong></p>
              <p>Valorización de Stock: <strong>$${valorInventario.toFixed(2)}</strong></p>
            </div>
            <div class="card alert-card">
              <h3 style="color:#dc2626; margin-top:0">Alertas Críticas</h3>
              <p>Productos Bajo Mínimo: <strong>${criticos.length}</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Producto</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>P. Venta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td>${p.code}</td>
                  <td>${p.name}</td>
                  <td>${p.stock}</td>
                  <td>${p.minStock}</td>
                  <td>$${p.price.toFixed(2)}</td>
                  <td class="${p.stock <= p.minStock ? 'critical' : ''}">${p.stock <= p.minStock ? 'REPONER URGENTE' : 'ÓPTIMO'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  const handleDateContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const input = e.currentTarget.querySelector('input');
    if (input) {
      if ('showPicker' in input) {
        try {
          (input as any).showPicker();
        } catch (err) {
          input.focus();
        }
      } else {
        input.focus();
      }
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard sales={sales} products={products} />;
      case 'NEW_SALE':
        return <NewSale products={products} clients={clients} currentUser={user} onCompleteSale={onCompleteSale} />;
      case 'PRODUCTS':
        return <Inventory products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'CLIENTS':
        return <Clients clients={clients} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />;
      case 'SALES_HISTORY':
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Historial de Ventas</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr className="border-b">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Artículos</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {sales.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 italic">No hay transacciones registradas</td></tr>
                  ) : sales.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                      <td className="px-4 py-3">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium">{s.clientName}</td>
                      <td className="px-4 py-3">{s.items.length}</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">${s.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'USERS':
        return user.role === Role.ADMIN ? (
          <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} />
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
             <p className="text-slate-500 font-medium">No tiene permisos de administrador.</p>
          </div>
        );
      case 'PROVIDERS':
        return <ProviderManagement providers={providers} onSave={handleSaveProvider} onDelete={handleDeleteProvider} isAdmin={user.role === Role.ADMIN} />;
      case 'REPORTS':
        const salesByDayData = sales.reduce((acc: any, sale) => {
          const date = new Date(sale.date).toLocaleDateString('es-ES', { weekday: 'short' });
          acc[date] = (acc[date] || 0) + sale.total;
          return acc;
        }, {});
        const reportChartData = Object.keys(salesByDayData).map(key => ({ name: key, total: salesByDayData[key] }));

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Generador de Reportes Analíticos</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 p-6 border border-slate-100 rounded-xl bg-slate-50">
                  <h4 className="font-bold text-slate-900 mb-4">Parámetros del Reporte de Ventas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="group">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Fecha de Inicio</label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={handleDateContainerClick}
                      >
                        <input 
                          type="date" 
                          className="w-full p-2.5 pr-10 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none text-slate-900"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Fecha de Fin</label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={handleDateContainerClick}
                      >
                        <input 
                          type="date" 
                          className="w-full p-2.5 pr-10 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none text-slate-900"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleExportSalesPDF}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Generar Reporte de Ventas con Gráfico
                    </button>
                  </div>
                </div>

                <div className="p-6 border border-slate-100 rounded-xl bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Estado del Inventario</h4>
                    <p className="text-xs text-slate-500 mb-4">Obtén una lista completa de existencias, valorización y alertas críticas de reposición.</p>
                  </div>
                  <button 
                    onClick={handleGenerateInventoryStatus}
                    className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-900 shadow-lg transition-all"
                  >
                    Generar PDF de Inventario
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-slate-100 rounded-xl bg-white shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-6">Tendencia de Ventas (Histórico)</h4>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          {reportChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 border border-slate-100 rounded-xl bg-white shadow-sm">
                   <h4 className="font-bold text-slate-900 mb-6">Resumen del Periodo Seleccionado</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm py-3 border-b border-slate-100">
                        <span className="text-slate-600">Ventas Realizadas:</span>
                        <span className="font-bold text-slate-900">{filteredSalesForReport.length} facturas</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-3 border-b border-slate-100">
                        <span className="text-slate-600">Ticket Promedio:</span>
                        <span className="font-bold text-slate-900">
                          ${filteredSalesForReport.length > 0 ? (filteredSalesForReport.reduce((acc, s) => acc + s.total, 0) / filteredSalesForReport.length).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-3 border-b border-slate-100">
                        <span className="text-slate-600">Monto Acumulado:</span>
                        <span className="font-bold text-blue-600 font-bold text-lg">
                          ${filteredSalesForReport.reduce((acc, s) => acc + s.total, 0).toLocaleString()}
                        </span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      <Sidebar currentView={currentView} setView={setCurrentView} user={user} onLogout={handleLogout} />
      <main className="ml-64 p-8 transition-all duration-300">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900 capitalize tracking-tight">{currentView.toLowerCase().replace('_', ' ')}</span>
          </div>
          <div className="text-sm font-medium text-slate-600 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
