-- =========================================================================
-- SCRIPT PARA AGREGAR COLUMNA 'ubicacion_direccion' A LA TABLA LEADS
-- =========================================================================
-- Este script agrega la columna ubicacion_direccion si no existe
-- Es seguro ejecutarlo múltiples veces (idempotente)

-- Agregar columna ubicacion_direccion si no existe
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

-- Verificar que la columna fue creada
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name = 'ubicacion_direccion';

