-- =========================================================================
-- SCRIPT DEFINITIVO: AGREGAR COLUMNA appointment_status Y OTRAS FALTANTES
-- =========================================================================
-- Este script agrega todas las columnas necesarias para el flujo de aceptación de leads
-- Es seguro ejecutarlo múltiples veces (idempotente)
-- Ejecutar en el editor SQL de Supabase

-- 1. Agregar appointment_status si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND column_name = 'appointment_status'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN appointment_status text DEFAULT 'pendiente';
        
        RAISE NOTICE '✅ Columna appointment_status agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna appointment_status ya existe';
    END IF;
END $$;

-- 2. Agregar contact_deadline_at si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND column_name = 'contact_deadline_at'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN contact_deadline_at timestamptz;
        
        RAISE NOTICE '✅ Columna contact_deadline_at agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna contact_deadline_at ya existe';
    END IF;
END $$;

-- 3. Agregar appointment_notes si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND column_name = 'appointment_notes'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN appointment_notes text;
        
        RAISE NOTICE '✅ Columna appointment_notes agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna appointment_notes ya existe';
    END IF;
END $$;

-- 4. Agregar updated_at si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN updated_at timestamptz DEFAULT NOW();
        
        RAISE NOTICE '✅ Columna updated_at agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna updated_at ya existe';
    END IF;
END $$;

-- 5. Verificar todas las columnas agregadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name IN ('appointment_status', 'contact_deadline_at', 'appointment_notes', 'updated_at')
ORDER BY column_name;

