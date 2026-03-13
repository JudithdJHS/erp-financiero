from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, Any, List

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaOutput(CategoriaBase):
    id: int
    class Config:
        from_attributes = True

class CampanaEventoBase(BaseModel):
    nombre: str
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    activa: bool = True

class CampanaEventoOutput(CampanaEventoBase):
    id: int
    class Config:
        from_attributes = True

class PresupuestoBase(BaseModel):
    categoria_id: int
    campana_evento_id: int
    monto_total: float
    monto_ejecutado: float = 0.0

class PresupuestoOutput(PresupuestoBase):
    id: int
    class Config:
        from_attributes = True

class FacturaCreate(BaseModel):
    presupuesto_id: int
    campana_evento_id: int
    proveedor: Optional[str] = None
    monto: float = Field(ge=0)
    fecha_factura: Optional[date] = None
    concepto: Optional[str] = None
    numero_factura: Optional[str] = None
    archivo_url: Optional[str] = None
    ocr_payload: Optional[Any] = None

class FacturaOutput(FacturaCreate):
    id: int
    fecha_registro: datetime
    class Config:
        from_attributes = True

class AlertaOutput(BaseModel):
    id: int
    presupuesto_id: int
    campana_evento_id: int
    nivel: str
    porcentaje: float
    mensaje: str
    fecha_alerta: datetime
    activa: bool
    class Config:
        from_attributes = True
