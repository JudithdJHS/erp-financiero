from sqlalchemy.orm import Session
import models, schemas
from decimal import Decimal

def get_categorias(db: Session):
    return db.query(models.Categoria).all()

def create_categoria(db: Session, cat: schemas.CategoriaBase):
    db_cat = models.Categoria(**cat.model_dump())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def delete_categoria(db: Session, cat_id: int):
    db_cat = db.query(models.Categoria).filter(models.Categoria.id == cat_id).first()
    if db_cat:
        db.delete(db_cat)
        db.commit()
    return db_cat

def get_campanas(db: Session):
    return db.query(models.CampanaEvento).filter(models.CampanaEvento.activa == True).all()

def create_campana(db: Session, camp: schemas.CampanaEventoBase):
    db_camp = models.CampanaEvento(**camp.model_dump())
    db.add(db_camp)
    db.commit()
    db.refresh(db_camp)
    return db_camp

def delete_campana(db: Session, camp_id: int):
    db_camp = db.query(models.CampanaEvento).filter(models.CampanaEvento.id == camp_id).first()
    if db_camp:
        db_camp.activa = False
        db.commit()
    return db_camp

def get_programas(db: Session):
    return db.query(models.Programa).filter(models.Programa.activo == True).all()

def create_programa(db: Session, prog: schemas.ProgramaBase):
    db_prog = models.Programa(**prog.model_dump())
    db.add(db_prog)
    db.commit()
    db.refresh(db_prog)
    return db_prog

def delete_programa(db: Session, prog_id: int):
    db_prog = db.query(models.Programa).filter(models.Programa.id == prog_id).first()
    if db_prog:
        db_prog.activo = False
        db.commit()
    return db_prog

def get_presupuestos(db: Session):
    return db.query(models.Presupuesto).all()

def create_presupuesto(db: Session, pres: schemas.PresupuestoBase):
    # Check if exists
    existing = db.query(models.Presupuesto).filter(
        models.Presupuesto.categoria_id == pres.categoria_id,
        models.Presupuesto.campana_evento_id == pres.campana_evento_id
    ).first()
    if existing:
        raise ValueError("Ya existe un presupuesto para esta combinación de campaña y categoría.")
    
    db_pres = models.Presupuesto(**pres.model_dump())
    db.add(db_pres)
    db.commit()
    db.refresh(db_pres)
    return db_pres

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
