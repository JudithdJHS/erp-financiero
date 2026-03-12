import React from 'react';
import { Heart, Plus, Trash2 } from 'lucide-react';

const Programs = () => {
  const programs = [
    { id: 1, name: 'Cumplimiento de Sueños', description: 'Programa de cumplimiento de deseos y sueños para niños', status: 'Activo' },
    { id: 2, name: 'Abrazos que Sanan', description: 'Apoyo emocional y acompañamiento a niños y familias', status: 'Activo' },
    { id: 3, name: 'Mercados con Amor', description: 'Entrega de mercados y alimentos a familias necesitadas', status: 'Activo' },
    { id: 4, name: 'Almuerzos con Amor', description: 'Programa de alimentación diaria para niños', status: 'Activo' },
    { id: 5, name: 'Un Sueño sobre Ruedas', description: 'Transporte y movilidad para niños y familias', status: 'Activo' },
    { id: 6, name: 'Aprendemprendiendo', description: 'Programa de formación y emprendimiento', status: 'Activo' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programas de la Fundación</h2>
          <p className="text-gray-500">Gestiona los programas sociales</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Programa
        </button>
      </div>

      <div className="space-y-4">
        {programs.map((program) => (
          <div key={program.id} className="card-premium flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{program.name}</h3>
                  <span className="badge-success">{program.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{program.description}</p>
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

export default Programs;
