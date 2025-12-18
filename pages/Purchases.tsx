
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Nueva Entrada de Mercancía</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Abastecimiento de Almacén</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="bg-white border w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest border-l-4 border-blue-500 pl-2">Selección de Artículos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map(p => {
                    const pendingQty = pendingQuantities[p.id] || 1;
                    return (
                      <div key={p.id} className="flex flex-col p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-200 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <div className="flex items-center border rounded-lg overflow-hidden bg-slate-50">
                            <button onClick={() => handlePendingQtyChange(p.id, pendingQty - 1)} className="px-2 py-1 text-slate-500 hover:bg-slate-200">-</button>
                            <input type="number" className="w-10 text-center text-xs font-bold bg-white text-slate-900 border-none outline-none py-1" value={pendingQty} onChange={(e) => handlePendingQtyChange(p.id, parseInt(e.target.value) || 1)} />
                            <button onClick={() => handlePendingQtyChange(p.id, pendingQty + 1)} className="px-2 py-1 text-slate-500 hover:bg-slate-200">+</button>
                          </div>
                          <button onClick={() => addToCart(p)} className="flex-1 bg-slate-900 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 transition-colors">Añadir</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col space-y-4">
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest border-l-4 border-emerald-500 pl-2">Detalles del Comprobante</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <select className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" value={selectedProviderId} onChange={(e) => setSelectedProviderId(e.target.value)}>
                    <option value="">Seleccionar Proveedor...</option>
                    {providers.map(pr => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
                  </select>
                  <input className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" placeholder="Ref. Factura" value={reference} onChange={(e) => setReference(e.target.value)} />
                </div>
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-white space-y-3 overflow-y-auto max-h-[400px]">
                  {cart.map(item => (
                    <div key={item.productId} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center mb-2 font-bold text-xs">{item.productName}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" className="w-full p-2 border rounded text-xs" value={item.quantity} onChange={(e) => updateCartItem(item.productId, parseInt(e.target.value) || 1, item.costPrice)} />
                        <input type="number" step="0.01" className="w-full p-2 border rounded text-xs" value={item.costPrice} onChange={(e) => updateCartItem(item.productId, item.quantity, parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleFinish} disabled={!selectedProviderId || cart.length === 0} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-30 transition-all">Confirmar Ingreso</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
