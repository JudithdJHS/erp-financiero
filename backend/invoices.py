from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import crud, schemas
from deps import get_db
from ocr_service import process_invoice_document
from auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.post("/ocr")
async def extract_ocr_data(archivo: UploadFile = File(...)):
    if not archivo.content_type.startswith(('image/', 'application/pdf')):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen o PDF.")
    
    content = await archivo.read()
    data = process_invoice_document(content, archivo.content_type)
    return data

@router.post("/", response_model=schemas.FacturaOutput)
def create_invoice(factura: schemas.FacturaCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_factura(db, factura)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
