
import React, { useState } from 'react';
import { Product, Client, SaleItem, Sale, User } from '../types.ts';

const NewSale: React.FC<{ products: Product[], clients: Client[], currentUser: User, onCompleteSale: (s: Sale) => void }> = ({ products, clients, currentUser, onCompleteSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaleId, setLastSaleId] = useState('');

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
    setQuantities(prev => ({ ...prev, [p.id]: 1 }));
  };

  const handleFinish = () => {
    if (!selectedClientId || cart.length === 0) return alert('Datos incompletos');
    const client = clients.find(c => c.id === selectedClientId);
    const saleId = `V-${Date.now()}`;
    onCompleteSale({
      id: saleId, date: new Date().toISOString(), clientId: selectedClientId, clientName: client?.name || 'Genérico',
      sellerId: currentUser.id, items: cart, total: cartTotal, paymentMethod: 'CASH'
    });
    setLastSaleId(saleId);
    setCart([]);
    setShowSuccess(true);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 pb-24 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="relative mb-6">
            <input type="text" placeholder="Buscar producto..." className="w-full p-4 pl-12 border rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className="border border-slate-100 rounded-3xl p-4 hover:shadow-xl hover:border-blue-200 transition-all bg-white group flex flex-col">
                <div className="relative h-40 bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-100">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-black bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-slate-500 shadow-sm border border-slate-100">{p.code}</span>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase shadow-sm ${p.stock <= p.minStock ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>Stock: {p.stock}</span>
                  </div>
                </div>
                
                <h4 className="text-sm font-black text-slate-800 uppercase truncate mb-1 px-1">{p.name}</h4>
                <p className="text-xl font-black text-blue-600 mb-4 px-1">${p.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-2 mt-auto">
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-1">
                    <button onClick={() => handleQtyChange(p.id, -1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 12H4"/></svg>
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-700">{quantities[p.id] || 1}</span>
                    <button onClick={() => handleQtyChange(p.id, 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                    </button>
                  </div>
                  <button onClick={() => addToCart(p)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95">AÑADIR</button>
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
            <h3 className="font-black uppercase text-xs text-slate-800 tracking-widest">Carrito de Ventas</h3>
          </div>
          
          <select className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 mb-6 font-black text-xs uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
            <option value="">-- SELECCIONAR CLIENTE --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="flex-1 space-y-3 mb-8 overflow-y-auto custom-scrollbar pr-2 min-h-[150px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-xs py-10">
                <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                El carrito está vacío
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Final</p>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">${cartTotal.toFixed(2)}</p>
              </div>
              <p className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{cart.length} ítems</p>
            </div>
            <button onClick={handleFinish} disabled={cart.length === 0 || !selectedClientId} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-30 transition-all">FINALIZAR VENTA</button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border border-white/20 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">¡VENTA EXITOSA!</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">El comprobante <span className="text-blue-600 font-bold font-mono">{lastSaleId}</span> ha sido registrado correctamente en el sistema.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Aceptar y Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSale;
