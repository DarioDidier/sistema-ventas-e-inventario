
import React, { useState } from 'react';
import { Product, Client, SaleItem, Sale, User } from '../types.ts';

const NewSale: React.FC<{ products: Product[], clients: Client[], currentUser: User, onCompleteSale: (s: Sale) => void }> = ({ products, clients, currentUser, onCompleteSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

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
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 pb-24">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <input type="text" placeholder="Buscar..." className="w-full p-4 border rounded-2xl mb-6 bg-slate-50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar force-scrollbar pr-2">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className="border rounded-2xl p-4 hover:shadow-lg transition-all">
                <p className="text-xs font-bold uppercase">{p.name}</p>
                <p className="text-blue-600 font-bold">${p.price}</p>
                <button onClick={() => {
                  const item = cart.find(i => i.productId === p.id);
                  if (item) setCart(cart.map(i => i.productId === p.id ? {...i, quantity: i.quantity + 1, subtotal: (i.quantity+1)*p.price} : i));
                  else setCart([...cart, {productId: p.id, productName: p.name, quantity: 1, unitPrice: p.price, subtotal: p.price}]);
                }} className="w-full mt-2 bg-slate-900 text-white py-2 rounded-xl text-[10px] font-bold">AÑADIR</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl border shadow-xl flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar force-scrollbar">
          <h3 className="font-bold mb-4 uppercase text-xs text-slate-400">Carrito</h3>
          <select className="w-full p-4 border rounded-2xl bg-slate-50 mb-4 font-bold" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
            <option value="">Cliente...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex-1 space-y-3 mb-6">
            {cart.map(i => (
              <div key={i.productId} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold truncate pr-2">{i.productName}</span>
                <span className="font-bold">${i.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold mb-4"><span>TOTAL</span><span className="text-blue-600">${cartTotal}</span></div>
            <button onClick={handleFinish} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg">FINALIZAR</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
