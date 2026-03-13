from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, models 
from deps import get_db
from auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/categorias", response_model=List[schemas.CategoriaOutput])
def list_categorias(db: Session = Depends(get_db)):
    return crud.get_categorias(db)

@router.post("/categorias", response_model=schemas.CategoriaOutput)
def create_categoria(categoria: schemas.CategoriaBase, db: Session = Depends(get_db)):
    return crud.create_categoria(db, categoria)

@router.delete("/categorias/{categoria_id}")
def delete_categoria(categoria_id: int, db: Session = Depends(get_db)):
    crud.delete_categoria(db, categoria_id)
    return {"message": "Categoría eliminada"}

@router.get("/campanas", response_model=List[schemas.CampanaEventoOutput])
def list_campanas(db: Session = Depends(get_db)):
    return crud.get_campanas(db)

@router.post("/campanas", response_model=schemas.CampanaEventoOutput)
def create_campana(campana: schemas.CampanaEventoBase, db: Session = Depends(get_db)):
    return crud.create_campana(db, campana)

@router.delete("/campanas/{campana_id}")
def delete_campana(campana_id: int, db: Session = Depends(get_db)):
    crud.delete_campana(db, campana_id)
    return {"message": "Campaña eliminada"}

@router.get("/presupuestos", response_model=List[schemas.PresupuestoOutput])
def list_presupuestos(db: Session = Depends(get_db)):
    return crud.get_presupuestos(db)

@router.post("/presupuestos", response_model=schemas.PresupuestoOutput)
def create_presupuesto(presupuesto: schemas.PresupuestoBase, db: Session = Depends(get_db)):
    return crud.create_presupuesto(db, presupuesto)

@router.put("/presupuestos/{presupuesto_id}", response_model=schemas.PresupuestoOutput)
def update_presupuesto(presupuesto_id: int, presupuesto_in: schemas.PresupuestoBase, db: Session = Depends(get_db)):
    db_presupuesto = db.query(models.Presupuesto).filter(models.Presupuesto.id == presupuesto_id).first()
    if not db_presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    db_presupuesto.monto_total = presupuesto_in.monto_total
    db.commit()
    db.refresh(db_presupuesto)
    return db_presupuesto
