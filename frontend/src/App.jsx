import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, BarChart3, Users, Tags, FileText, Bell, LogOut, Settings, CreditCard, Heart } from 'lucide-react';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import Login from './components/Login';
import Programs from './components/Programs';
import Budgets from './components/Budgets';
import Categories from './components/Categories';
import Campaigns from './components/Campaigns';
import Alerts from './components/Alerts';
import './styles.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('erp_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'invoice':
        return <InvoiceForm />;
      // Placeholders for future views
      case 'programs':
        return <Programs />;
      case 'budgets':
        return <Budgets />;
      case 'categories':
        return <Categories />;
      case 'campaigns':
        return <Campaigns />;
      case 'alerts':
        return <Alerts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-bg border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">ERP Financiero</h1>
            <p className="text-xs text-gray-500">Fundación</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <button 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            className={`sidebar-item ${activeTab === 'invoice' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoice')}
          >
            <Receipt className="w-5 h-5" />
            Facturas
          </button>

          <button 
            className={`sidebar-item ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <Users className="w-5 h-5" />
            Campañas
          </button>

          <button 
            className={`sidebar-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Tags className="w-5 h-5" />
            Categorías
          </button>

          <button 
            className={`sidebar-item ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            <CreditCard className="w-5 h-5" />
            Presupuestos
          </button>

           <button 
            className={`sidebar-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <Bell className="w-5 h-5" />
            Alertas
          </button>
          
          <button 
            className={`sidebar-item ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <Heart className="w-5 h-5" />
            Programas
          </button>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation / Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
           <div className="flex items-center text-sm text-gray-500">
             <span>/ {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">fund-trust-flow.com</span>
              <button className="text-gray-400 hover:text-gray-600">
                 <Settings className="w-5 h-5" />
              </button>
           </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
