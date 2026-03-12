from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="ERP Financiero API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs('uploads', exist_ok=True)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    # Create DB tables
    try:
        from db import engine, Base
        import models
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")

    # Start scheduler
    try:
        from alert_engine import start_scheduler
        start_scheduler()
        print("Scheduler started successfully")
    except Exception as e:
        print(f"Warning: Could not start scheduler: {e}")

    # Include routers
    try:
        import auth, catalog, dashboard, invoices
        app.include_router(auth.router, prefix="/auth", tags=["Auth"])
        app.include_router(catalog.router, prefix="/catalog", tags=["Catalog"])
        app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
        app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
        print("All routers included successfully")
    except Exception as e:
        print(f"Error including routers: {e}")
        raise