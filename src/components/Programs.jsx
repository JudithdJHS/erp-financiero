import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, Loader2, AlertCircle, Type } from 'lucide-react';
import api from '../api';

const Programs = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProg, setNewProg] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/catalog/programas');
      setProviders(res.data);
    } catch (err) {
      setError('Error al cargar programas sociales');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/catalog/programas', newProg);
      setNewProg({ nombre: '', descripcion: '' });
      setShowModal(false);
      fetchPrograms();
    } catch (err) {
      setError('Error al crear programa');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este programa?')) {
      try {
        await api.delete(`/catalog/programas/${id}`);
        fetchPrograms();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programas Sociales</h2>
          <p className="text-gray-500">Misiones y proyectos de la fundación</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Programa
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-400 italic">No hay programas registrados.</div>
          ) : (
            providers.map((prog) => (
              <div key={prog.id} className="card-premium flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{prog.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">{prog.descripcion || 'Proyecto social activo'}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(prog.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Nuevo Programa Social</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Programa</label>
                <input 
                  autoFocus
                  required
                  className="input-base w-full"
                  value={newProg.nombre}
                  onChange={e => setNewProg({...newProg, nombre: e.target.value})}
                  placeholder="Ej: Cumplimiento de Sueños"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">Descripción / Objetivo</label>
                <textarea 
                  className="input-base w-full min-h-[100px] pt-3"
                  value={newProg.descripcion}
                  onChange={e => setNewProg({...newProg, descripcion: e.target.value})}
                  placeholder="Explica brevemente de qué trata este programa"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" className="btn-link flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Abrir Programa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;
