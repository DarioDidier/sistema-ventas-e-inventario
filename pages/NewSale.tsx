
import React, { useState } from 'react';
import { Product, Client, SaleItem, Sale, User } from '../types.ts';

interface NewSaleProps {
  products: Product[];
  clients: Client[];
  currentUser: User;
  onCompleteSale: (sale: Sale) => void;
}

const NewSale: React.FC<NewSaleProps> = ({ products, clients, currentUser, onCompleteSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQtyChange = (productId: string, qty: number, stock: number) => {
    const val = Math.max(1, Math.min(qty, stock));
    setSelectedQuantities(prev => ({ ...prev, [productId]: val }));
  };

  const addToCart = (product: Product) => {
    const requestedQty = selectedQuantities[product.id] || 1;

    if (product.stock <= 0) {
      alert('Sin stock disponible');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      const currentInCart = existing ? existing.quantity : 0;
      
      if (currentInCart + requestedQty > product.stock) {
        alert(`No puedes agregar ${requestedQty} unidades. Solo quedan ${product.stock - currentInCart} disponibles.`);
        return prev;
      }

      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + requestedQty, subtotal: (item.quantity + requestedQty) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: requestedQty,
        unitPrice: product.price,
        subtotal: product.price * requestedQty
      }];
    });

    setSelectedQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleFinish = () => {
    if (!selectedClientId) {
      alert('Seleccione un cliente');
      return;
    }
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    
    const newSale: Sale = {
      id: `V-${Date.now()}`,
      date: new Date().toISOString(),
      clientId: selectedClientId,
      clientName: client?.name || 'Cliente Genérico',
      sellerId: currentUser.id,
      items: cart,
      total: cartTotal,
      paymentMethod: 'CASH'
    };

    onCompleteSale(newSale);
    setCart([]);
    setSelectedClientId('');
    alert('Venta procesada con éxito');
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 pb-24 lg:pb-0">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">Catálogo de Productos</h3>
          <div className="mb-6 relative">
            <input 
              type="text" 
              placeholder="Buscar por nombre o código..." 
              className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-slate-900 shadow-inner font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-4 top-4 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 custom-scrollbar force-scrollbar max-h-[600px] lg:max-h-none overflow-y-auto pr-1">
            {filteredProducts.map(p => {
              const currentQty = selectedQuantities[p.id] || 1;
              const isOutOfStock = p.stock <= 0;
              return (
                <div key={p.id} className={`border border-slate-200 rounded-2xl p-4 bg-white ${isOutOfStock ? 'opacity-50 grayscale' : 'hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'}`}>
                   <div className="h-28 bg-slate-50 rounded-xl mb-3 flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <span className="text-slate-200 text-xs font-black tracking-widest uppercase">{p.code}</span>}
                  </div>
                  <h4 className="text-xs font-black truncate text-slate-800 uppercase tracking-tighter mb-1" title={p.name}>{p.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-black text-lg">${p.price}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${p.stock > p.minStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      S: {p.stock}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 flex border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <button onClick={() => handleQtyChange(p.id, currentQty - 1, p.stock)} className="px-3 py-2 bg-slate-50 text-slate-600 font-black hover:bg-slate-200 transition-colors">-</button>
                      <input readOnly value={currentQty} className="w-full text-center text-xs font-black bg-white text-slate-900 border-none outline-none" />
                      <button onClick={() => handleQtyChange(p.id, currentQty + 1, p.stock)} className="px-3 py-2 bg-slate-50 text-slate-600 font-black hover:bg-slate-200 transition-colors">+</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    disabled={isOutOfStock}
                    className="w-full mt-3 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:bg-slate-200"
                  >
                    Agregar al Pedido
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        {/* Barra lateral de Checkout con scrollbar visible (force-scrollbar) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:sticky lg:top-8 shadow-2xl flex flex-col max-h-[85vh] lg:max-h-[calc(100vh-100px)] custom-scrollbar force-scrollbar overflow-y-auto">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-xs border-b pb-4">Carrito de Venta</h3>
          
          <div className="mb-6">
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Cliente</label>
            <select 
              className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner appearance-none"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">-- Seleccionar --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-3 mb-6 flex-1 custom-scrollbar force-scrollbar overflow-y-auto pr-2 min-h-[150px]">
            {cart.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">El pedido está vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-xs font-black truncate text-slate-800 uppercase leading-none">{item.productName}</p>
                    <p className="text-[10px] text-slate-500 font-black mt-1">{item.quantity} x ${item.unitPrice}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900">${item.subtotal.toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.productId)} className="text-rose-300 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-full">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-6 space-y-3 bg-white mt-auto sticky bottom-0">
             <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest px-1">
              <span>Monto Base</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 px-1">
              <span className="tracking-tighter uppercase">Total</span>
              <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleFinish}
              disabled={cart.length === 0 || !selectedClientId}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-xl shadow-blue-200 transform active:scale-95 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              Completar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
