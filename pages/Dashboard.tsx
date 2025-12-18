
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, Sale } from '../types';

interface DashboardProps {
  sales: Sale[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, products }) => {
  const totalSalesValue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const totalProducts = products.length;
  
  // Chart data simulation (last 7 days)
  const chartData = [
    { name: 'Lun', sales: 400 },
    { name: 'Mar', sales: 300 },
    { name: 'Mie', sales: 200 },
    { name: 'Jue', sales: 278 },
    { name: 'Vie', sales: 189 },
    { name: 'Sab', sales: 239 },
    { name: 'Dom', sales: 349 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
        <span className="text-sm text-slate-500">Resumen operativo del sistema</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Ventas Totales</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalSalesValue.toLocaleString()}</h3>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path></svg>
            +12.5% vs mes anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Pedidos Realizados</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{sales.length}</h3>
          <div className="mt-2 text-xs font-medium text-blue-600">Actualizado hoy</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Stock Bajo Alerta</p>
          <h3 className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{lowStockCount}</h3>
          <p className="text-xs text-slate-500 mt-2">Productos por debajo del mínimo</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Productos</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalProducts}</h3>
          <p className="text-xs text-slate-500 mt-2">En catálogo activo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-6">Tendencia de Ventas (Semanal)</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-6">Productos con Poco Stock</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-slate-500 font-medium">
                  <th className="pb-3 px-2 text-[11px] uppercase tracking-wider">Producto</th>
                  <th className="pb-3 px-2 text-[11px] uppercase tracking-wider">Stock</th>
                  <th className="pb-3 px-2 text-[11px] uppercase tracking-wider">Mínimo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.filter(p => p.stock <= p.minStock).slice(0, 5).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-medium">{p.name}</td>
                    <td className="py-3 px-2 text-rose-600 font-bold">{p.stock}</td>
                    <td className="py-3 px-2 text-slate-500">{p.minStock}</td>
                  </tr>
                ))}
                {products.filter(p => p.stock <= p.minStock).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 italic">No hay alertas de inventario</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
