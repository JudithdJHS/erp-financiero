from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from import crud, schemas
from deps import get_db
from auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/categorias", response_model=List[schemas.CategoriaOutput])
def list_categorias(db: Session = Depends(get_db)):
    return crud.get_categorias(db)

@router.get("/campanas", response_model=List[schemas.CampanaEventoOutput])
def list_campanas(db: Session = Depends(get_db)):
    return crud.get_campanas(db)

@router.get("/presupuestos", response_model=List[schemas.PresupuestoOutput])
def list_presupuestos(db: Session = Depends(get_db)):
    return crud.get_presupuestos(db)

@router.put("/presupuestos/{presupuesto_id}", response_model=schemas.PresupuestoOutput)
def update_presupuesto(presupuesto_id: int, presupuesto_in: schemas.PresupuestoBase, db: Session = Depends(get_db)):
    # Simple direct logic since there is no crud layer function for update yet
    from fastapi import HTTPException
    import models as models
    db_presupuesto = db.query(models.Presupuesto).filter(models.Presupuesto.id == presupuesto_id).first()
    if not db_presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    # Valida si cambia llaves
    db_presupuesto.monto_total = presupuesto_in.monto_total
    # (Monto ejecutado y otros no deberían editarse a mano sino por transacciones, pero como pidió editar 'asignado', se deja así)
    db.commit()
    db.refresh(db_presupuesto)
    return db_presupuesto
