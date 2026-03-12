from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from db import engine, Base
import auth, catalog, dashboard, invoices
from alert_engine import start_scheduler

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
    start_scheduler()

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(catalog.router, prefix="/catalog", tags=["Catalog"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])