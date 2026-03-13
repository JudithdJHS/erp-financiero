from sqlalchemy.orm import Session
from db import SessionLocal
from models import Presupuesto, Alerta, CampanaEvento, Categoria

def evaluate_budgets():
    db: Session = SessionLocal()
    try:
        presupuestos = db.query(Presupuesto).all()
        for p in presupuestos:
            if p.monto_total <= 0:
                continue
            
            porcentaje = (float(p.monto_ejecutado) / float(p.monto_total)) * 100
            nivel = None
            if porcentaje >= 100:
                nivel = "CRITICO" # More descriptive than "ROJA"
            elif porcentaje >= 90:
                nivel = "ADVERTENCIA"
            
            if nivel:
                # Get names for better message
                campana = db.query(CampanaEvento).filter(CampanaEvento.id == p.campana_evento_id).first()
                categoria = db.query(Categoria).filter(Categoria.id == p.categoria_id).first()
                
                camp_name = campana.nombre if campana else f"ID {p.campana_evento_id}"
                cat_name = categoria.nombre if categoria else f"ID {p.categoria_id}"

                alerta_activa = db.query(Alerta).filter(
                    Alerta.presupuesto_id == p.id,
                    Alerta.activa == True
                ).first()

                mensaje = f"Límite alcanzado: {cat_name} ({camp_name}) al {porcentaje:.1f}%"

                if alerta_activa:
                    if alerta_activa.nivel != nivel or abs(float(alerta_activa.porcentaje) - porcentaje) > 1:
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
            else:
                # Deactivate alert if it's below threshold now? (re-allocation)
                alerta_activa = db.query(Alerta).filter(
                    Alerta.presupuesto_id == p.id,
                    Alerta.activa == True
                ).first()
                if alerta_activa and porcentaje < 80:
                    alerta_activa.activa = False
                    db.add(alerta_activa)
        
        db.commit()
    finally:
        db.close()

def start_scheduler():
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        scheduler = BackgroundScheduler()
        scheduler.add_job(evaluate_budgets, 'interval', minutes=5) # 5 minutes is enough
        scheduler.start()
    except Exception as e:
        print(f"Error starting scheduler: {e}")
