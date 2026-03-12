import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2, Calendar, Hash, DollarSign, Type, User } from 'lucide-react';
import api from '../api';

const InvoiceForm = ({ onGastoRegistrado }) => {
  const [campanas, setCampanas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [programs, setPrograms] = useState([
      {id: 1, name: 'Cumplimiento de Sueños'},
      {id: 2, name: 'Abrazos que Sanan'},
      {id: 3, name: 'Mercados con Amor'},
      {id: 4, name: 'Almuerzos con Amor'},
      {id: 5, name: 'Un Sueño sobre Ruedas'},
      {id: 6, name: 'Aprendemprendiendo'},
  ]);
  
  const [formData, setFormData] = useState({
    campana_evento_id: '',
    categoria_id: '',
    presupuesto_id: '',
    proveedor: '',
    concepto: '',
    fecha_factura: '',
    monto: '',
    numero_factura: '',
    programa_id: '',
    tipo_documento: 'Factura' // default
  });

  const [file, setFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Update presupuesto_id when campana or categoria changes
  useEffect(() => {
    if (formData.campana_evento_id && formData.categoria_id) {
      const p = presupuestos.find(
        p => p.campana_evento_id.toString() === formData.campana_evento_id && 
             p.categoria_id.toString() === formData.categoria_id
      );
      setFormData(prev => ({ ...prev, presupuesto_id: p ? p.id.toString() : '' }));
    } else {
      setFormData(prev => ({ ...prev, presupuesto_id: '' }));
    }
  }, [formData.campana_evento_id, formData.categoria_id, presupuestos]);

  const fetchCatalogs = async () => {
    try {
      const [campRes, catRes, presRes] = await Promise.all([
        api.get('/catalog/campanas'),
        api.get('/catalog/categorias'),
        api.get('/catalog/presupuestos')
      ]);
      setCampanas(campRes.data);
      setCategorias(catRes.data);
      setPresupuestos(presRes.data);
    } catch (error) {
      console.error("Error fetching catalogs", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      await handleOCR(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleOCR = async (selectedFile) => {
    if (!selectedFile) return;
    
    setOcrLoading(true);
    setErrorMsg('');
    const form = new FormData();
    form.append('archivo', selectedFile);

    try {
      const res = await api.post('/invoices/ocr', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = res.data;
      if (data.error) {
        setErrorMsg("Error OCR: " + data.error);
      } else {
        setFormData(prev => ({
          ...prev,
          proveedor: data.proveedor || prev.proveedor,
          monto: data.monto ? data.monto.toString() : prev.monto,
          fecha_factura: data.fecha_factura || prev.fecha_factura,
          concepto: data.concepto || prev.concepto,
          numero_factura: data.numero_factura || prev.numero_factura
        }));
      }
    } catch (error) {
      console.error("OCR Error", error);
      setErrorMsg("Error conectando al servicio OCR.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.presupuesto_id) {
      setErrorMsg("No existe un presupuesto asignado para esta combinación de Campaña y Categoría.");
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await api.post('/invoices/', {
        presupuesto_id: parseInt(formData.presupuesto_id),
        campana_evento_id: parseInt(formData.campana_evento_id),
        proveedor: formData.proveedor,
        monto: parseFloat(formData.monto),
        fecha_factura: formData.fecha_factura || null,
        concepto: formData.concepto,
        numero_factura: formData.numero_factura
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        if (onGastoRegistrado) onGastoRegistrado();
        // Reset form
        setFormData({
            campana_evento_id: '', categoria_id: '', presupuesto_id: '',
            proveedor: '', concepto: '', fecha_factura: '', monto: '', numero_factura: '', programa_id: ''
        });
        setFile(null);
      }, 3000);
      
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || "Error al guardar la factura.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-24">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="bg-brand text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 font-medium">
            <CheckCircle2 className="w-6 h-6" />
            ¡Toca la campana y envía un mensaje de esperanza a un niño que continúa su lucha!
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Upload */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-brand text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span>
            Cargar Archivo (IA / OCR)
          </h3>
          
          <div 
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors group relative"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="application/pdf,image/*" 
              className="hidden" 
            />
            
            {ocrLoading ? (
               <div className="flex flex-col items-center justify-center text-brand">
                 <Loader2 className="w-10 h-10 animate-spin mb-3" />
                 <p className="font-medium text-lg">Analizando documento con IA...</p>
                 <p className="text-sm text-gray-500 mt-1">Extrayendo proveedor, monto y detalles</p>
               </div>
            ) : file ? (
               <div className="flex flex-col items-center justify-center text-green-600">
                 <FileText className="w-10 h-10 mb-3" />
                 <p className="font-medium text-lg border-b border-green-200 pb-1">{file.name}</p>
                 <p className="text-sm text-gray-500 mt-2">Haz clic para cambiar el archivo</p>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-brand transition-colors">
                 <UploadCloud className="w-10 h-10 mb-3" />
                 <p className="font-medium text-lg">Arrastra o haz clic para subir</p>
                 <p className="text-sm opacity-70 mt-1">PDF, JPG, JPEG, PNG, TIFF</p>
               </div>
            )}
          </div>
        </section>

        {/* Step 2: Imputación */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-brand text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span>
            Imputación Presupuestal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label-base">Campaña / Evento *</label>
              <select name="campana_evento_id" value={formData.campana_evento_id} onChange={handleInputChange} className="input-base" required>
                <option value="">Seleccionar campaña</option>
                {campanas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            
            <div>
              <label className="label-base">Categoría Presupuestal *</label>
              <select name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className="input-base" required>
                <option value="">Seleccionar categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="label-base text-gray-400">Presupuesto Asociado *</label>
                <input 
                  type="text" 
                  readOnly 
                  name="presupuesto_id"
                  className="input-base bg-gray-50 text-gray-500 border-gray-200 font-medium cursor-not-allowed"
                  value={formData.presupuesto_id ? `Presupuesto Validado (ID: ${formData.presupuesto_id})` : 'Seleccionar campaña y categoría'} 
                />
                {!formData.presupuesto_id && formData.campana_evento_id && formData.categoria_id && (
                  <p className="text-xs text-red-500 mt-1">Esta combinación no cruza con ningún presupuesto creado.</p>
                )}
              </div>
              
              <div>
                <label className="label-base">Programa Beneficiado</label>
                <select name="programa_id" value={formData.programa_id} onChange={handleInputChange} className="input-base">
                  <option value="">Seleccionar un programa social (opcional)</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
          </div>
        </section>

        {/* Step 3: Detalle */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-brand text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span>
            Detalle de la Factura
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label-base flex items-center gap-1"><FileText className="w-3 h-3"/> Tipo de Documento *</label>
              <select name="tipo_documento" value={formData.tipo_documento} onChange={handleInputChange} className="input-base" required>
                <option value="Factura">Factura</option>
                <option value="Cuenta de Cobro">Cuenta de Cobro</option>
              </select>
            </div>
            <div>
              <label className="label-base flex items-center gap-1"><User className="w-3 h-3"/> Proveedor *</label>
              <input type="text" name="proveedor" placeholder="Nombre del proveedor" value={formData.proveedor} onChange={handleInputChange} className="input-base" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label-base flex items-center gap-1"><Hash className="w-3 h-3"/> N° Documento</label>
              <input type="text" name="numero_factura" placeholder="Ej: FAC-001 o CC-001" value={formData.numero_factura} onChange={handleInputChange} className="input-base" />
            </div>
            <div>
              <label className="label-base flex items-center gap-1"><DollarSign className="w-3 h-3"/> Monto (COP) *</label>
              <input type="number" step="0.01" min="0" name="monto" placeholder="0" value={formData.monto} onChange={handleInputChange} className="input-base font-medium text-lg text-gray-900" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label-base flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha Documento</label>
              <input type="date" name="fecha_factura" value={formData.fecha_factura} onChange={handleInputChange} className="input-base" />
            </div>
            <div>
              <label className="label-base flex items-center gap-1"><Type className="w-3 h-3"/> Concepto / Descripción</label>
              <input type="text" name="concepto" placeholder="Descripción del gasto" value={formData.concepto} onChange={handleInputChange} className="input-base" />
            </div>
          </div>
        </section>

        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
           <div className="max-w-4xl mx-auto flex justify-end">
             <button type="submit" className="btn-primary px-8 py-3 text-lg w-full md:w-auto shadow-md" disabled={saving}>
                {saving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Registrando...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Registrar Gasto</>
                )}
             </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
