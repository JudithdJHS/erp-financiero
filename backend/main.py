from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy import text

# Imports directos
import db
from db import engine, Base
import auth, catalog, dashboard, invoices
import alert_engine
from alert_engine import start_scheduler

# Crear tablas base
Base.metadata.create_all(bind=engine) 

app = FastAPI(title="ERP Financiero API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs('uploads', exist_ok=True)

@app.on_event("startup")
def startup_event():
    # Migración manual para entornos sin Shell (Render)
    with engine.connect() as conn:
        # Crear tabla programas si no existe
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS programas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                activo BOOLEAN DEFAULT TRUE
            );
        """))
        
        # Añadir columna programa_id a facturas si no existe
        conn.execute(text("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='facturas' AND column_name='programa_id') THEN
                    ALTER TABLE facturas ADD COLUMN programa_id INTEGER REFERENCES programas(id);
                END IF;
            END $$;
        """))
        conn.commit()
    
    start_scheduler()

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(catalog.router, prefix="/catalog", tags=["Catalog"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])

