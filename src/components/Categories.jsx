import React from 'react';
import { Tags, Plus, Trash2 } from 'lucide-react';

const Categories = () => {
  const categories = [
    { id: 1, code: 'CAT-07', name: 'Merchandisign', description: 'Merchandising', status: 'Activa' },
    { id: 2, code: 'CAT-001', name: 'Logística y Transporte', description: 'Gastos de transporte, fletes y logística', status: 'Activa' },
    { id: 3, code: 'CAT-002', name: 'Alimentación', description: 'Gastos de alimentación para eventos y personal', status: 'Activa' },
    { id: 4, code: 'CAT-003', name: 'Material Didáctico', description: 'Material educativo, libros, cuadernos', status: 'Activa' },
    { id: 5, code: 'CAT-004', name: 'Equipos Tecnológicos', description: 'Computadores, tablets, proyectores', status: 'Activa' },
    { id: 6, code: 'CAT-005', name: 'Servicios Profesionales', description: 'Honorarios de profesionales y consultores', status: 'Activa' },
    { id: 7, code: 'CAT-006', name: 'Comunicaciones', description: 'Publicidad, diseño, impresión, redes sociales', status: 'Activa' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías Presupuestales</h2>
          <p className="text-gray-500">Clasifica los gastos por tipo</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="card-premium flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 text-center">
                <span className="text-sm font-bold text-brand">{cat.code}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              </div>
            </div>
            
            <button className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
