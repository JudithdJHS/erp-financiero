import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2, Calendar, Hash, DollarSign, Type, User, Heart } from 'lucide-react';
import api from '../api';

const InvoiceForm = ({ onGastoRegistrado }) => {
  const [campanas, setCampanas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [programs, setPrograms] = useState([]);
  
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
    tipo_documento: 'Factura'
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
      const [campRes, catRes, presRes, progRes] = await Promise.all([
        api.get('/catalog/campanas'),
        api.get('/catalog/categorias'),
        api.get('/catalog/presupuestos'),
        api.get('/catalog/programas')
      ]);
      setCampanas(campRes.data);
      setCategorias(catRes.data);
      setPresupuestos(presRes.data);
      setPrograms(progRes.data);
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
        setErrorMsg("Información: El servidor respondió pero hubo un detalle en el análisis. Puedes completar los campos manualmente.");
      } else {
        setFormData(prev => ({
          ...prev,
          proveedor: data.proveedor || prev.proveedor,
          monto: data.monto ? data.monto.toString() : prev.monto,
          fecha_factura: data.fecha_factura || prev.fecha_factura,
          concepto: data.concepto || prev.concepto,
          numero_factura: data.numero_factura || prev.numero_factura,
          ocr_payload: data.ocr_payload || null
        }));
      }
    } catch (error) {
      console.error("OCR Error", error);
      setErrorMsg("Error conectando al servicio de análisis de facturas.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.presupuesto_id) {
      setErrorMsg("No hay presupuesto asignado para esta combinación. Ve a 'Presupuestos' para crearlo.");
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await api.post('/invoices/', {
        presupuesto_id: parseInt(formData.presupuesto_id),
        campana_evento_id: parseInt(formData.campana_evento_id),
        programa_id: formData.programa_id ? parseInt(formData.programa_id) : null,
        proveedor: formData.proveedor,
        monto: parseFloat(formData.monto),
        fecha_factura: formData.fecha_factura || null,
        concepto: formData.concepto,
        numero_factura: formData.numero_factura,
        ocr_payload: formData.ocr_payload || null
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        if (onGastoRegistrado) onGastoRegistrado();
        setFormData({
            campana_evento_id: '', categoria_id: '', presupuesto_id: '',
            proveedor: '', concepto: '', fecha_factura: '', monto: '', numero_factura: '', programa_id: '',
            ocr_payload: null
        });
        setFile(null);
      }, 3000);
      
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || "Error al guardar el gasto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-24">
      
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="bg-brand text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 font-medium">
            <CheckCircle2 className="w-6 h-6" />
            ¡Gasto registrado con éxito!
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
        
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-brand text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span>
            Cargar Factura / Cuenta de Cobro
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
                 <p className="font-medium text-lg">Analizando con Inteligencia Artificial...</p>
                 <p className="text-sm text-gray-500 mt-1">Extrayendo datos clave del documento</p>
               </div>
            ) : file ? (
               <div className="flex flex-col items-center justify-center text-green-600">
                 <FileText className="w-10 h-10 mb-3" />
                 <p className="font-medium text-lg">{file.name}</p>
                 <p className="text-sm text-gray-400 mt-2">Clic para cambiar</p>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-brand transition-colors">
                 <UploadCloud className="w-10 h-10 mb-3" />
                 <p className="font-medium text-lg">Subir Factura o Imagen</p>
                 <p className="text-sm opacity-70 mt-1">PDF, JPG, PNG</p>
               </div>
            )}
          </div>
        </section>

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
              <label className="label-base">Categoría de Gasto *</label>
              <select name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className="input-base" required>
                <option value="">Seleccionar categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="label-base text-gray-400">Presupuesto Vinculado</label>
                <input 
                  type="text" 
                  readOnly 
                  className="input-base bg-gray-50 text-gray-400 border-gray-200 font-medium cursor-not-allowed"
                  value={formData.presupuesto_id ? `✅ Presupuesto encontrado (ID: ${formData.presupuesto_id})` : '⚠️ No hay presupuesto para este cruce'} 
                />
              </div>
              
              <div>
                <label className="label-base flex items-center gap-1"><Heart className="w-3 h-3 text-brand"/> Programa Social</label>
                <select name="programa_id" value={formData.programa_id} onChange={handleInputChange} className="input-base">
                  <option value="">Seleccionar un programa (opcional)</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-brand text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span>
            Datos Extraídos / Detalle
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label-base">Tipo de Documento *</label>
              <select name="tipo_documento" value={formData.tipo_documento} onChange={handleInputChange} className="input-base" required>
                <option value="Factura">Factura</option>
                <option value="Cuenta de Cobro">Cuenta de Cobro</option>
              </select>
            </div>
            <div>
              <label className="label-base flex items-center gap-1"><User className="w-3 h-3"/> Proveedor *</label>
              <input type="text" name="proveedor" placeholder="Nombre de quien emite" value={formData.proveedor} onChange={handleInputChange} className="input-base" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label-base flex items-center gap-1"><Hash className="w-3 h-3"/> Número del Documento</label>
              <input type="text" name="numero_factura" placeholder="Ej: No. 1234" value={formData.numero_factura} onChange={handleInputChange} className="input-base" />
            </div>
            <div>
              <label className="label-base flex items-center gap-1"><DollarSign className="w-3 h-3 text-green-600"/> Monto Total *</label>
              <input type="number" step="0.01" min="0" name="monto" placeholder="0.00" value={formData.monto} onChange={handleInputChange} className="input-base font-bold text-xl text-gray-900" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label-base flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha</label>
              <input type="date" name="fecha_factura" value={formData.fecha_factura} onChange={handleInputChange} className="input-base" />
            </div>
            <div>
              <label className="label-base flex items-center gap-1"><Type className="w-3 h-3"/> Descripción / Concepto</label>
              <input type="text" name="concepto" placeholder="¿En qué se gastó?" value={formData.concepto} onChange={handleInputChange} className="input-base" />
            </div>
          </div>
        </section>

        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 px-8 shadow-2xl z-40">
           <div className="max-w-4xl mx-auto flex justify-end">
             <button type="submit" className="btn-primary px-12 py-4 text-xl w-full md:w-auto shadow-xl" disabled={saving}>
                {saving ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Guardando...</>
                ) : (
                  <><CheckCircle2 className="w-6 h-6" /> Registrar este Gasto</>
                )}
             </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
