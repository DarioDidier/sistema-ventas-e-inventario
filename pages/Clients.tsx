
import React, { useState } from 'react';
import { Client } from '../types.ts';

interface ClientsProps {
  clients: Client[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, onSaveClient, onDeleteClient }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>({
    name: '', taxId: '', email: '', phone: '', address: '', imageUrl: ''
  });

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setForm(client);
    } else {
      setEditingClient(null);
      setForm({ name: '', taxId: '', email: '', phone: '', address: '', imageUrl: '' });
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClient({
      ...form as Client,
      id: editingClient ? editingClient.id : `c-${Date.now()}`,
      totalSpent: editingClient ? editingClient.totalSpent : 0
    });
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Base de Clientes</h2>
          <p className="text-sm text-slate-500">Listado de personas y corporaciones</p>
        </div>
        <button onClick={() => openModal()} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">+ Nuevo Cliente</button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar force-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-4">Foto</th>
              <th className="px-6 py-4">Nombre Comercial</th>
              <th className="px-6 py-4 hidden md:table-cell">ID Fiscal</th>
              <th className="px-6 py-4 hidden lg:table-cell">Contacto</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                    {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">{c.name.charAt(0)}</div>}
                  </div>
                </td>
                <td className="px-6 py-4 font-black text-slate-900 uppercase tracking-tighter">{c.name}</td>
                <td className="px-6 py-4 text-slate-500 hidden md:table-cell font-mono">{c.taxId}</td>
                <td className="px-6 py-4 text-slate-400 hidden lg:table-cell text-xs font-bold uppercase">{c.phone}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => openModal(c)} className="text-blue-600 hover:text-blue-800 font-black text-[11px] uppercase tracking-widest mr-4">Editar</button>
                  {c.id !== 'cf' && <button onClick={() => { if(confirm('¿Eliminar cliente?')) onDeleteClient(c.id) }} className="text-rose-400 hover:text-rose-600 font-black text-[11px] uppercase tracking-widest">Borrar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl my-auto border border-slate-200 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editingClient ? 'Expediente de Cliente' : 'Alta de Cliente'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center mb-2">
                <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-xl overflow-hidden relative group cursor-pointer ring-1 ring-slate-100 transition-all">
                  {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 uppercase font-black text-[10px]">Cargar Foto</div>}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Nombre / Razón Social</label>
                  <input required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold uppercase tracking-tighter" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">ID Fiscal / DNI</label>
                  <input required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-mono text-sm" value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Email</label>
                  <input type="email" className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Teléfono</label>
                  <input className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold text-sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Dirección</label>
                  <input className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold text-sm" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Cerrar</button>
                <button type="submit" className="flex-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Registrar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
