import React from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';

const Campaigns = () => {
  const campaigns = [
    { id: 1, name: 'Abraza un sueño, corre con el corazón', description: 'Social Run Fundación Abraza un Sueño', start: '2026-03-01', end: '2026-05-24', status: 'Activa' },
    { id: 2, name: 'Campaña Navidad 2025', description: 'Campaña de recolección y entrega de regalos navideños para niños', start: '2025-11-01', end: '2025-12-31', status: 'Activa' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campañas y Eventos</h2>
          <p className="text-gray-500">Gestiona tus campañas y eventos</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </button>
      </div>

      <div className="space-y-4">
        {campaigns.map((camp) => (
          <div key={camp.id} className="card-premium flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{camp.name}</h3>
                  <span className="badge-success">{camp.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{camp.description}</p>
                <p className="text-xs text-gray-400 mt-2">Inicio: {camp.start} · Fin: {camp.end}</p>
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

export default Campaigns;
