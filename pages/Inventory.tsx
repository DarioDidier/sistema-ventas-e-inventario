
import React, { useState } from 'react';
import { Product } from '../types.ts';

interface InventoryProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onSaveProduct, onDeleteProduct }) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', code: '', price: 0, cost: 0, stock: 0, minStock: 5, description: '', categoryId: 'general', imageUrl: ''
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: `P-${Date.now().toString().slice(-4)}`, price: 0, cost: 0, stock: 0, minStock: 5, description: '', categoryId: 'general', imageUrl: '' });
    }
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n');
      let importedCount = 0;
      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        if (columns.length >= 6) {
          onSaveProduct({
            id: `p-csv-${Date.now()}-${i}`,
            code: columns[0].trim(),
            name: columns[1].trim(),
            price: parseFloat(columns[2]) || 0,
            cost: parseFloat(columns[3]) || 0,
            stock: parseInt(columns[4]) || 0,
            minStock: parseInt(columns[5]) || 0,
            description: 'Importado masivamente',
            categoryId: 'general'
          });
          importedCount++;
        }
      }
      alert(`Importación completada: ${importedCount} productos procesados.`);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Inventario Maestro</h2>
            <p className="text-sm text-slate-500">Gestión global de stock y precios</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setShowImportModal(true)} className="flex-1 md:flex-none bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Importar CSV</button>
            <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">+ Producto</button>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar force-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Ítem</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shadow-inner bg-white">
                      {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 font-black">?</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{p.code}</td>
                  <td className="px-6 py-4 font-black text-slate-900 uppercase tracking-tighter">{p.name}</td>
                  <td className="px-6 py-4 font-black text-blue-600">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${p.stock <= p.minStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {p.stock} UNI
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800 font-black text-[11px] uppercase tracking-widest mr-4">Editar</button>
                    <button onClick={() => { if(confirm('¿Eliminar producto?')) onDeleteProduct(p.id) }} className="text-rose-400 hover:text-rose-600 font-black text-[11px] uppercase tracking-widest">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl my-auto border border-slate-200 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ficha de Producto</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSaveProduct({ ...formData as Product, id: editingProduct ? editingProduct.id : `p-${Date.now()}` }); setShowModal(false); }} className="p-8 space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-2xl bg-slate-50 border-4 border-white shadow-xl overflow-hidden relative group cursor-pointer ring-1 ring-slate-100">
                  {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 font-black uppercase text-[10px]">Subir Imagen</div>}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Nombre del Producto</label>
                  <input required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold uppercase tracking-tighter" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Código SKU</label>
                  <input required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-mono text-sm" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Stock Disponible</label>
                  <input type="number" required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Costo Adquisición ($)</label>
                  <input type="number" step="0.01" required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold" value={formData.cost} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Precio Venta ($)</label>
                  <input type="number" step="0.01" required className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Descartar</button>
                <button type="submit" className="flex-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
