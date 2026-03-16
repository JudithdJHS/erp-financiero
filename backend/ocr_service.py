import os
import random
import json
from datetime import datetime
from google.cloud import documentai
from google.api_core.client_options import ClientOptions
from google.oauth2 import service_account
from config import settings

def process_invoice_document(file_content: bytes, mime_type: str) -> dict:
    # MODO SIMULACIÓN: Si no hay credenciales configuradas
    if not settings.GCP_CREDENTIALS and (not settings.GCP_PROJECT_ID or not settings.GCP_PROCESSOR_ID):
        return {
            "proveedor": "Proveedor Ejemplo (MODO SIMULACIÓN)",
            "monto": float(random.randint(50000, 500000)),
            "fecha_factura": datetime.now().strftime("%Y-%m-%d"),
            "concepto": "Insumos y Logística (Simulado - No se detectó configuración de GCP)",
            "numero_factura": f"FAC-{random.randint(1000, 9999)}",
            "ocr_payload": {
                "raw_text": "INFO: Google Document AI no configurado. Use la variable GCP_CREDENTIALS en Render.",
                "mode": "simulation"
            }
        }
        
    try:
        opts = ClientOptions(api_endpoint=f"{settings.GCP_LOCATION}-documentai.googleapis.com")
        
        # Inicializar cliente con credenciales desde string JSON
        if settings.GCP_CREDENTIALS:
            creds_info = json.loads(settings.GCP_CREDENTIALS)
            credentials = service_account.Credentials.from_service_account_info(creds_info)
            client = documentai.DocumentProcessorServiceClient(credentials=credentials, client_options=opts)
        else:
            # Fallback a credenciales por defecto (entorno local con ADC)
            client = documentai.DocumentProcessorServiceClient(client_options=opts)

        name = client.processor_path(settings.GCP_PROJECT_ID, settings.GCP_LOCATION, settings.GCP_PROCESSOR_ID)

        raw_document = documentai.RawDocument(content=file_content, mime_type=mime_type)
        request = documentai.ProcessRequest(name=name, raw_document=raw_document)

        result = client.process_document(request=request)
        document = result.document
        
        extracted_data = {
            "proveedor": "",
            "monto": 0.0,
            "fecha_factura": "",
            "concepto": "",
            "numero_factura": "",
            "ocr_payload": {"raw_text": document.text[:1000], "mode": "real"} # Truncar raw_text para evitar payloads gigantes
        }

        # Mapeo de entidades (Invoice Parser de GCP)
        for entity in document.entities:
            ent_type = entity.type_
            ent_val = entity.mention_text
            
            if ent_type == "supplier_name":
                extracted_data["proveedor"] = ent_val
            elif ent_type == "total_amount":
                try:
                    # Limpieza robusta de montos
                    clean_monto = "".join(c for c in ent_val if c.isdigit() or c in '.,')
                    if ',' in clean_monto and '.' in clean_monto: # Formato 1,234.56
                        clean_monto = clean_monto.replace(',', '')
                    elif ',' in clean_monto: # Formato 1234,56
                        clean_monto = clean_monto.replace(',', '.')
                    
                    if clean_monto:
                        extracted_data["monto"] = float(clean_monto)
                except:
                    pass
            elif ent_type == "invoice_date":
                # Normalización de fecha
                extracted_data["fecha_factura"] = ent_val.replace('/', '-')
            elif ent_type == "invoice_id":
                extracted_data["numero_factura"] = ent_val
            elif ent_type == "line_item":
                if extracted_data["concepto"]:
                    extracted_data["concepto"] += f" | {ent_val}"
                else:
                    extracted_data["concepto"] = ent_val
                    
        return extracted_data

    except Exception as e:
        print(f"Error crítico en OCR Real: {e}")
        return {
            "error": f"Error en Google Document AI: {str(e)}",
            "proveedor": "Error de Extracción",
            "monto": 0.0,
            "mode": "error"
        }

