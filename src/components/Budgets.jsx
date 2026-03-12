import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X, ShieldAlert, AlertCircle } from 'lucide-react';
import api from '../api';

const Budgets = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editMonto, setEditMonto] = useState('');

  const loadPresupuestos = async () => {
    try {
      const resp = await api.get('/catalog/presupuestos');
      setPresupuestos(resp.data);
    } catch (error) {
      console.error("Error cargando presupuestos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresupuestos();
  }, []);

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setEditMonto(p.monto_total.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditMonto('');
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/catalog/presupuestos/${id}`, {
        categoria_id: 1, // Placeholder since we only edit monto_total in this simplified view, backend doesn't check it fully yet
        campana_evento_id: 1,
        monto_total: parseFloat(editMonto)
      });
      setEditingId(null);
      loadPresupuestos();
    } catch (error) {
      console.error("Error al actualizar presupuesto:", error);
      alert("Error al guardar");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);
  };

  if (loading) return <div className="text-gray-500">Cargando presupuestos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Presupuestos</h2>
          <p className="text-gray-500">Combinación de campaña + categoría</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="space-y-4">
        {presupuestos.map((p) => {
          // Calculate execution percentage
          const percentExec = p.monto_total > 0 ? (p.monto_ejecutado / p.monto_total) * 100 : 0;
          
          let progressColor = 'bg-brand';
          if (percentExec >= 100) progressColor = 'bg-red-500';
          else if (percentExec >= 90) progressColor = 'bg-orange-500';
          else if (percentExec >= 80) progressColor = 'bg-yellow-400';

          return (
            <div key={p.id} className="card-premium">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {p.campana_evento ? p.campana_evento.nombre : `Campaña ${p.campana_evento_id}`} → {p.categoria ? p.categoria.nombre : `Categoría ${p.categoria_id}`}
                  </h3>
                  
                  {editingId === p.id ? (
                    <div className="mt-2 flex items-center gap-2">
                       <span className="text-sm text-gray-500">Monto Asignado: $</span>
                       <input 
                         type="number"
                         value={editMonto}
                         onChange={(e) => setEditMonto(e.target.value)}
                         className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                       />
                       <button onClick={() => handleSaveEdit(p.id)} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check className="w-4 h-4"/></button>
                       <button onClick={handleCancelEdit} className="text-red-500 p-1 hover:bg-red-50 rounded"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">
                      Asignado: {formatCurrency(p.monto_total)} · Ejecutado: {formatCurrency(p.monto_ejecutado)}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                   <button onClick={() => handleEditClick(p)} className="hover:text-brand transition-colors"><Edit2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative mt-2">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                  <span>Ejecutado: {formatCurrency(p.monto_ejecutado)}</span>
                  <span>{percentExec.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${progressColor} transition-all duration-500`}
                    style={{ width: `${Math.min(percentExec, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-400 mt-1">
                  Asignado: {formatCurrency(p.monto_total)}
                </div>
              </div>
            </div>
          );
        })}
        {presupuestos.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
             No hay presupuestos creados.
          </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;
