from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from db import engine, Base
import models
import auth, catalog, dashboard, invoices
from alert_engine import start_scheduler

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"DB init warning: {e}")

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
def on_startup():
    try:
        start_scheduler()
    except Exception as e:
        print(f"Scheduler warning: {e}")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(catalog.router, prefix="/catalog", tags=["Catalog"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])