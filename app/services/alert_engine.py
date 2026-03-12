from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models import Presupuesto, Alerta

def evaluate_budgets():
    db: Session = SessionLocal()
    try:
        presupuestos = db.query(Presupuesto).all()
        for p in presupuestos:
            if p.monto_total <= 0:
                continue
            
            porcentaje = (p.monto_ejecutado / p.monto_total) * 100
            nivel = None
            if porcentaje >= 100:
                nivel = "ROJA"
            elif porcentaje >= 90:
                nivel = "NARANJA"
            elif porcentaje >= 80:
                nivel = "AMARILLA"
            
            if nivel:
                # Comprobar alerta activa para este presupuesto
                alerta_activa = db.query(Alerta).filter(
                    Alerta.presupuesto_id == p.id,
                    Alerta.activa == True
                ).first()

                mensaje = f"Consumo del {porcentaje:.2f}% en la categoría {p.categoria_id} para la campaña {p.campana_evento_id}"

                if alerta_activa:
                    if alerta_activa.nivel != nivel:
                        # Actualizar nivel
                        alerta_activa.nivel = nivel
                        alerta_activa.porcentaje = porcentaje
                        alerta_activa.mensaje = mensaje
                        db.add(alerta_activa)
                else:
                    nueva_alerta = Alerta(
                        presupuesto_id=p.id,
                        campana_evento_id=p.campana_evento_id,
                        nivel=nivel,
                        porcentaje=porcentaje,
                        mensaje=mensaje,
                        activa=True
                    )
                    db.add(nueva_alerta)
        
        db.commit()
    finally:
        db.close()

def start_scheduler():
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(evaluate_budgets, 'interval', minutes=1)
    scheduler.start()
