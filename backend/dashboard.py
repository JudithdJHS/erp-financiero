from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas
from deps import get_db
from auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/summary")
def get_summary(campana_evento_id: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_dashboard_summary(db, campana_evento_id)

@router.get("/alerts", response_model=List[schemas.AlertaOutput])
def list_alerts(campana_evento_id: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_active_alerts(db, campana_evento_id)
