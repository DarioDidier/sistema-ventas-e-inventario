
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Sin stock disponible');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('No hay más unidades en stock');
          return prev;
        }
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price
      }];
    });
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
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Catálogo de Productos</h3>
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Buscar por nombre o código..." 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map(p => (
              <div key={p.id} className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors group bg-white">
                <div className="h-24 bg-slate-50 rounded mb-2 flex items-center justify-center overflow-hidden">
                  <span className="text-slate-300 font-bold">{p.code}</span>
                </div>
                <h4 className="text-sm font-semibold truncate text-slate-800">{p.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-blue-600 font-bold">${p.price}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.stock > p.minStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    Stock: {p.stock}
                  </span>
                </div>
                <button 
                  onClick={() => addToCart(p)}
                  className="w-full mt-3 bg-slate-900 text-white py-1.5 rounded text-sm hover:bg-slate-800 transition-colors font-medium"
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Detalle de Venta</h3>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Cliente</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                <p className="text-slate-400 text-sm italic">Carrito vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 group border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.quantity} x ${item.unitPrice}</p>
                  </div>
                  <div className="text-right ml-2 flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
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
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2">
              <span>TOTAL:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleFinish}
            disabled={cart.length === 0 || !selectedClientId}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100"
          >
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
