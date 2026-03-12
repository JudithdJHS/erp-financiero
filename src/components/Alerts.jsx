import React from 'react';
import { AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';

const Alerts = () => {
  const alerts = [
    { 
      id: 1, 
      type: 'critical', 
      title: 'Crítico (100%+)', 
      message: 'CRÍTICO: El presupuesto "Merchandisign" de la campaña "Abraza un sueño, corre con el corazón" ha alcanzado o superado el 100% de ejecución (132.9%).',
      tags: 'Campaña: Abraza un sueño, corre con el corazón · Categoría: Merchandisign',
      percent: '132.9%'
    },
    { 
      id: 2, 
      type: 'warning', 
      title: 'Advertencia (90%)', 
      message: 'ADVERTENCIA: El presupuesto "Equipos Tecnológicos" de la campaña "Programa Educación Digital" ha alcanzado el 92.5% de ejecución.',
      tags: 'Campaña: Programa Educación Digital · Categoría: Equipos Tecnológicos',
      percent: '92.5%'
    },
    { 
      id: 3, 
      type: 'warning', 
      title: 'Advertencia (90%)', 
      message: 'ADVERTENCIA: El presupuesto "Alimentación" de la campaña "Campaña Navidad 2025" ha alcanzado el 93.3% de ejecución.',
      tags: 'Campaña: Campaña Navidad 2025 · Categoría: Alimentación',
      percent: '93.3%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alertas Presupuestales</h2>
          <p className="text-gray-500">Monitoreo de consumo presupuestal</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="text-red-500"><AlertCircle className="w-5 h-5" /></span>
            <h3 className="font-semibold text-gray-800">Alertas Activas ({alerts.length})</h3>
         </div>
         <div className="p-6 space-y-4">
            {alerts.map((alert) => {
              const isCritical = alert.type === 'critical';
              const bgClass = isCritical ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
              const textClass = isCritical ? 'text-red-800' : 'text-orange-800';
              const Icon = isCritical ? XCircle : AlertCircle;

              return (
                <div key={alert.id} className={`p-4 rounded-xl border flex items-start justify-between ${bgClass}`}>
                  <div className="flex gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${isCritical ? 'text-red-500' : 'text-orange-500'}`} />
                    <div>
                      <h4 className={`font-semibold ${textClass}`}>{alert.title}</h4>
                      <p className={`text-sm mt-1 ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>{alert.message}</p>
                      <p className={`text-xs mt-2 opacity-70 ${textClass}`}>{alert.tags}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>{alert.percent}</span>
                     <button className="text-gray-400 hover:text-green-500" title="Marcar como leída">
                       <CheckCircle2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default Alerts;
