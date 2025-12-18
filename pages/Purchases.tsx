
import React, { useState } from 'react';
import { Product, Provider, Purchase, PurchaseItem } from '../types.ts';

interface PurchasesProps {
  products: Product[];
  providers: Provider[];
  purchases: Purchase[];
  onCompletePurchase: (purchase: Purchase) => void;
}

const Purchases: React.FC<PurchasesProps> = ({ products, providers, purchases, onCompletePurchase }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [reference, setReference] = useState('');
  const [pendingQuantities, setPendingQuantities] = useState<Record<string, number>>({});

  const handlePendingQtyChange = (productId: string, val: number) => {
    setPendingQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, val)
    }));
  };

  const addToCart = (product: Product) => {
    const qtyToAdd = pendingQuantities[product.id] || 1;
    const existing = cart.find(item => item.productId === product.id);
    
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + qtyToAdd, subtotal: (item.quantity + qtyToAdd) * item.costPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: qtyToAdd,
        costPrice: product.cost,
        subtotal: product.cost * qtyToAdd
      }]);
    }
    setPendingQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const updateCartItem = (productId: string, qty: number, cost: number) => {
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: Math.max(1, qty), costPrice: Math.max(0, cost), subtotal: Math.max(1, qty) * Math.max(0, cost) }
        : item
    ));
  };

  const handleFinish = () => {
    if (!selectedProviderId || cart.length === 0) {
      alert('Debe seleccionar un proveedor y al menos un producto.');
      return;
    }
    const provider = providers.find(p => p.id === selectedProviderId);
    const newPurchase: Purchase = {
      id: `COM-${Date.now()}`,
      date: new Date().toISOString(),
      providerId: selectedProviderId,
      providerName: provider?.name || 'Proveedor Desconocido',
      items: cart,
      total: cart.reduce((sum, item) => sum + item.subtotal, 0),
      reference: reference
    };
    onCompletePurchase(newPurchase);
    setShowNewModal(false);
    setCart([]);
    setSelectedProviderId('');
    setReference('');
    setPendingQuantities({});
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registro de Compras</h2>
            <p className="text-sm text-slate-500">Gestión de entrada de mercancía para reposición de stock</p>
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            + Registrar Nueva Compra
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ID Transacción</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Referencia / Factura</th>
                <th className="px-6 py-4">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic">No se han registrado compras aún</td>
                </tr>
              ) : (
                purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{p.id}</td>
                    <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.providerName}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{p.reference || 'Sin Ref.'}</td>
                    <td className="px-6 py-4 font-black text-slate-900 text-base">${p.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 lg:p-10 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-full overflow-hidden flex flex-col border border-white/20 animate-in zoom-in duration-300">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Entrada de Mercancía</h3>
                <p className="text-[10px] text-blue-500 uppercase font-black tracking-[0.2em] mt-1">Módulo de Reposición Nexus</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm active:scale-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
                {/* Selector de productos */}
                <div className="lg:col-span-7 flex flex-col min-h-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Catálogo de Suministro</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(p => {
                      const pendingQty = pendingQuantities[p.id] || 1;
                      return (
                        <div key={p.id} className="flex flex-col p-5 border border-slate-200 rounded-3xl bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative">
                          <div className="flex-1 min-w-0 mb-4">
                            <p className="font-black text-sm text-slate-900 truncate uppercase tracking-tighter">{p.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-400 font-bold font-mono uppercase tracking-tighter">{p.code}</span>
                                <span className="text-[9px] text-slate-300 font-bold uppercase">Costo: ${p.cost}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50">
                            <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm ring-4 ring-slate-50/50">
                              <button onClick={() => handlePendingQtyChange(p.id, pendingQty - 1)} className="px-3 py-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 12H4"/></svg>
                              </button>
                              <input type="number" className="w-12 text-center text-xs font-black bg-white text-slate-900 border-none outline-none py-2" value={pendingQty} onChange={(e) => handlePendingQtyChange(p.id, parseInt(e.target.value) || 1)} />
                              <button onClick={() => handlePendingQtyChange(p.id, pendingQty + 1)} className="px-3 py-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                              </button>
                            </div>
                            <button onClick={() => addToCart(p)} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Añadir</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen de compra */}
                <div className="lg:col-span-5 flex flex-col bg-slate-50 rounded-[2rem] p-8 border border-slate-200/60 sticky top-0">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Resumen de Recepción</h4>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="relative">
                      <select className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-tighter focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm appearance-none" value={selectedProviderId} onChange={(e) => setSelectedProviderId(e.target.value)}>
                        <option value="">-- SELECCIONAR PROVEEDOR --</option>
                        {providers.map(pr => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <input className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-900 font-mono text-xs focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm" placeholder="N° FACTURA O REMISIÓN" value={reference} onChange={(e) => setReference(e.target.value)} />
                  </div>

                  <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl p-4 bg-white/50 space-y-3 overflow-y-auto max-h-[300px] mb-8 custom-scrollbar">
                    {cart.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-400 italic text-xs text-center px-10">
                        <svg className="w-10 h-10 mb-3 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        El carrito de entrada está vacío
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.productId} className="flex flex-col p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right-4 duration-300">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-black text-[10px] text-slate-900 uppercase tracking-tighter truncate max-w-[70%]">{item.productName}</span>
                            <button onClick={() => setCart(cart.filter(i => i.productId !== item.productId))} className="text-slate-300 hover:text-rose-500 transition-colors">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Cantidad</label>
                                <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" value={item.quantity} onChange={(e) => updateCartItem(item.productId, parseInt(e.target.value) || 1, item.costPrice)} />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Costo Unit. ($)</label>
                                <input type="number" step="0.01" className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" value={item.costPrice} onChange={(e) => updateCartItem(item.productId, item.quantity, parseFloat(e.target.value) || 0)} />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Total</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">${cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}</p>
                        </div>
                        <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">{cart.length} ÍTEMS</p>
                    </div>
                    <button onClick={handleFinish} disabled={!selectedProviderId || cart.length === 0} className="w-full bg-emerald-600 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                      Confirmar Abastecimiento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
