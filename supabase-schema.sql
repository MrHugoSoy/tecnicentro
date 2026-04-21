-- ============================================
-- TECNICENTRO — Esquema completo de Supabase
-- Pega esto en Supabase > SQL Editor y ejecuta
-- ============================================

-- Tabla de productos/llantas
CREATE TABLE productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  marca TEXT NOT NULL DEFAULT 'Goodyear',
  medida TEXT NOT NULL,         -- ej: 205/55R16
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  precio_instalacion DECIMAL(10,2) DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  imagen_url TEXT,
  categoria TEXT NOT NULL DEFAULT 'llanta', -- llanta, rin, accesorio
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de servicios disponibles
CREATE TABLE servicios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  duracion_minutos INT NOT NULL DEFAULT 60,
  precio DECIMAL(10,2) NOT NULL,
  activo BOOLEAN DEFAULT true
);

-- Tabla de citas
CREATE TABLE citas (
  id BIGSERIAL PRIMARY KEY,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  vehiculo TEXT NOT NULL,       -- ej: Honda Civic 2020
  placa TEXT,
  servicio_id BIGINT REFERENCES servicios(id),
  notas TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, confirmada, completada, cancelada
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de cotizaciones
CREATE TABLE cotizaciones (
  id BIGSERIAL PRIMARY KEY,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  vehiculo TEXT NOT NULL,
  medida_llanta TEXT NOT NULL,
  cantidad INT NOT NULL DEFAULT 4,
  productos_seleccionados JSONB,
  total_estimado DECIMAL(10,2),
  estado TEXT NOT NULL DEFAULT 'nueva', -- nueva, enviada, convertida
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de admins
CREATE TABLE admins (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'admin', -- admin, superadmin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Insertar servicios por defecto
-- ============================================
INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio) VALUES
  ('Montaje y balanceo (4 llantas)', 'Desmontaje de llantas viejas, montaje de llantas nuevas y balanceo de las 4 ruedas', 60, 600.00),
  ('Balanceo (4 ruedas)', 'Balanceo de las 4 ruedas para eliminar vibración', 45, 320.00),
  ('Alineación', 'Alineación computarizada de dirección', 45, 350.00),
  ('Inflado de llantas', 'Revisión y ajuste de presión de las 4 llantas', 15, 0.00),
  ('Revisión general', 'Inspección visual de llantas, frenos y suspensión', 30, 150.00),
  ('Reparación de ponchadura', 'Reparación de ponchadura con parche o plug', 30, 120.00);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Productos: todos pueden leer, solo admins pueden modificar
CREATE POLICY "productos_public_read" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "productos_admin_all" ON productos FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Servicios: todos pueden leer
CREATE POLICY "servicios_public_read" ON servicios FOR SELECT USING (activo = true);
CREATE POLICY "servicios_admin_all" ON servicios FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Citas: cualquiera puede insertar (sin auth), solo admins pueden leer/modificar todas
CREATE POLICY "citas_insert_public" ON citas FOR INSERT WITH CHECK (true);
CREATE POLICY "citas_admin_all" ON citas FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Cotizaciones: cualquiera puede insertar, admins pueden leer todas
CREATE POLICY "cotizaciones_insert_public" ON cotizaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "cotizaciones_admin_all" ON cotizaciones FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Admins: solo pueden verse a sí mismos o superadmin puede ver todos
CREATE POLICY "admins_self" ON admins FOR SELECT USING (id = auth.uid());

-- ============================================
-- Storage bucket para imágenes de productos
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('productos', 'productos', true);

CREATE POLICY "productos_images_public" ON storage.objects FOR SELECT USING (bucket_id = 'productos');
CREATE POLICY "productos_images_admin_upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'productos' AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- ============================================
-- Función para insertar primer admin
-- Corre esto DESPUÉS de crear tu usuario en Supabase Auth
-- Reemplaza 'TU_USER_ID' con el UUID de tu usuario
-- ============================================
-- INSERT INTO admins (id, nombre, email, rol) 
-- VALUES ('TU_USER_ID', 'Administrador', 'tu@email.com', 'superadmin');
