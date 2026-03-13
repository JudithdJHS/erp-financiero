import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, Loader2, AlertCircle, Type, Hash } from 'lucide-react';
import api from '../api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCat, setNewCat] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/catalog/categorias');
      setCategories(res.data);
    } catch (err) {
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/catalog/categorias', newCat);
      setNewCat({ nombre: '', descripcion: '' });
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError('Error al crear categoría');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await api.delete(`/catalog/categorias/${id}`);
        fetchCategories();
      } catch (err) {
        setError('Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías Presupuestales</h2>
          <p className="text-gray-500">Clasifica los gastos por tipo</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Nueva Categoría
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
          {categories.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic">No hay categorías creadas aún.</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="card-premium flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
                    <Tags className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cat.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">{cat.descripcion || 'Sin descripción'}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(cat.id)}
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
            <h3 className="text-xl font-bold mb-6">Nueva Categoría</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Type className="w-3 h-3"/> Nombre
                </label>
                <input 
                  autoFocus
                  required
                  className="input-base w-full"
                  value={newCat.nombre}
                  onChange={e => setNewCat({...newCat, nombre: e.target.value})}
                  placeholder="Ej: Alimentación, Transporte..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">Descripción</label>
                <textarea 
                  className="input-base w-full min-h-[100px] pt-3"
                  value={newCat.descripcion}
                  onChange={e => setNewCat({...newCat, descripcion: e.target.value})}
                  placeholder="Breve descripción del tipo de gasto"
                />
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

export default Categories;
