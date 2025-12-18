
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
 * UserManagement Sub-component
 */
const UserManagement: React.FC<{ users: User[], currentUser: User, onSave: (u: User) => void, onDelete: (id: string) => void }> = ({ users, currentUser, onSave, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Partial<User>>({ 
    name: '', email: '', username: '', password: '', role: Role.SELLER, isActive: true, imageUrl: '', securityQuestion: '', securityAnswer: ''
  });

  const openModal = (u?: User) => {
    setShowPassword(false);
    setShowConfirmSave(false);
    if (u) {
      setEditingUser(u);
      setForm({ ...u });
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', username: '', password: '', role: Role.SELLER, isActive: true, imageUrl: '', securityQuestion: '', securityAnswer: '' });
    }
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) setShowConfirmSave(true); else executeSave();
  };

  const executeSave = () => {
    const userData = { ...form as User, id: editingUser ? editingUser.id : `u-${Date.now()}` };
    onSave(userData);
    setShowModal(false);
    setShowConfirmSave(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Gestión de Personal</h2>
          <p className="text-sm text-slate-500">Administra accesos y perfiles de seguridad</p>
        </div>
        <button onClick={() => openModal()} className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">+ Nuevo Usuario</button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar force-scrollbar">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
            <tr className="border-b">
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Nombre Completo</th>
              <th className="px-4 py-3 hidden md:table-cell">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                    {u.imageUrl ? <img src={u.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{u.name.charAt(0)}</div>}
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">{u.name} {u.id === currentUser.id && <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase font-black">Tú</span>}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden md:table-cell">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.role === Role.ADMIN ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-black mr-4 uppercase text-[11px] tracking-widest">Editar</button>
                  {u.id !== currentUser.id && <button onClick={() => onDelete(u.id)} className="text-rose-400 hover:text-rose-600 font-black uppercase text-[11px] tracking-widest">Borrar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl my-auto border border-white/20 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editingUser ? 'Editar Perfil' : 'Alta de Usuario'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>
            
            {!showConfirmSave ? (
              <form onSubmit={handlePreSubmit} className="p-8 space-y-5">
                <div className="flex items-center gap-6 mb-2">
                  <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-xl overflow-hidden relative group cursor-pointer ring-1 ring-slate-100 shrink-0">
                    {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Nombre del Funcionario</label>
                    <input required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">ID Sistema</label>
                    <input required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-mono text-sm" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Credencial</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required={!editingUser} 
                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-mono text-sm pr-10" 
                        value={form.password} 
                        onChange={e => setForm({...form, password: e.target.value})} 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-300 hover:text-blue-500">
                        {showPassword ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.273 4.273M19.727 19.727L14.12 14.12" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Seguridad de Recuperación</p>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Pregunta Secreta</label>
                      <input required placeholder="Ejem: ¿Nombre de tu mascota?" className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={form.securityQuestion} onChange={e => setForm({...form, securityQuestion: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Respuesta Secreta</label>
                      <input required placeholder="Respuesta..." className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={form.securityAnswer} onChange={e => setForm({...form, securityAnswer: e.target.value})} />
                   </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Rol Administrativo</label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm" value={form.role} onChange={e => setForm({...form, role: e.target.value as Role})}>
                    <option value={Role.ADMIN}>Administrador</option>
                    <option value={Role.SELLER}>Vendedor</option>
                    <option value={Role.WAREHOUSE}>Almacén</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">Guardar Perfil</button>
                </div>
              </form>
            ) : (
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">¿Confirmar Actualización?</h4>
                <p className="text-slate-500 text-sm font-medium">Se aplicarán los cambios al perfil de <span className="text-slate-900 font-black">{form.name}</span>. El acceso se actualizará de inmediato.</p>
                <div className="flex gap-3 pt-6">
                  <button onClick={() => setShowConfirmSave(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Regresar</button>
                  <button onClick={executeSave} className="flex-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">Confirmar Cambios</button>
                </div>
              </div>
            )}
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

  // Providers CRUD state
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [providerForm, setProviderForm] = useState<Partial<Provider>>({ name: '', contactName: '', email: '', phone: '', category: '' });

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleLogin = (u: string, p?: string) => {
    const loggedUser = dataService.login(u, p);
    if (loggedUser) { setUser(loggedUser); setView('DASHBOARD'); } else alert('Credenciales inválidas');
  };

  const handleLogout = () => { dataService.logout(); setUser(null); setView('DASHBOARD'); };

  const handleExportCSV = () => {
    const csvRows = [
      ["Reporte de Analiticas Nexus ERP"],
      ["Fecha", new Date().toLocaleString()],
      [],
      ["RESUMEN"],
      ["Ventas Totales ($)", sales.reduce((a, b) => a + b.total, 0).toFixed(2)],
      ["Inventario Valorizado ($)", products.reduce((a, b) => a + (b.cost * b.stock), 0).toFixed(2)],
      [],
      ["ID VENTA", "FECHA", "CLIENTE", "TOTAL"]
    ];
    sales.forEach(s => csvRows.push([s.id, new Date(s.date).toLocaleDateString(), s.clientName, s.total.toFixed(2)]));
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Nexus_${Date.now()}.csv`;
    link.click();
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Reporte Ejecutivo Nexus ERP</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            h1 { color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
            .summary { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 30px; }
            .card { background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; }
            .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Reporte Ejecutivo Nexus ERP</h1>
          <p>Fecha de emisión: ${new Date().toLocaleString()}</p>
          <div class="summary">
            <div class="card">
              <strong>Ventas Acumuladas</strong><br/>
              <span style="font-size: 24px; font-weight: bold;">$${sales.reduce((a,b)=>a+b.total, 0).toFixed(2)}</span>
            </div>
            <div class="card">
              <strong>Valor de Almacén</strong><br/>
              <span style="font-size: 24px; font-weight: bold;">$${products.reduce((a,b)=>a+(b.cost*b.stock), 0).toFixed(2)}</span>
            </div>
          </div>
          <h3>Registro de Transacciones</h3>
          <table>
            <thead><tr><th>ID OPERACION</th><th>FECHA</th><th>CLIENTE</th><th>TOTAL</th></tr></thead>
            <tbody>${sales.map(s => `<tr><td>${s.id}</td><td>${new Date(s.date).toLocaleDateString()}</td><td>${s.clientName}</td><td>$${s.total.toFixed(2)}</td></tr>`).join('')}</tbody>
          </table>
          <div class="footer">Este documento es un reporte generado automáticamente por Nexus ERP.</div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setShowExportModal(false);
  };

  const handleOpenProviderModal = (p?: Provider) => {
    if (p) { setEditingProvider(p); setProviderForm(p); }
    else { setEditingProvider(null); setProviderForm({ name: '', contactName: '', email: '', phone: '', category: '' }); }
    setShowProviderModal(true);
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    const p = { ...providerForm as Provider, id: editingProvider ? editingProvider.id : `pr-${Date.now()}` };
    dataService.saveProvider(p);
    setProviders(dataService.getProviders());
    setShowProviderModal(false);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex bg-slate-50 min-h-screen relative font-sans antialiased text-slate-900">
      <Sidebar user={user} currentView={view} setView={(v) => { setView(v); setIsSidebarOpen(false); }} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen w-full min-w-0">
        <header className="lg:hidden flex items-center justify-between p-5 bg-slate-900 text-white sticky top-0 z-40 shadow-xl">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg></button>
           <h1 className="font-black text-blue-400 tracking-tighter text-lg uppercase italic">Nexus ERP</h1>
           <div className="w-9 h-9 rounded-full bg-blue-500 overflow-hidden border-2 border-slate-700 shadow-inner">{user.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{user.name.charAt(0)}</div>}</div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar force-scrollbar animate-in fade-in duration-500">
          {view === 'DASHBOARD' && <Dashboard sales={sales} products={products} />}
          {view === 'USERS' && <UserManagement users={users} currentUser={user} onSave={(u) => { dataService.saveUser(u); setUsers(dataService.getUsers()); }} onDelete={(id) => { dataService.deleteUser(id); setUsers(dataService.getUsers()); }} />}
          {view === 'PRODUCTS' && <Inventory products={products} onSaveProduct={(p) => { dataService.saveProduct(p); setProducts(dataService.getProducts()); }} onDeleteProduct={(id) => { dataService.deleteProduct(id); setProducts(dataService.getProducts()); }} />}
          {view === 'CLIENTS' && <Clients clients={clients} onSaveClient={(c) => { dataService.saveClient(c); setClients(dataService.getClients()); }} onDeleteClient={(id) => { dataService.deleteClient(id); setClients(dataService.getClients()); }} />}
          {view === 'NEW_SALE' && <NewSale products={products} clients={clients} currentUser={user} onCompleteSale={(s) => { dataService.completeSale(s); setSales(dataService.getSales()); setProducts(dataService.getProducts()); }} />}
          {view === 'PURCHASES' && <Purchases products={products} providers={providers} purchases={purchases} onCompletePurchase={(p) => { dataService.completePurchase(p); setPurchases(dataService.getPurchases()); setProducts(dataService.getProducts()); }} />}
          
          {view === 'PROVIDERS' && (
             <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
               <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Directorio de Proveedores</h2><p className="text-sm text-slate-500">Gestión de suministros y abastecimiento</p></div>
                  <button onClick={() => handleOpenProviderModal()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">+ Añadir Proveedor</button>
               </div>
               <div className="overflow-x-auto custom-scrollbar force-scrollbar">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-[0.1em]">
                     <tr><th className="px-4 py-4">Nombre Comercial</th><th className="px-4 py-4">Contacto Directo</th><th className="px-4 py-4">Categoría</th><th className="px-4 py-4 text-right">Acciones</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {providers.map(p => (
                       <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-4 py-4 font-black text-slate-900 uppercase tracking-tighter">{p.name}</td>
                         <td className="px-4 py-4 text-slate-500 font-medium">{p.contactName}</td>
                         <td className="px-4 py-4"><span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest">{p.category}</span></td>
                         <td className="px-4 py-4 text-right whitespace-nowrap">
                            <button onClick={() => handleOpenProviderModal(p)} className="text-blue-600 hover:text-blue-800 font-black mr-4 uppercase text-[11px] tracking-widest">Editar</button>
                            <button onClick={() => { if(confirm('¿Borrar proveedor?')) { dataService.deleteProvider(p.id); setProviders(dataService.getProviders()); } }} className="text-rose-400 hover:text-rose-600 font-black uppercase text-[11px] tracking-widest">Borrar</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {view === 'REPORTS' && (
             <div className="space-y-6 pb-24 custom-scrollbar force-scrollbar">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Reportes de Rendimiento</h2>
                  <button onClick={() => setShowExportModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Exportar Reporte</button>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-[450px] relative overflow-hidden">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Volumen de Facturación</h3>
                   <ResponsiveContainer width="100%" height="80%">
                     <BarChart data={[{name: 'Ventas', v: sales.reduce((a,b)=>a+b.total,0)}, {name: 'Inversión', v: products.reduce((a,b)=>a+(b.cost*b.stock),0)}]}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} /><Bar dataKey="v" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={50} /></BarChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full mb-8 flex items-center justify-center shadow-inner ring-8 ring-blue-50/50"><svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-3">Balance de Operaciones</h4>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium uppercase tracking-tighter">Comparativa en tiempo real entre el valor de inventario y la facturación acumulada.</p>
                 </div>
               </div>
             </div>
          )}
        </main>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[150] p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Exportar Reporte</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>
            <div className="p-8 space-y-4">
              <button onClick={handleExportPDF} className="w-full flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-100"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg></div>
                  <div className="text-left"><p className="font-black text-slate-800 text-sm">FORMATO PDF</p><p className="text-[10px] text-slate-400 uppercase font-bold">Impresión Ejecutiva</p></div>
                </div>
              </button>
              <button onClick={handleExportCSV} className="w-full flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl group-hover:bg-emerald-100"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></div>
                  <div className="text-left"><p className="font-black text-slate-800 text-sm">FORMATO CSV (EXCEL)</p><p className="text-[10px] text-slate-400 uppercase font-bold">Análisis de Datos</p></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {showProviderModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl my-auto border border-slate-200 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button onClick={() => setShowProviderModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={handleSaveProvider} className="p-8 space-y-4">
              <input required placeholder="Nombre Comercial" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold" value={providerForm.name} onChange={e => setProviderForm({...providerForm, name: e.target.value})} />
              <input required placeholder="Nombre de Contacto" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={providerForm.contactName} onChange={e => setProviderForm({...providerForm, contactName: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Teléfono" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={providerForm.phone} onChange={e => setProviderForm({...providerForm, phone: e.target.value})} />
                <input required placeholder="Categoría" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={providerForm.category} onChange={e => setProviderForm({...providerForm, category: e.target.value})} />
              </div>
              <input type="email" required placeholder="Email corporativo" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" value={providerForm.email} onChange={e => setProviderForm({...providerForm, email: e.target.value})} />
              <div className="flex gap-3 pt-6 border-t">
                <button type="button" onClick={() => setShowProviderModal(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Guardar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
