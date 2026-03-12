from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
# Importamos directamente los archivos sueltos
from db import SessionLocal
from models import Presupuesto, Factura, Alerta
from deps import get_db
from auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/summary")
def get_summary(campana_evento_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Presupuesto)
    if campana_evento_id:
        query = query.filter(Presupuesto.campana_evento_id == campana_evento_id)
    
    presupuestos = query.all()
    total = sum(p.monto_total for p in presupuestos)
    gastado = sum(p.monto_ejecutado for p in presupuestos)
    
    return {
        "presupuesto_total": total,
        "gastado": gastado,
        "disponible": total - gastado
    }

@router.get("/alerts")
def get_alerts(campana_evento_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Alerta).filter(Alerta.activa == True)
    if campana_evento_id:
        query = query.filter(Alerta.campana_evento_id == campana_evento_id)
    return query.all()
