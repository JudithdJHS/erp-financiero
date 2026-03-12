from sqlalchemy.orm import Session
import models, schemas
from decimal import Decimal

def get_categorias(db: Session):
    return db.query(models.Categoria).all()

def get_campanas(db: Session):
    return db.query(models.CampanaEvento).filter(models.CampanaEvento.activa == True).all()

def get_presupuestos(db: Session):
    return db.query(models.Presupuesto).all()

def create_factura(db: Session, factura: schemas.FacturaCreate):
    presupuesto = db.query(models.Presupuesto).filter(
        models.Presupuesto.id == factura.presupuesto_id,
        models.Presupuesto.campana_evento_id == factura.campana_evento_id
    ).first()
    
    if not presupuesto:
        raise ValueError("El presupuesto no corresponde a la campaña/evento seleccionada.")

    db_factura = models.Factura(**factura.model_dump())
    db.add(db_factura)

    presupuesto.monto_ejecutado = float(Decimal(str(presupuesto.monto_ejecutado)) + Decimal(str(factura.monto)))
    db.add(presupuesto)

    db.commit()
    db.refresh(db_factura)
    return db_factura

def get_dashboard_summary(db: Session, campana_evento_id: int = None):
    query = db.query(models.Presupuesto)
    if campana_evento_id:
        query = query.filter(models.Presupuesto.campana_evento_id == campana_evento_id)
    
    presupuestos = query.all()
    monto_total = sum((p.monto_total for p in presupuestos), Decimal('0.00'))
    monto_ejecutado = sum((p.monto_ejecutado for p in presupuestos), Decimal('0.00'))
    monto_disponible = monto_total - monto_ejecutado

    return {
        "presupuesto_total": float(monto_total),
        "gastado": float(monto_ejecutado),
        "disponible": float(monto_disponible)
    }

def get_active_alerts(db: Session, campana_evento_id: int = None):
    query = db.query(models.Alerta).filter(models.Alerta.activa == True)
    if campana_evento_id:
        query = query.filter(models.Alerta.campana_evento_id == campana_evento_id)
    return query.all()
