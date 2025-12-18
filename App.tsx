
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
 * UserManagement sub-component to handle user CRUD operations
 */
const UserManagement: React.FC<{ users: User[], onSave: (u: User) => void, onDelete: (id: string) => void }> = ({ users, onSave, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    if (u) {
      setEditingUser(u);
      setForm({ ...u });
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', username: '', password: '', role: Role.SELLER, isActive: true, imageUrl: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = { ...form as User, id: editingUser ? editingUser.id : `u-${Date.now()}` };
    onSave(userData);
    setShowModal(false);
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
                  <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    {u.imageUrl ? <img src={u.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">{u.name.charAt(0)}</div>}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.username}</td>
                <td className="px-4 py-3">
                   <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : u.role === Role.SELLER ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                     {u.role}
                   </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Editar</button>
                  <button onClick={() => { if(confirm('¿Eliminar usuario?')) onDelete(u.id) }} className="text-rose-600 hover:text-rose-800 font-medium">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50">
              <h3 className="text-lg font-bold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                <input required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <input type="password" required={!editingUser} className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900" value={form.role} onChange={e => setForm({...form, role: e.target.value as Role})}>
                  <option value={Role.ADMIN}>Administrador</option>
                  <option value={Role.SELLER}>Vendedor</option>
                  <option value={Role.WAREHOUSE}>Almacén</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg">Guardar</button>
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

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-900">
      <Sidebar user={user} currentView={view} setView={setView} onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {view === 'DASHBOARD' && <Dashboard sales={sales} products={products} />}
        {view === 'USERS' && <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} />}
        {view === 'PRODUCTS' && <Inventory products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />}
        {view === 'CLIENTS' && <Clients clients={clients} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />}
        {view === 'NEW_SALE' && <NewSale products={products} clients={clients} currentUser={user} onCompleteSale={handleCompleteSale} />}
        {view === 'SALES_HISTORY' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Historial de Ventas</h2>
              <p className="text-sm text-slate-500">Registro de todas las operaciones de venta realizadas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">ID Venta</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 italic">No hay registros de ventas</td>
                    </tr>
                  ) : (
                    sales.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 font-bold">{s.id}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(s.date).toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{s.clientName}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">${s.total.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {view === 'PURCHASES' && <Purchases products={products} providers={providers} purchases={purchases} onCompletePurchase={handleCompletePurchase} />}
        {view === 'PROVIDERS' && (
           <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <div className="mb-6">
               <h2 className="text-xl font-bold text-slate-800">Directorio de Proveedores</h2>
               <p className="text-sm text-slate-500">Gestión de contactos para abastecimiento</p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                   <tr>
                     <th className="px-4 py-3">Nombre</th>
                     <th className="px-4 py-3">Contacto</th>
                     <th className="px-4 py-3">Email</th>
                     <th className="px-4 py-3">Categoría</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {providers.map(p => (
                     <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-4 py-3 font-bold text-slate-900">{p.name}</td>
                       <td className="px-4 py-3 text-slate-600">{p.contactName}</td>
                       <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.email}</td>
                       <td className="px-4 py-3">
                         <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold uppercase">{p.category}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
        {view === 'REPORTS' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Reportes Ejecutivos</h2>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Exportar PDF
                </button>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-semibold mb-6 text-slate-800">Facturación Diaria</h3>
                 <div style={{ height: 300 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={[
                       { name: 'Lun', value: 1200 },
                       { name: 'Mar', value: 1900 },
                       { name: 'Mie', value: 1500 },
                       { name: 'Jue', value: 2100 },
                       { name: 'Vie', value: 2400 },
                       { name: 'Sab', value: 1800 },
                       { name: 'Dom', value: 1100 }
                     ]}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                       <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">Módulo de Reportes Avanzados</h4>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Seleccione filtros personalizados para generar métricas de rentabilidad y proyecciones de stock.</p>
                  </div>
               </div>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
