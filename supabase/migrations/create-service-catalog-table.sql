-- =========================================================================
-- MIGRACIÓN: Crear Tabla service_catalog para Catálogo de Precios
-- =========================================================================
-- Fecha: 2025-11-23
-- Objetivo: Estructura para estandarizar precios de servicios por disciplina
-- =========================================================================

-- 1. CREAR TIPO ENUM PARA price_type
-- =========================================================================

DO $$
BEGIN
    -- Verificar si el tipo ya existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'price_type_enum'
    ) THEN
        -- Crear el tipo usando EXECUTE con delimitador diferente
        EXECUTE $quote$CREATE TYPE price_type_enum AS ENUM ('fixed','range','starting_at')$quote$;
    END IF;
END
$$ LANGUAGE plpgsql;

-- 2. CREAR TABLA service_catalog
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.service_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipline TEXT NOT NULL,
    service_name TEXT NOT NULL,
    price_type price_type_enum NOT NULL DEFAULT 'starting_at',
    min_price NUMERIC(10, 2) NOT NULL,
    max_price NUMERIC(10, 2),
    unit TEXT NOT NULL DEFAULT 'servicio',
    includes_materials BOOLEAN DEFAULT false,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_price_range CHECK (
        (price_type = 'range' AND max_price IS NOT NULL AND max_price > min_price) OR
        (price_type IN ('fixed', 'starting_at'))
    ),
    CONSTRAINT check_min_price_positive CHECK (min_price > 0)
);

-- 3. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =========================================================================

-- Índice para búsquedas por disciplina (más común)
CREATE INDEX IF NOT EXISTS idx_service_catalog_discipline 
    ON public.service_catalog(discipline) 
    WHERE is_active = true;

-- Índice compuesto para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_service_catalog_discipline_active 
    ON public.service_catalog(discipline, is_active) 
    WHERE is_active = true;

-- 4. CREAR FUNCIÓN PARA ACTUALIZAR updated_at
-- =========================================================================

CREATE OR REPLACE FUNCTION update_service_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_update_service_catalog_updated_at
    BEFORE UPDATE ON public.service_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_service_catalog_updated_at();

-- 5. AGREGAR COMENTARIOS PARA DOCUMENTACIÓN
-- =========================================================================

COMMENT ON TABLE public.service_catalog IS 
    'Catálogo de servicios con precios estandarizados por disciplina';

COMMENT ON COLUMN public.service_catalog.discipline IS 
    'ID de la disciplina (debe coincidir con serviceCategories del frontend): electricidad, plomeria, etc.';

COMMENT ON COLUMN public.service_catalog.price_type IS 
    'Tipo de precio: fixed (precio fijo), range (rango), starting_at (desde)';

COMMENT ON COLUMN public.service_catalog.min_price IS 
    'Precio mínimo en MXN';

COMMENT ON COLUMN public.service_catalog.max_price IS 
    'Precio máximo en MXN (solo para price_type = range)';

COMMENT ON COLUMN public.service_catalog.unit IS 
    'Unidad de medida: servicio, pieza, m2, hora, etc.';

COMMENT ON COLUMN public.service_catalog.includes_materials IS 
    'Indica si el precio incluye materiales';

-- 6. ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- Habilitar RLS
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer servicios activos
CREATE POLICY "Anyone can view active services"
    ON public.service_catalog
    FOR SELECT
    USING (is_active = true);

-- Política: Solo autenticados pueden leer todos los servicios (para admin)
CREATE POLICY "Authenticated users can view all services"
    ON public.service_catalog
    FOR SELECT
    TO authenticated
    USING (true);

-- 7. SEED DATA: DATOS INICIALES
-- =========================================================================

-- Servicios de Electricidad
INSERT INTO public.service_catalog (discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description) VALUES
    ('electricidad', 'Instalación de Mufa', 'starting_at', 2900.00, NULL, 'pieza', false, 'Instalación de mufa estándar con materiales básicos'),
    ('electricidad', 'Instalación de Contacto', 'starting_at', 150.00, NULL, 'pieza', false, 'Instalación de contacto eléctrico simple'),
    ('electricidad', 'Instalación de Apagador', 'starting_at', 200.00, NULL, 'pieza', false, 'Instalación de apagador sencillo o doble'),
    ('electricidad', 'Instalación de Lámpara', 'starting_at', 350.00, NULL, 'pieza', false, 'Instalación de lámpara colgante o empotrada'),
    ('electricidad', 'Reparación de Corto Circuito', 'range', 800.00, 2500.00, 'servicio', false, 'Diagnóstico y reparación de corto circuito, precio según complejidad'),
    ('electricidad', 'Instalación de Ventilador de Techo', 'starting_at', 1200.00, NULL, 'pieza', false, 'Instalación de ventilador de techo con soporte'),
    ('electricidad', 'Cambio de Breaker', 'starting_at', 450.00, NULL, 'pieza', false, 'Cambio de breaker en tablero eléctrico'),
    ('electricidad', 'Instalación de Luminaria LED', 'starting_at', 500.00, NULL, 'pieza', false, 'Instalación de luminaria LED empotrada o colgante'),
    ('electricidad', 'Cableado Nuevo (Habitación)', 'range', 3500.00, 8000.00, 'habitación', false, 'Cableado eléctrico completo para una habitación'),
    ('electricidad', 'Actualización de Tablero Eléctrico', 'range', 5000.00, 15000.00, 'servicio', false, 'Actualización completa de tablero eléctrico según capacidad');

-- Servicios de Plomería
INSERT INTO public.service_catalog (discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description) VALUES
    ('plomeria', 'Reparación de Fuga de Agua', 'range', 500.00, 2000.00, 'servicio', false, 'Reparación de fuga, precio según ubicación y complejidad'),
    ('plomeria', 'Instalación de Llave de Agua', 'starting_at', 350.00, NULL, 'pieza', false, 'Instalación de llave de paso o llave mezcladora'),
    ('plomeria', 'Destape de Drenaje', 'range', 800.00, 2500.00, 'servicio', false, 'Destape de drenaje con máquina o manual, según complejidad'),
    ('plomeria', 'Instalación de Regadera', 'starting_at', 1200.00, NULL, 'pieza', false, 'Instalación de regadera con conexiones'),
    ('plomeria', 'Cambio de Válvula de Escusado', 'starting_at', 450.00, NULL, 'pieza', false, 'Cambio de válvula de escusado estándar'),
    ('plomeria', 'Instalación de Calentador de Agua', 'range', 3000.00, 8000.00, 'pieza', false, 'Instalación de calentador de paso o de depósito'),
    ('plomeria', 'Reparación de Tubería Rota', 'range', 1000.00, 4000.00, 'servicio', false, 'Reparación de tubería, precio según material y ubicación'),
    ('plomeria', 'Instalación de Lavabo', 'starting_at', 1500.00, NULL, 'pieza', false, 'Instalación completa de lavabo con conexiones'),
    ('plomeria', 'Instalación de WC', 'starting_at', 2500.00, NULL, 'pieza', false, 'Instalación completa de escusado con conexiones'),
    ('plomeria', 'Sistema de Agua Caliente', 'range', 5000.00, 15000.00, 'servicio', false, 'Instalación completa de sistema de agua caliente');

-- 8. VERIFICACIÓN
-- =========================================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'service_catalog'
ORDER BY ordinal_position;

-- Verificar que los datos se insertaron
SELECT 
    discipline,
    COUNT(*) as total_servicios,
    COUNT(CASE WHEN is_active = true THEN 1 END) as servicios_activos
FROM public.service_catalog
GROUP BY discipline
ORDER BY discipline;

-- Verificar el tipo ENUM
SELECT 
    typname as type_name,
    enumlabel as enum_value
FROM pg_type
JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
WHERE typname = 'price_type_enum';

