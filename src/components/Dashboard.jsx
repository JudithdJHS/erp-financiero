import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, BellRing, AlertCircle, ChevronRight, Activity } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [campanas, setCampanas] = useState([]);
  const [selectedCampana, setSelectedCampana] = useState('');
  const [summary, setSummary] = useState({ presupuesto_total: 0, gastado: 0, disponible: 0 });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampanas();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCampana]);

  const fetchCampanas = async () => {
    try {
      const res = await api.get('/catalog/campanas');
      setCampanas(res.data);
    } catch (error) {
      console.error("Error fetching campanas", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = selectedCampana ? { campana_evento_id: selectedCampana } : {};
      
      const summaryRes = await api.get('/dashboard/summary', { params });
      setSummary(summaryRes.data);

      const alertsRes = await api.get('/dashboard/alerts', { params });
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const progreso = summary.presupuesto_total > 0 
    ? (summary.gastado / summary.presupuesto_total) * 100 
    : 0;
    
  let progressColor = 'bg-brand';
  if (progreso >= 100) progressColor = 'bg-red-500';
  else if (progreso >= 90) progressColor = 'bg-orange-500';
  else if (progreso >= 80) progressColor = 'bg-yellow-400';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  };

  if (loading && campanas.length === 0) return <div className="text-gray-500">Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard General</h2>
          <p className="text-gray-500">Resumen financiero y control de ejecución</p>
        </div>
        
        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
           <label htmlFor="campana-filter" className="pl-3 pr-2 text-sm font-medium text-gray-600">Campaña:</label>
           <select 
             id="campana-filter"
             className="bg-transparent text-sm border-none focus:ring-0 py-1.5 pr-8 pl-1 text-gray-900 cursor-pointer"
             value={selectedCampana}
             onChange={(e) => setSelectedCampana(e.target.value)}
           >
             <option value="">Todas (Consolidado)</option>
             {campanas.map(c => (
               <option key={c.id} value={c.id}>{c.nombre}</option>
             ))}
           </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Presupuesto</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.presupuesto_total)}</p>
          </div>
        </div>
        
        <div className="card-premium flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ejecutado (Gastado)</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.gastado)}</p>
          </div>
        </div>

        <div className="card-premium flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Saldo Disponible</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.disponible)}</p>
          </div>
        </div>

        <div className="card-premium flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alerts.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Alertas Activas</p>
            <p className="text-xl font-bold text-gray-900">{alerts.length}</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Progress) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Ejecución Global
              </h3>
              <span className="text-2xl font-bold text-gray-900">{progreso.toFixed(1)}%</span>
            </div>
            
            <div className="relative pt-1">
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min(progreso, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Alerts Feed) */}
        <div className="lg:col-span-1">
          <div className="card-premium h-full flex flex-col">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Feed de Alertas
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BellRing className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Todo bajo control.<br/>No hay alertas activas.</p>
                </div>
              ) : (
                alerts.map(alerta => {
                  const isCritical = alerta.nivel === 'CRITICO';
                  return (
                    <div key={alerta.id} className={`p-3 rounded-lg border text-sm ${isCritical ? 'bg-red-50 border-red-100 text-red-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                      <p className="font-semibold mb-1 flex justify-between">
                         {alerta.nivel}
                         <ChevronRight className="w-4 h-4 opacity-50" />
                      </p>
                      <p className="opacity-90">{alerta.mensaje}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
