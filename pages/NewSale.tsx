
import React, { useState } from 'react';
import { Product, Client, SaleItem, Sale, User } from '../types';

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
        alert(`No puedes agregar ${requestedQty} unidades. Solo quedan ${product.stock - currentInCart} disponibles en total.`);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Catálogo de Productos</h3>
          <div className="mb-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar por nombre o código..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map(p => {
              const currentQty = selectedQuantities[p.id] || 1;
              const isOutOfStock = p.stock <= 0;

              return (
                <div key={p.id} className={`border rounded-lg p-3 transition-all group bg-white ${isOutOfStock ? 'opacity-60 grayscale' : 'hover:border-blue-300 hover:shadow-md'}`}>
                  <div className="h-24 bg-slate-50 rounded mb-2 flex items-center justify-center overflow-hidden border border-slate-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-300 font-bold text-xs">{p.code}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold truncate text-slate-800" title={p.name}>{p.name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-blue-600 font-bold">${p.price}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.stock > p.minStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="flex-1 flex items-center border border-slate-200 rounded overflow-hidden">
                      <button 
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleQtyChange(p.id, currentQty - 1, p.stock)}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-200 disabled:opacity-50"
                      >-</button>
                      <input 
                        type="number"
                        min="1"
                        max={p.stock}
                        disabled={isOutOfStock}
                        value={currentQty}
                        onChange={(e) => handleQtyChange(p.id, parseInt(e.target.value) || 1, p.stock)}
                        className="w-full text-center text-xs font-bold focus:outline-none bg-white py-1"
                      />
                      <button 
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleQtyChange(p.id, currentQty + 1, p.stock)}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border-l border-slate-200 disabled:opacity-50"
                      >+</button>
                    </div>
                  </div>

                  <button 
                    onClick={() => addToCart(p)}
                    disabled={isOutOfStock}
                    className="w-full mt-2 bg-slate-900 text-white py-2 rounded text-xs hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider"
                  >
                    {isOutOfStock ? 'Agotado' : 'Agregar'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Detalle de Venta</h3>
          
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Cliente</label>
            <select 
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">Seleccione Cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.taxId})</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg">
                <svg className="w-8 h-8 text-slate-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <p className="text-slate-400 text-sm italic font-medium">Carrito vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 group border border-slate-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.quantity} unidades x ${item.unitPrice}</p>
                  </div>
                  <div className="text-right ml-2 flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-300 hover:text-rose-500 p-1.5 transition-colors rounded-full hover:bg-rose-50"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-slate-500 text-xs font-bold uppercase tracking-tighter">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-slate-900 border-t pt-2">
              <span>TOTAL:</span>
              <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleFinish}
            disabled={cart.length === 0 || !selectedClientId}
            className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100 transform active:scale-[0.98]"
          >
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
