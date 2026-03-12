def process_invoice_document(file_content: bytes, mime_type: str) -> dict:
    return {
        "proveedor": "Proveedor Simulado",
        "monto": 100.00,
        "fecha_factura": "2026-03-12",
        "concepto": "Suministros varios",
        "numero_factura": "INV-0001",
        "ocr_payload": {"raw_text": "Simulado"}
    }