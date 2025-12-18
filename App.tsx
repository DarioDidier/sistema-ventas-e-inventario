
import React, { useState, useEffect } from 'react';
import { User, Role, ViewType, Product, Client, Sale, Provider, Purchase } from './types.ts';
import { dataService } from './services/dataService.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import NewSale from './pages/NewSale.tsx';
import Inventory from './pages/Inventory.tsx';
import Clients from './pages/Clients.tsx';
import Purchases from './pages/Purchases.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * UserManagement sub-component
 */
const UserManagement: React.FC<{ users: User[], onSave: (u: User) => void, onDelete: (id: string) => void }> = ({ users, onSave, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
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

  const openModal = (u?: User) => {
    setShowPassword(false);
    if (u) {
      setEditingUser(u);
      setForm({ ...u });
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', username: '', password: '', role: Role.SELLER, isActive: true, imageUrl: '' });
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
    const userData: User = { ...form as User, id: editingUser ? editingUser.id : `u-${Date.now()}` };
    onSave(userData);
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-xl border p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500">Administra el acceso y roles del personal</p>
        </div>
        <button onClick={() => openModal()} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">+ Nuevo Usuario</button>
      </div>
      
      <div className="overflow-x-auto -mx-4 md:mx-0 custom-scrollbar force-scrollbar">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
              <tr className="border-b">
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 hidden md:table-cell">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                      {u.imageUrl ? <img src={u.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">{u.name.charAt(0)}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden md:table-cell">{u.username}</td>
                  <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : u.role === Role.SELLER ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                       {u.role}
                     </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Editar</button>
                    <button onClick={() => { if(confirm('¿Eliminar usuario?')) onDelete(u.id) }} className="text-rose-600 hover:text-rose-800 font-medium">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-auto">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Imagen de Perfil (Solicitud Usuario) */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden mb-2 relative group cursor-pointer hover:border-blue-400 transition-all">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Cambiar Imagen</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                <input required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label>
                  <input required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required={!editingUser} 
                      className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 pr-10 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={form.password} 
                      onChange={e => setForm({...form, password: e.target.value})} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={form.role} onChange={e => setForm({...form, role: e.target.value as Role})}>
                  <option value={Role.ADMIN}>Administrador</option>
                  <option value={Role.SELLER}>Vendedor</option>
                  <option value={Role.WAREHOUSE}>Almacén</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-bold text-sm uppercase">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-black text-sm uppercase rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(dataService.getCurrentUser());
  const [view, setView] = useState<ViewType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    if (user) {
      setProducts(dataService.getProducts());
      setClients(dataService.getClients());
      setUsers(dataService.getUsers());
      setSales(dataService.getSales());
      setProviders(dataService.getProviders());
      setPurchases(dataService.getPurchases());
    }
  }, [user]);

  const handleLogin = (username: string, password?: string) => {
    const loggedUser = dataService.login(username, password);
    if (loggedUser) {
      setUser(loggedUser);
    } else {
      alert('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    dataService.logout();
    setUser(null);
    setView('DASHBOARD');
    setIsSidebarOpen(false);
  };

  const handleSaveProduct = (p: Product) => {
    dataService.saveProduct(p);
    setProducts(dataService.getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    dataService.deleteProduct(id);
    setProducts(dataService.getProducts());
  };

  const handleSaveClient = (c: Client) => {
    dataService.saveClient(c);
    setClients(dataService.getClients());
  };

  const handleDeleteClient = (id: string) => {
    dataService.deleteClient(id);
    setClients(dataService.getClients());
  };

  const handleSaveUser = (u: User) => {
    dataService.saveUser(u);
    setUsers(dataService.getUsers());
  };

  const handleDeleteUser = (id: string) => {
    dataService.deleteUser(id);
    setUsers(dataService.getUsers());
  };

  const handleCompleteSale = (s: Sale) => {
    dataService.completeSale(s);
    setSales(dataService.getSales());
    setProducts(dataService.getProducts());
    setClients(dataService.getClients());
  };

  const handleCompletePurchase = (p: Purchase) => {
    dataService.completePurchase(p);
    setPurchases(dataService.getPurchases());
    setProducts(dataService.getProducts());
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-900 relative">
      <Sidebar 
        user={user} 
        currentView={view} 
        setView={(v) => { setView(v); setIsSidebarOpen(false); }} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full min-w-0 lg:ml-64 bg-slate-50 min-h-screen">
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40 shadow-md">
           <div className="flex items-center gap-3">
             <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
             </button>
             <h1 className="text-lg font-bold tracking-tight text-blue-400">NEXUS ERP</h1>
           </div>
           <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold overflow-hidden border border-slate-700 shadow-inner">
             {user.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" /> : user.name.charAt(0)}
           </div>
        </header>

        {/* CONTENEDOR PRINCIPAL CON SCROLL MEJORADO Y BARRA LATERAL VISIBLE EN MÓVILES */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar force-scrollbar">
          {view === 'DASHBOARD' && <Dashboard sales={sales} products={products} />}
          {view === 'USERS' && <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} />}
          {view === 'PRODUCTS' && <Inventory products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />}
          {view === 'CLIENTS' && <Clients clients={clients} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />}
          {view === 'NEW_SALE' && <NewSale products={products} clients={clients} currentUser={user} onCompleteSale={handleCompleteSale} />}
          {view === 'PURCHASES' && <Purchases products={products} providers={providers} purchases={purchases} onCompletePurchase={handleCompletePurchase} />}
          
          {view === 'REPORTS' && (
             <div className="space-y-6 pb-20 custom-scrollbar force-scrollbar"> 
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reportes Ejecutivos</h2>
                  <button className="w-full sm:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-slate-200">
                    Exportar PDF
                  </button>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="text-lg font-bold mb-6 text-slate-800 uppercase tracking-widest text-xs">Ventas Semanales</h3>
                   <div style={{ height: 300 }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { name: 'Lun', value: 1200 }, { name: 'Mar', value: 1900 },
                         { name: 'Mie', value: 1500 }, { name: 'Jue', value: 2100 },
                         { name: 'Vie', value: 2400 }, { name: 'Sab', value: 1800 },
                         { name: 'Dom', value: 1100 }
                       ]}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                         <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                         <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                         <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
                 
                 <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Métricas de Rendimiento</h4>
                    <p className="text-slate-500 text-sm mt-3 max-w-xs leading-relaxed">Análisis profundo de rentabilidad por categoría y vendedor en tiempo real.</p>
                 </div>
               </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
