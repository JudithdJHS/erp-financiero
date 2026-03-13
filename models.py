from sqlalchemy import Column, Integer, String, Date, Boolean, Numeric, ForeignKey, Text, JSON, TIMESTAMP, CheckConstraint, UniqueConstraint
from db import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), default="ADMIN")
    activo = Column(Boolean, default=True)

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)

class CampanaEvento(Base):
    __tablename__ = "campanas_eventos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    activa = Column(Boolean, default=True)

class Presupuesto(Base):
    __tablename__ = "presupuestos"
    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    campana_evento_id = Column(Integer, ForeignKey("campanas_eventos.id"), nullable=False)
    monto_total = Column(Numeric(15, 2), nullable=False, default=0.00)
    monto_ejecutado = Column(Numeric(15, 2), nullable=False, default=0.00)

    __table_args__ = (UniqueConstraint('categoria_id', 'campana_evento_id', name='uq_categoria_campana'),)

class Factura(Base):
    __tablename__ = "facturas"
    id = Column(Integer, primary_key=True, index=True)
    presupuesto_id = Column(Integer, ForeignKey("presupuestos.id"), nullable=False)
    campana_evento_id = Column(Integer, ForeignKey("campanas_eventos.id"), nullable=False)
    proveedor = Column(String(255))
    monto = Column(Numeric(15, 2), nullable=False)
    fecha_factura = Column(Date)
    concepto = Column(Text)
    numero_factura = Column(String(100))
    archivo_url = Column(String(500))
    ocr_payload = Column(JSON)
    fecha_registro = Column(TIMESTAMP, default=datetime.utcnow)

    __table_args__ = (CheckConstraint('monto >= 0', name='check_monto_positivo'),)

class Alerta(Base):
    __tablename__ = "alertas"
    id = Column(Integer, primary_key=True, index=True)
    presupuesto_id = Column(Integer, ForeignKey("presupuestos.id"), nullable=False)
    campana_evento_id = Column(Integer, ForeignKey("campanas_eventos.id"), nullable=False)
    nivel = Column(String(50), nullable=False)
    porcentaje = Column(Numeric(5, 2), nullable=False)
    mensaje = Column(Text, nullable=False)
    fecha_alerta = Column(TIMESTAMP, default=datetime.utcnow)
    activa = Column(Boolean, default=True)
