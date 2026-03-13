import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';

const Budgets = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editMonto, setEditMonto] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newBudget, setNewBudget] = useState({ campana_evento_id: '', categoria_id: '', monto_total: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [resp, campRes, catRes] = await Promise.all([
        api.get('/catalog/presupuestos'),
        api.get('/catalog/campanas'),
        api.get('/catalog/categorias')
      ]);
      setPresupuestos(resp.data);
      setCampanas(campRes.data);
      setCategorias(catRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/catalog/presupuestos', {
        ...newBudget,
        campana_evento_id: parseInt(newBudget.campana_evento_id),
        categoria_id: parseInt(newBudget.categoria_id),
        monto_total: parseFloat(newBudget.monto_total)
      });
      setShowModal(false);
      setNewBudget({ campana_evento_id: '', categoria_id: '', monto_total: '' });
      loadData();
    } catch (error) {
       alert("Error al crear presupuesto. Verifica que la campaña e id sean válidos.");
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setEditMonto(p.monto_total.toString());
  };

  const handleSaveEdit = async (id) => {
    const p = presupuestos.find(x => x.id === id);
    try {
      await api.put(`/catalog/presupuestos/${id}`, {
        categoria_id: p.categoria_id,
        campana_evento_id: p.campana_evento_id,
        monto_total: parseFloat(editMonto)
      });
      setEditingId(null);
      loadData();
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asignación de Presupuestos</h2>
          <p className="text-gray-500">Asigna montos a cada categoría por campaña</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presupuestos.map((p) => {
          const percentExec = p.monto_total > 0 ? (p.monto_ejecutado / p.monto_total) * 100 : 0;
          let progressColor = 'bg-brand';
          if (percentExec >= 100) progressColor = 'bg-red-500';
          else if (percentExec >= 90) progressColor = 'bg-orange-500';

          return (
            <div key={p.id} className="card-premium h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1">
                    {p.campana_evento?.nombre || `Campaña ${p.campana_evento_id}`}
                  </h3>
                  <div className="flex items-center gap-1 text-brand text-sm font-semibold mt-1">
                    <ShieldAlert className="w-3 h-3" />
                    {p.categoria?.nombre || `Categoría ${p.categoria_id}`}
                  </div>
                </div>
                <button onClick={() => handleEditClick(p)} className="p-2 text-gray-400 hover:text-brand transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ejecutado</p>
                     <p className="text-lg font-bold text-gray-800">{formatCurrency(p.monto_ejecutado)}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total</p>
                     {editingId === p.id ? (
                       <div className="flex items-center gap-1">
                         <input 
                           type="number" 
                           className="w-24 text-right border-b border-brand focus:outline-none font-bold"
                           value={editMonto} 
                           onChange={e => setEditMonto(e.target.value)}
                         />
                         <button onClick={() => handleSaveEdit(p.id)} className="text-green-500"><Check className="w-4 h-4"/></button>
                         <button onClick={() => setEditingId(null)} className="text-gray-400"><X className="w-4 h-4"/></button>
                       </div>
                     ) : (
                       <p className="text-lg font-bold text-gray-900">{formatCurrency(p.monto_total)}</p>
                     )}
                   </div>
                </div>

                <div className="space-y-1">
                   <div className="flex justify-between text-xs font-bold">
                     <span className="text-gray-500">{percentExec.toFixed(1)}%</span>
                     <span className={percentExec > 100 ? 'text-red-500' : 'text-gray-400'}>
                       {percentExec > 100 ? 'Sobregirado' : 'En ejecución'}
                     </span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div 
                       className={`h-full ${progressColor} transition-all duration-700`}
                       style={{ width: `${Math.min(percentExec, 100)}%` }}
                     ></div>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {presupuestos.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 shadow-sm">
           <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
           <p className="text-gray-500 font-medium">No se han definido presupuestos ejecutables todavía.</p>
           <button onClick={() => setShowModal(true)} className="text-brand font-bold mt-2 hover:underline">Crear el primero ahora</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Crear Presupuesto</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Campaña / Evento</label>
                <select 
                  required
                  className="input-base w-full"
                  value={newBudget.campana_evento_id}
                  onChange={e => setNewBudget({...newBudget, campana_evento_id: e.target.value})}
                >
                  <option value="">Seleccionar campaña</option>
                  {campanas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                <select 
                  required
                  className="input-base w-full"
                  value={newBudget.categoria_id}
                  onChange={e => setNewBudget({...newBudget, categoria_id: e.target.value})}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Monto Total (COP)</label>
                <input 
                  type="number"
                  required
                  className="input-base w-full pb-2 text-lg font-bold"
                  value={newBudget.monto_total}
                  onChange={e => setNewBudget({...newBudget, monto_total: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="btn-link flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1 shadow-lg shadow-brand/20">Guardar Asignación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
