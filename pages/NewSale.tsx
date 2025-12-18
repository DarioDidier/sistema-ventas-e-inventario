
import React, { useState } from 'react';
import { Product, Client, SaleItem, Sale, User } from '../types.ts';

const NewSale: React.FC<{ products: Product[], clients: Client[], currentUser: User, onCompleteSale: (s: Sale) => void }> = ({ products, clients, currentUser, onCompleteSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const addToCart = (p: Product) => {
    const qty = quantities[p.id] || 1;
    if (p.stock < qty) {
      alert(`Stock insuficiente. Disponible: ${p.stock}`);
      return;
    }
    const item = cart.find(i => i.productId === p.id);
    if (item) {
      setCart(cart.map(i => i.productId === p.id ? {...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * p.price} : i));
    } else {
      setCart([...cart, {productId: p.id, productName: p.name, quantity: qty, unitPrice: p.price, subtotal: qty * p.price}]);
    }
    // Reset quantity for that product
    setQuantities(prev => ({ ...prev, [p.id]: 1 }));
  };

  const handleFinish = () => {
    if (!selectedClientId || cart.length === 0) return alert('Datos incompletos');
    const client = clients.find(c => c.id === selectedClientId);
    onCompleteSale({
      id: `V-${Date.now()}`, date: new Date().toISOString(), clientId: selectedClientId, clientName: client?.name || 'Genérico',
      sellerId: currentUser.id, items: cart, total: cartTotal, paymentMethod: 'CASH'
    });
    setCart([]);
    alert('Venta Exitosa');
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 pb-24 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="relative mb-6">
            <input type="text" placeholder="Buscar producto por nombre o código..." className="w-full p-4 pl-12 border rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar force-scrollbar pr-2">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className="border border-slate-100 rounded-3xl p-5 hover:shadow-xl hover:border-blue-200 transition-all bg-white group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{p.code}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${p.stock <= p.minStock ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>Stock: {p.stock}</span>
                </div>
                <p className="text-sm font-black text-slate-800 uppercase truncate mb-1">{p.name}</p>
                <p className="text-lg font-black text-slate-900 mb-4">${p.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-1">
                    <button onClick={() => handleQtyChange(p.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 12H4"/></svg>
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-700">{quantities[p.id] || 1}</span>
                    <button onClick={() => handleQtyChange(p.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                    </button>
                  </div>
                  <button onClick={() => addToCart(p)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">AÑADIR</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-3xl border shadow-2xl flex flex-col max-h-[85vh] sticky top-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="font-black uppercase text-xs text-slate-800 tracking-widest">Resumen de Venta</h3>
          </div>
          
          <select className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 mb-6 font-black text-xs uppercase tracking-tighter outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
            <option value="">-- SELECCIONAR CLIENTE --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="flex-1 space-y-3 mb-8 overflow-y-auto custom-scrollbar pr-2 min-h-[150px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-xs py-10">
                <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Carrito vacío
              </div>
            ) : (
              cart.map(i => (
                <div key={i.productId} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group animate-in slide-in-from-right duration-300">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[120px]">{i.productName}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{i.quantity} x ${i.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-slate-900">${i.subtotal.toFixed(2)}</span>
                    <button onClick={() => setCart(cart.filter(c => c.productId !== i.productId))} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Total</p>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">${cartTotal.toFixed(2)}</p>
              </div>
              <p className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{cart.length} ítems</p>
            </div>
            <button onClick={handleFinish} disabled={cart.length === 0 || !selectedClientId} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all">FINALIZAR TRANSACCIÓN</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
