import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Loader2, Calendar, AlertCircle } from 'lucide-react';
import api from '../api';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCamp, setNewCamp] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/catalog/campanas');
      setCampaigns(res.data);
    } catch (err) {
      setError('Error al cargar campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/catalog/campanas', newCamp);
      setShowModal(false);
      setNewCamp({ nombre: '', fecha_inicio: '', fecha_fin: '' });
      fetchCampaigns();
    } catch (err) {
      setError('Error al crear campaña');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta campaña?')) {
      try {
        await api.delete(`/catalog/campanas/${id}`);
        fetchCampaigns();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campañas y Eventos</h2>
          <p className="text-gray-500">Gestiona tus campañas y eventos</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic">No hay campañas creadas aún.</div>
          ) : (
            campaigns.map((camp) => (
              <div key={camp.id} className="card-premium flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{camp.nombre}</h3>
                      <span className="badge-success">{camp.activa ? 'Activa' : 'Inactiva'}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Inicio: {camp.fecha_inicio || 'N/A'} · Fin: {camp.fecha_fin || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(camp.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Simplificado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Nueva Campaña</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input 
                  autoFocus
                  required
                  className="input-base w-full"
                  value={newCamp.nombre}
                  onChange={e => setNewCamp({...newCamp, nombre: e.target.value})}
                  placeholder="Ej: Carrera 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Fecha Inicio</label>
                  <input 
                    type="date"
                    className="input-base w-full"
                    value={newCamp.fecha_inicio}
                    onChange={e => setNewCamp({...newCamp, fecha_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">Fecha Fin</label>
                  <input 
                    type="date"
                    className="input-base w-full"
                    value={newCamp.fecha_fin}
                    onChange={e => setNewCamp({...newCamp, fecha_fin: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" className="btn-link flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
