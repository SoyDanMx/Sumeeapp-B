-- =========================================================================
-- SCRIPT PARA AGREGAR COLUMNAS FALTANTES A LA TABLA LEADS
-- =========================================================================
-- Este script verifica y agrega las columnas que faltan en la tabla leads
-- Es seguro ejecutarlo múltiples veces (idempotente)

-- Paso 1: Agregar columna cliente_id si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND column_name = 'cliente_id'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN cliente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Columna cliente_id agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna cliente_id ya existe';
    END IF;
END $$;

-- Paso 2: Agregar columna ubicacion_direccion si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND column_name = 'ubicacion_direccion'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN ubicacion_direccion TEXT;
        
        RAISE NOTICE '✅ Columna ubicacion_direccion agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna ubicacion_direccion ya existe';
    END IF;
END $$;

-- Paso 3: Verificar todas las columnas de la tabla leads
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
ORDER BY ordinal_position;

