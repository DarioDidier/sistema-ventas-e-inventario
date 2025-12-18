
import React, { useState, useEffect, useMemo } from 'react';
import { User, Role, ViewType, Product, Client, Sale, Provider } from './types';
import { dataService } from './services/dataService';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewSale from './pages/NewSale';
import Inventory from './pages/Inventory';
import Clients from './pages/Clients';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    setShowConfirm(true); 
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

// Added missing ProviderManagement component to fix compilation error
const ProviderManagement: React.FC<{ 
  providers: Provider[], 
  onSave: (p: Provider) => void, 
  onDelete: (id: string) => void, 
  isAdmin: boolean 
}> = ({ providers, onSave, onDelete, isAdmin }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [form, setForm] = useState<Partial<Provider>>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    category: '',
    imageUrl: ''
  });

  const openModal = (p?: Provider) => {
    if (p) {
      setEditingProvider(p);
      setForm(p);
    } else {
      setEditingProvider(null);
      setForm({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        category: '',
        imageUrl: ''
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form as Provider,
      id: editingProvider ? editingProvider.id : `pr-${Date.now()}`
    });
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
          <p className="text-sm text-slate-500">Directorio de abastecimiento</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nuevo Proveedor
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Logo</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Email / Tel</th>
              {isAdmin && <th className="px-6 py-4 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {providers.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                <td className="px-6 py-4 text-slate-600">{p.contactName}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-500">{p.email}</p>
                  <p className="text-xs text-slate-400 font-mono">{p.phone}</p>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(p)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Editar</button>
                    <button 
                      onClick={() => { if(confirm('¿Eliminar proveedor?')) onDelete(p.id) }} 
                      className="text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Borrar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden mb-2 relative group">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/></svg>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Logo de la empresa</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de la Empresa</label>
                  <input required className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contacto Principal</label>
                  <input required className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
                  <input required className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input type="email" required className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                  <input required className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg transition-all">
                  {editingProvider ? 'Guardar Cambios' : 'Registrar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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
    if (user && u.id === user.id) {
      const updatedUser = { ...u };
      delete updatedUser.password;
      setUser(updatedUser);
      localStorage.setItem('nexus_current_user', JSON.stringify(updatedUser));
    }
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

  const filteredSalesForReport = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.date.split('T')[0];
      return saleDate >= reportStartDate && saleDate <= reportEndDate;
    });
  }, [sales, reportStartDate, reportEndDate]);

  const handleExportSalesPDF = () => {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Por favor, permite las ventanas emergentes.');
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
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .total-box { padding: 20px; background: #1e293b; color: white; border-radius: 12px; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border: 1px solid #e2e8f0; text-align: left; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div><h1>Reporte de Ventas</h1><p>Rango: ${reportStartDate} al ${reportEndDate}</p></div>
            <div><strong>NEXUS ERP</strong><br>${new Date().toLocaleString()}</div>
          </div>
          <div style="margin-bottom:30px;"><canvas id="salesReportChart" height="100"></canvas></div>
          <table><thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Monto</th></tr></thead>
            <tbody>${filteredSalesForReport.map(s => `<tr><td>${s.id}</td><td>${new Date(s.date).toLocaleDateString()}</td><td>${s.clientName}</td><td>$${s.total.toFixed(2)}</td></tr>`).join('')}</tbody>
          </table>
          <div style="display:flex; justify-content:flex-end; margin-top:30px;"><div class="total-box"><h2>Total: $${total.toFixed(2)}</h2></div></div>
          <button onclick="window.print()" class="no-print" style="margin-top:20px; padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer;">Imprimir</button>
          <script>
            new Chart(document.getElementById('salesReportChart'), {
              type: 'line',
              data: { labels: ${chartLabels}, datasets: [{ label: 'Ventas ($)', data: ${chartData}, borderColor: '#3b82f6', fill: true }] }
            });
          </script>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard sales={sales} products={products} />;
      case 'NEW_SALE': return <NewSale products={products} clients={clients} currentUser={user} onCompleteSale={onCompleteSale} />;
      case 'PRODUCTS': return <Inventory products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'CLIENTS': return <Clients clients={clients} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />;
      case 'SALES_HISTORY': return (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Historial de Ventas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 uppercase text-slate-500 font-bold"><tr className="border-b"><th className="px-4 py-3">ID</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Total</th></tr></thead>
              <tbody className="divide-y">{sales.map(s => (<tr key={s.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono">{s.id}</td><td className="px-4 py-3">{new Date(s.date).toLocaleDateString()}</td><td className="px-4 py-3">{s.clientName}</td><td className="px-4 py-3 font-bold text-emerald-600">${s.total.toFixed(2)}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      );
      case 'USERS': return user.role === Role.ADMIN ? <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} /> : <div className="p-12 text-center bg-white rounded-xl border">No tiene permisos de administrador.</div>;
      case 'PROVIDERS': return <ProviderManagement providers={providers} onSave={handleSaveProvider} onDelete={handleDeleteProvider} isAdmin={user.role === Role.ADMIN} />;
      case 'REPORTS':
        const reportChartData = Object.entries(sales.reduce((acc:any, s) => { const d = new Date(s.date).toLocaleDateString('es-ES', {weekday:'short'}); acc[d] = (acc[d] || 0) + s.total; return acc;}, {})).map(([name, total]) => ({name, total}));
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Generador de Reportes</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="p-6 border rounded-xl bg-slate-50">
                  <h4 className="font-bold mb-4">Reporte de Ventas por Período</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative h-[44px] bg-white border rounded-lg flex items-center px-3 cursor-pointer overflow-hidden group">
                      <input type="date" className="absolute inset-0 opacity-0 z-10 w-full h-full cursor-pointer" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} />
                      <span className="flex-1 text-slate-900 text-sm">{reportStartDate ? new Date(reportStartDate+'T00:00:00').toLocaleDateString() : 'Inicio'}</span>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                    <div className="relative h-[44px] bg-white border rounded-lg flex items-center px-3 cursor-pointer overflow-hidden group">
                      <input type="date" className="absolute inset-0 opacity-0 z-10 w-full h-full cursor-pointer" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} />
                      <span className="flex-1 text-slate-900 text-sm">{reportEndDate ? new Date(reportEndDate+'T00:00:00').toLocaleDateString() : 'Fin'}</span>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  <button onClick={handleExportSalesPDF} className="mt-4 w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Exportar Reporte PDF</button>
                </div>
                <div className="p-6 border rounded-xl bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold mb-2">Estado de Almacén</h4>
                    <p className="text-xs text-slate-500 mb-4">Listado de existencias con alertas de stock crítico.</p>
                  </div>
                  <button onClick={() => window.alert('Función de PDF de Inventario')} className="bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-all">Ver PDF de Inventario</button>
                </div>
              </div>
              <div className="h-[300px] w-full bg-white border rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={reportChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} user={user} onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">{currentView.replace('_', ' ')}</span>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-white px-4 py-2 rounded-full border shadow-sm">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
