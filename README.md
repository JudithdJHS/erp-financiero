# ERP Financiero - Fundación

Sistema web de control riguroso de gastos, presupuestos y trazabilidad documental para ESAL, con integración de IA/OCR.

## Estructura del Proyecto

```
erp-financiero/
├── backend/                  # Python FastAPI
│   ├── app/                  # Logic
│   │   ├── main.py           # Entry point
│   │   ├── routers/          # API routes
│   │   ├── services/         # OCR Service & Background Alert Scheduler
│   │   ├── crud.py           # DB ops
│   │   └── models.py         # SQLAlchemy Models
│   ├── requirements.txt      # Dependencias backend
│   └── Dockerfile
├── frontend/                 # React & Vite
│   ├── src/                  # Componentes principales (Dashboard, InvoiceForm)
│   ├── package.json          # Dependencias React (Axios)
│   └── Dockerfile
├── db/                       # Base de datos initial config
│   └── 001_init.sql          # Tablas core y data inicial de prueba
├── docker-compose.yml        # Orquestación de contenedores
└── .env.example              # Template de variables de entorno
```

## Requisitos Previos
- Tener instalado **Docker Desktop** (o Docker Engine + Docker Compose).

## Instrucciones para Correr Localmente

1. Configura tus Variables de Entorno:
   Copia el archivo template y, si las tienes preparadas, completa las credenciales de Document AI en el mismo para habilitar el OCR real:
   ```bash
   cp .env.example .env
   ```

2. Levanta la infraestructura de microservicios:
   ```bash
   docker-compose up --build
   ```

3. Accede a los servicios:
   - **Frontend (UI de Usuario)**: [http://localhost:5173](http://localhost:5173)
   - **Backend API (Swagger Docs Automáticas)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Base de Datos PostgreSQL**: `localhost:5432`

## Notas Técnicas Breves

1. **Doble Imputación Validada**: La lógica está asegurada a nivel de esquema en BD mediante restricciones `UNIQUE(categoria_id, campana_evento_id)` en `presupuestos`, y validación manual de Integridad en el `crud.py`.
2. **Google Cloud Document AI (OCR)**: Integrado mediante librería oficial. Preparado en `services/ocr_service.py` para usar cualquier procesador *Invoice Parser* de GCP. Nota: En ausencia de credenciales reales expuestas, simula con éxito un parser mockeado para no romper el flujo UX.
3. **Motor de Alertas (APScheduler)**: Funciona como Job asincrónico corriendo cada minuto evaluando en memoria si los topes gastados han subido, inyectando o mutando records de alertas (Niveles AMARILLA, NARANJA, ROJA) directamente en la capa transaccional.
