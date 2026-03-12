import os
from google.cloud import documentai
from google.api_core.client_options import ClientOptions
from config import settings

def process_invoice_document(file_content: bytes, mime_type: str) -> dict:
    if not settings.GCP_PROJECT_ID or not settings.GCP_PROCESSOR_ID:
        return {
            "proveedor": "Proveedor Simulado OCR",
            "monto": 100.00,
            "fecha_factura": "2026-03-12",
            "concepto": "Suministros varios (Simulado)",
            "numero_factura": "INV-0001",
            "ocr_payload": {"raw_text": "Este es un payload simulado debido a la falta de credenciales de Google Cloud."}
        }
        
    opts = ClientOptions(api_endpoint=f"{settings.GCP_LOCATION}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    name = client.processor_path(settings.GCP_PROJECT_ID, settings.GCP_LOCATION, settings.GCP_PROCESSOR_ID)

    raw_document = documentai.RawDocument(content=file_content, mime_type=mime_type)
    request = documentai.ProcessRequest(name=name, raw_document=raw_document)

    try:
        result = client.process_document(request=request)
        document = result.document
        extracted_data = {
            "proveedor": None,
            "monto": None,
            "fecha_factura": None,
            "concepto": None,
            "numero_factura": None,
            "ocr_payload": {"raw_text": document.text}
        }

        for entity in document.entities:
            ent_type = entity.type_
            ent_val = entity.mention_text
            
            if ent_type == "supplier_name":
                extracted_data["proveedor"] = ent_val
            elif ent_type == "total_amount":
                try:
                    clean_monto = "".join(c for c in ent_val if c.isdigit() or c == '.')
                    if clean_monto:
                        extracted_data["monto"] = float(clean_monto)
                except:
                    pass
            elif ent_type == "invoice_date":
                extracted_data["fecha_factura"] = ent_val
            elif ent_type == "invoice_id":
                extracted_data["numero_factura"] = ent_val
            elif ent_type == "line_item":
                if extracted_data["concepto"]:
                    extracted_data["concepto"] += f" | {ent_val}"
                else:
                    extracted_data["concepto"] = ent_val
                    
        return extracted_data
    except Exception as e:
        print(f"Error procesando OCR: {e}")
        return {
            "error": str(e),
            "proveedor": None,
            "monto": None,
            "fecha_factura": None,
            "concepto": None,
            "numero_factura": None,
            "ocr_payload": None
        }
