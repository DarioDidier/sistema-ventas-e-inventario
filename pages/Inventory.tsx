
import React, { useState } from 'react';
import { Product } from '../types';

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
    name: '',
    code: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    description: '',
    categoryId: 'general',
    imageUrl: ''
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        code: `P-${Date.now().toString().slice(-4)}`,
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
        description: '',
        categoryId: 'general',
        imageUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
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
      // Omitir cabecera (primera fila)
      let importedCount = 0;
      
      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        if (columns.length >= 6) {
          const product: Product = {
            id: `p-csv-${Date.now()}-${i}`,
            code: columns[0].trim(),
            name: columns[1].trim(),
            price: parseFloat(columns[2]) || 0,
            cost: parseFloat(columns[3]) || 0,
            stock: parseInt(columns[4]) || 0,
            minStock: parseInt(columns[5]) || 0,
            description: 'Importado masivamente',
            categoryId: 'general'
          };
          onSaveProduct(product);
          importedCount++;
        }
      }
      alert(`Importación completada: ${importedCount} productos procesados.`);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProduct({
      ...formData as Product,
      id: editingProduct ? editingProduct.id : `p-${Date.now()}`
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Inventario de Productos</h2>
            <p className="text-sm text-slate-500">Gestión de existencias y carga masiva</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Importar CSV / Excel
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Nuevo Producto
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Costo</th>
                <th className="px-6 py-4">Precio Venta</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded border border-slate-100 overflow-hidden bg-slate-50">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{p.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-4">${p.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-blue-600 font-bold">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 font-semibold">{p.stock}</td>
                  <td className="px-6 py-4">
                    {p.stock <= p.minStock ? (
                      <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">STOCK BAJO</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">ÓPTIMO</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                    <button onClick={() => { if(confirm('¿Eliminar producto?')) onDeleteProduct(p.id) }} className="text-rose-600 hover:text-rose-800 font-medium">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Importar Lote */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Cargar Inventario por Planilla</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                  Configuración Correcta de la Hoja (CSV)
                </h4>
                <p className="text-sm text-blue-800 mb-4">Para importar correctamente, guarde su Excel o Google Sheets como <strong>Archivo CSV (delimitado por comas)</strong> con las siguientes columnas:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse bg-white rounded-lg shadow-inner">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 uppercase">
                        <th className="p-2 border">Columna A</th>
                        <th className="p-2 border">Columna B</th>
                        <th className="p-2 border">Columna C</th>
                        <th className="p-2 border">Columna D</th>
                        <th className="p-2 border">Columna E</th>
                        <th className="p-2 border">Columna F</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border font-bold">Código</td>
                        <td className="p-2 border font-bold">Nombre</td>
                        <td className="p-2 border font-bold">Precio Venta</td>
                        <td className="p-2 border font-bold">Costo</td>
                        <td className="p-2 border font-bold">Stock Actual</td>
                        <td className="p-2 border font-bold">Stock Mínimo</td>
                      </tr>
                      <tr className="text-slate-400 italic">
                        <td className="p-2 border">SKU-001</td>
                        <td className="p-2 border">Mouse Gamer</td>
                        <td className="p-2 border">50.00</td>
                        <td className="p-2 border">25.00</td>
                        <td className="p-2 border">100</td>
                        <td className="p-2 border">10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-blue-400 transition-colors">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCSVImport}
                  className="hidden" 
                  id="csv-upload" 
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h5 className="font-bold text-slate-800">Seleccionar Archivo CSV</h5>
                  <p className="text-sm text-slate-500">Haz clic aquí para buscar tu planilla configurada</p>
                </label>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end">
              <button onClick={() => setShowImportModal(false)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Producto Individual */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden mb-1 relative group cursor-pointer hover:border-blue-400">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Subir foto del producto</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input required className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código</label>
                  <input required className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Actual</label>
                  <input type="number" required className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Costo Unitario ($)</label>
                  <input type="number" step="0.01" required className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.cost} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Venta ($)</label>
                  <input type="number" step="0.01" required className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
