-- =========================================================================
-- MIGRACIÓN: Estructura Correcta de Tabla Leads
-- =========================================================================
-- Esta migración garantiza que la tabla 'leads' tiene:
-- 1. Defaults para campos críticos
-- 2. Trigger para updated_at automático
-- 3. Constraints para validación de datos
-- 4. Índices optimizados para queries comunes
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASO 1: Agregar defaults si no existen
-- =========================================================================

-- Asegurar que id tiene default UUID (ya debería tenerlo, pero por si acaso)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'id'
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.leads 
      ALTER COLUMN id SET DEFAULT gen_random_uuid();
    RAISE NOTICE '✅ Default agregado a columna id';
  END IF;
END $$;

-- Asegurar que fecha_creacion tiene default (ya debería tenerlo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'fecha_creacion'
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.leads 
      ALTER COLUMN fecha_creacion SET DEFAULT timezone('utc'::text, now());
    RAISE NOTICE '✅ Default agregado a columna fecha_creacion';
  END IF;
END $$;

-- Agregar columna updated_at si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.leads 
      ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    RAISE NOTICE '✅ Columna updated_at agregada';
  ELSE
    -- Si existe, asegurar que tiene default
    ALTER TABLE public.leads 
      ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());
    RAISE NOTICE '✅ Default agregado a columna updated_at existente';
  END IF;
END $$;

-- Asegurar que estado tiene default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'estado'
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.leads 
      ALTER COLUMN estado SET DEFAULT 'Nuevo';
    RAISE NOTICE '✅ Default agregado a columna estado';
  END IF;
END $$;

-- =========================================================================
-- PASO 2: Asegurar que profesional_asignado_id puede ser NULL
-- =========================================================================

ALTER TABLE public.leads 
  ALTER COLUMN profesional_asignado_id DROP NOT NULL;

-- =========================================================================
-- PASO 3: Agregar check constraints para validación
-- =========================================================================

-- Constraint para estado
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_estado_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_estado_check 
  CHECK (estado IN (
    'Nuevo', 'nuevo',
    'Asignado', 'asignado',
    'En Progreso', 'en_progreso',
    'Completado', 'completado',
    'Cancelado', 'cancelado',
    'Contactado', 'contactado'
  ));

-- Constraint para servicio (si existe columna urgencia)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'urgencia'
  ) THEN
    ALTER TABLE public.leads
      DROP CONSTRAINT IF EXISTS leads_urgencia_check;

    ALTER TABLE public.leads
      ADD CONSTRAINT leads_urgencia_check 
      CHECK (urgencia IN ('baja', 'normal', 'alta', 'urgente', 'emergencia'));
    
    RAISE NOTICE '✅ Constraint agregado a columna urgencia';
  END IF;
END $$;

-- Constraint para servicio
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_servicio_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_servicio_check 
  CHECK (servicio IN (
    'plomeria',
    'electricidad',
    'carpinteria',
    'pintura',
    'limpieza',
    'jardineria',
    'albanileria',
    'remodelacion',
    'impermeabilizacion',
    'gas',
    'calentadores',
    'bombas_agua',
    'seguridad',
    'climatizacion',
    'electrodomesticos'
  ));

-- =========================================================================
-- PASO 4: Crear función y trigger para updated_at automático
-- =========================================================================

-- Eliminar triggers antiguos de updated_at si existen
DROP TRIGGER IF EXISTS leads_set_updated_at ON public.leads;
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;

-- Crear función para actualizar updated_at automáticamente
-- Si ya existe touch_leads_updated_at(), la reemplazamos con esta versión unificada
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear función alias para compatibilidad (si existe touch_leads_updated_at)
-- Esto asegura que si algún código antiguo la referencia, siga funcionando
CREATE OR REPLACE FUNCTION public.touch_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger único para updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leads_updated_at();

-- =========================================================================
-- PASO 5: Crear índices para mejorar performance
-- =========================================================================

-- Índice para cliente_id
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id 
  ON public.leads(cliente_id)
  WHERE cliente_id IS NOT NULL;

-- Índice para profesional_asignado_id
CREATE INDEX IF NOT EXISTS idx_leads_profesional_asignado_id 
  ON public.leads(profesional_asignado_id)
  WHERE profesional_asignado_id IS NOT NULL;

-- Índice para estado
CREATE INDEX IF NOT EXISTS idx_leads_estado 
  ON public.leads(estado);

-- Índice para servicio
CREATE INDEX IF NOT EXISTS idx_leads_servicio 
  ON public.leads(servicio);

-- Índice para fecha_creacion (ordenamiento)
CREATE INDEX IF NOT EXISTS idx_leads_fecha_creacion 
  ON public.leads(fecha_creacion DESC);

-- Índice compuesto para query común: leads disponibles
-- (estado = 'Nuevo' y sin profesional asignado)
CREATE INDEX IF NOT EXISTS idx_leads_disponibles 
  ON public.leads(estado, profesional_asignado_id, fecha_creacion DESC)
  WHERE (estado = 'Nuevo' OR estado = 'nuevo') 
    AND profesional_asignado_id IS NULL;

-- Índice para búsqueda por ubicación (si usas coordenadas)
CREATE INDEX IF NOT EXISTS idx_leads_ubicacion 
  ON public.leads(ubicacion_lat, ubicacion_lng)
  WHERE ubicacion_lat IS NOT NULL AND ubicacion_lng IS NOT NULL;

-- Índice para negotiation_status (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'negotiation_status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_leads_negotiation_status 
      ON public.leads(negotiation_status)
      WHERE negotiation_status IS NOT NULL;
    
    RAISE NOTICE '✅ Índice agregado para negotiation_status';
  END IF;
END $$;

COMMIT;

-- =========================================================================
-- VERIFICACIÓN
-- =========================================================================

-- Ver estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'leads'
  AND nsp.nspname = 'public'
ORDER BY constraint_name;

-- Ver índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'leads'
ORDER BY indexname;

-- Ver triggers
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'leads'
  AND event_object_schema = 'public';

