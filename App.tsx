
import React, { useState, useEffect, useMemo } from 'react';
import { User, Role, ViewType, Product, Client, Sale, Provider, Purchase } from './types';
import { dataService } from './services/dataService';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewSale from './pages/NewSale';
import Inventory from './pages/Inventory';
import Clients from './pages/Clients';
import Purchases from './pages/Purchases';
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
      setForm({ name: '', email: '', username: '', password: '', role: Role.SELLER, isActive: true, imageUrl: '' });
    }
    setShowPassword(false);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmSave = () => {
    const isEditing = !!editingUser;
    const userData: User = { ...form as User, id: isEditing ? editingUser!.id : `u-${Date.now()}` };
    onSave(userData);
    setShowConfirm(false);
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
                   <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">{roleLabels[u.role]}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center font-bold text-[11px] ${u.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div> {u.isActive ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-bold">Editar</button>
                  <button onClick={() => { if(confirm(`¿Eliminar a ${u.name}?`)) onDelete(u.id) }} className="text-rose-500 hover:text-rose-700 font-bold">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-slate-900">{editingUser ? 'Editar' : 'Registrar'} Usuario</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmSave(); }} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden relative">
                  {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">👤</div>}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <input required placeholder="Nombre" className="w-full p-2.5 border rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required placeholder="Usuario" className="w-full p-2.5 border rounded-xl" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
              <input required type="password" placeholder="Contraseña" className="w-full p-2.5 border rounded-xl" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <select className="w-full p-2.5 border rounded-xl" value={form.role} onChange={e => setForm({...form, role: e.target.value as Role})}>
                <option value={Role.ADMIN}>Administrador</option>
                <option value={Role.SELLER}>Vendedor</option>
                <option value={Role.WAREHOUSE}>Almacén</option>
              </select>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold">Cancelar</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ProviderManagement: React.FC<{ providers: Provider[], onSave: (p: Provider) => void, onDelete: (id: string) => void, isAdmin: boolean }> = ({ providers, onSave, onDelete, isAdmin }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [form, setForm] = useState<Partial<Provider>>({ name: '', contactName: '', email: '', phone: '', category: '', imageUrl: '' });

  const openModal = (p?: Provider) => {
    if (p) { setEditingProvider(p); setForm(p); } 
    else { setEditingProvider(null); setForm({ name: '', contactName: '', email: '', phone: '', category: '', imageUrl: '' }); }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form as Provider, id: editingProvider ? editingProvider.id : `pr-${Date.now()}` });
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
        {isAdmin && <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Nuevo Proveedor</button>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Logo</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Teléfono</th>
              {isAdmin && <th className="px-6 py-4 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {providers.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🏢</div>}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">{p.name}</td>
                <td className="px-6 py-4">{p.contactName}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500">{p.category}</td>
                <td className="px-6 py-4 text-slate-500">{p.email}</td>
                <td className="px-6 py-4 text-slate-500">{p.phone}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(p)} className="text-blue-600 font-bold mr-3">Editar</button>
                    <button onClick={() => { if(confirm('¿Eliminar proveedor?')) onDelete(p.id) }} className="text-rose-600 font-bold">Borrar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">{editingProvider ? 'Editar' : 'Nuevo'} Proveedor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Nombre de Empresa" className="w-full p-2.5 border rounded-lg" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required placeholder="Contacto" className="w-full p-2.5 border rounded-lg" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} />
              <input required placeholder="Categoría" className="w-full p-2.5 border rounded-lg" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Email" className="w-full p-2.5 border rounded-lg" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input required placeholder="Teléfono" className="w-full p-2.5 border rounded-lg" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [reportStartDate, setReportStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const activeUser = dataService.getCurrentUser();
    if (activeUser) { setUser(activeUser); loadSystemData(); }
  }, []);

  const loadSystemData = () => {
    setProducts(dataService.getProducts());
    setClients(dataService.getClients());
    setSales(dataService.getSales());
    setProviders(dataService.getProviders());
    setUsers(dataService.getUsers());
    setPurchases(dataService.getPurchases());
  };

  const handleLogin = (username: string, password?: string) => {
    const loggedInUser = dataService.login(username, password);
    if (loggedInUser) { setUser(loggedInUser); loadSystemData(); }
    else alert('Credenciales inválidas');
  };

  const handleLogout = () => { dataService.logout(); setUser(null); setCurrentView('DASHBOARD'); };

  const onCompleteSale = (sale: Sale) => {
    dataService.completeSale(sale);
    loadSystemData();
    setCurrentView('SALES_HISTORY');
  };

  const onCompletePurchase = (purchase: Purchase) => {
    dataService.completePurchase(purchase);
    loadSystemData();
    setCurrentView('PRODUCTS');
    alert('Compra registrada: Stock actualizado correctamente');
  };

  const handleSaveProduct = (p: Product) => { dataService.saveProduct(p); loadSystemData(); };
  const handleDeleteProduct = (id: string) => { dataService.deleteProduct(id); loadSystemData(); };
  const handleSaveClient = (c: Client) => { dataService.saveClient(c); loadSystemData(); };
  const handleDeleteClient = (id: string) => { dataService.deleteClient(id); loadSystemData(); };
  const handleSaveUser = (u: User) => { dataService.saveUser(u); loadSystemData(); };
  const handleDeleteUser = (id: string) => { dataService.deleteUser(id); loadSystemData(); };
  const handleSaveProvider = (p: Provider) => { dataService.saveProvider(p); loadSystemData(); };
  const handleDeleteProvider = (id: string) => { dataService.deleteProvider(id); loadSystemData(); };

  const filteredSalesForReport = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.date.split('T')[0];
      return saleDate >= reportStartDate && saleDate <= reportEndDate;
    });
  }, [sales, reportStartDate, reportEndDate]);

  const handleExportSalesPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const total = filteredSalesForReport.reduce((acc, s) => acc + s.total, 0);
    const html = `<html><head><title>Nexus ERP - Reporte</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #ddd;text-align:left}</style></head><body><h1>Reporte de Ventas</h1><p>Período: ${reportStartDate} - ${reportEndDate}</p><table><thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Monto</th></tr></thead><tbody>${filteredSalesForReport.map(s => `<tr><td>${s.id}</td><td>${new Date(s.date).toLocaleDateString()}</td><td>${s.clientName}</td><td>$${s.total.toFixed(2)}</td></tr>`).join('')}</tbody></table><h3>TOTAL: $${total.toFixed(2)}</h3><button onclick="window.print()">Imprimir</button></body></html>`;
    win.document.write(html); win.document.close();
  };

  const handleExportInventoryPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const totalValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const html = `<html><head><title>Inventario - Nexus ERP</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #ddd;text-align:left}.warning{color:red;font-weight:bold}</style></head><body><h1>Inventario Actual</h1><p>Fecha: ${new Date().toLocaleString()}</p><table><thead><tr><th>Código</th><th>Nombre</th><th>Stock</th><th>Costo</th><th>V. Inventario</th></tr></thead><tbody>${products.map(p => `<tr><td>${p.code}</td><td>${p.name}</td><td class="${p.stock <= p.minStock ? 'warning' : ''}">${p.stock}</td><td>$${p.cost.toFixed(2)}</td><td>$${(p.stock*p.cost).toFixed(2)}</td></tr>`).join('')}</tbody></table><h3>Valorización Total: $${totalValue.toFixed(2)}</h3><button onclick="window.print()">Imprimir</button></body></html>`;
    win.document.write(html); win.document.close();
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard sales={sales} products={products} />;
      case 'NEW_SALE': return <NewSale products={products} clients={clients} currentUser={user} onCompleteSale={onCompleteSale} />;
      case 'PRODUCTS': return <Inventory products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'CLIENTS': return <Clients clients={clients} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />;
      case 'PURCHASES': return <Purchases products={products} providers={providers} purchases={purchases} onCompletePurchase={onCompletePurchase} />;
      case 'SALES_HISTORY': return (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Historial de Ventas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 uppercase text-slate-500 font-bold border-b"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Total</th></tr></thead>
              <tbody className="divide-y">{sales.map(s => (<tr key={s.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono text-xs">{s.id}</td><td className="px-4 py-3">{new Date(s.date).toLocaleDateString()}</td><td className="px-4 py-3">{s.clientName}</td><td className="px-4 py-3 font-bold text-emerald-600">${s.total.toFixed(2)}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      );
      case 'USERS': return user.role === Role.ADMIN ? <UserManagement users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} /> : <div className="p-12 text-center bg-white rounded-xl border">No autorizado</div>;
      case 'PROVIDERS': return <ProviderManagement providers={providers} onSave={handleSaveProvider} onDelete={handleDeleteProvider} isAdmin={user.role === Role.ADMIN} />;
      case 'REPORTS':
        const reportChartData = Object.entries(sales.reduce((acc:any, s) => { const d = new Date(s.date).toLocaleDateString('es-ES', {weekday:'short'}); acc[d] = (acc[d] || 0) + s.total; return acc;}, {})).map(([name, total]) => ({name, total}));
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Generador de Reportes</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="p-6 border rounded-xl bg-slate-50">
                  <h4 className="font-bold mb-4">Ventas por Período</h4>
                  <div className="flex gap-4">
                    <input type="date" className="p-2 border rounded w-1/2" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} />
                    <input type="date" className="p-2 border rounded w-1/2" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} />
                  </div>
                  <button onClick={handleExportSalesPDF} className="mt-4 w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Exportar Ventas PDF</button>
                </div>
                <div className="p-6 border rounded-xl bg-slate-50 flex flex-col justify-between">
                   <h4 className="font-bold mb-2">Estado de Inventario</h4>
                   <button onClick={handleExportInventoryPDF} className="bg-slate-800 text-white p-3 rounded-xl font-bold">Ver PDF de Inventario</button>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
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
          <span className="text-sm font-bold uppercase tracking-widest text-slate-400">{currentView.replace('_', ' ')}</span>
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
