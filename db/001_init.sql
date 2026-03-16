CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'ADMIN',
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT
);

CREATE TABLE campanas_eventos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE presupuestos (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    campana_evento_id INTEGER NOT NULL REFERENCES campanas_eventos(id),
    monto_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    monto_ejecutado NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    UNIQUE(categoria_id, campana_evento_id)
);

CREATE TABLE programas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    presupuesto_id INTEGER NOT NULL REFERENCES presupuestos(id),
    campana_evento_id INTEGER NOT NULL REFERENCES campanas_eventos(id),
    programa_id INTEGER REFERENCES programas(id),
    proveedor VARCHAR(255),
    monto NUMERIC(15, 2) NOT NULL,
    fecha_factura DATE,
    concepto TEXT,
    numero_factura VARCHAR(100),
    archivo_url VARCHAR(500),
    ocr_payload JSONB,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_monto_positivo CHECK (monto >= 0)
);


CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    presupuesto_id INTEGER NOT NULL REFERENCES presupuestos(id),
    campana_evento_id INTEGER NOT NULL REFERENCES campanas_eventos(id),
    nivel VARCHAR(50) NOT NULL, -- 'AMARILLA', 'NARANJA', 'ROJA'
    porcentaje NUMERIC(5, 2) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE
);

-- Datos iniciales para pruebas
INSERT INTO categorias (nombre, descripcion) VALUES ('Logística', 'Transporte y montaje'), ('Alimentación', 'Catering y refrigerios'), ('Publicidad', 'Pautas y diseño');
INSERT INTO campanas_eventos (nombre) VALUES ('Gran Cena Solidaria 2026'), ('Campaña Donación Útiles 2026');
INSERT INTO presupuestos (categoria_id, campana_evento_id, monto_total) VALUES 
(1, 1, 5000.00), (2, 1, 3000.00), (3, 1, 1500.00),
(1, 2, 1000.00), (3, 2, 500.00);

-- Usuarios por defecto
INSERT INTO usuarios (email, password_hash, rol) VALUES 
('admin@fundacion.org', '$2b$12$myEJxX6L8U41Ns0dRWP7W..pX2nFtbHs7b1QO0aweEtrGGw7C2D5G', 'ADMIN'),
('finanzas@fundacion.org', '$2b$12$VSafSWItJOKmlG9qJMZYV.kF0AJ1iePpz.rACiRlawGQhbtXDJIiq', 'USER'),
('auditor@fundacion.org', '$2b$12$qy8YfhT1SQdRkO91GaLNwOFKo3ngpU9nmAAej80kp9oifWWau7v2W', 'AUDITOR');

