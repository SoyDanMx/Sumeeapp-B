-- =========================================================================
-- SCRIPT PARA AGREGAR COLUMNA 'servicio' A LA TABLA LEADS
-- =========================================================================
-- Este script verifica si existe la columna 'servicio' y la agrega si no existe
-- Es seguro ejecutarlo múltiples veces (idempotente)

-- Paso 1: Verificar si la columna existe y agregarla si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND column_name = 'servicio'
    ) THEN
        -- Agregar la columna servicio (nullable primero para ser seguro)
        ALTER TABLE public.leads
        ADD COLUMN servicio TEXT;

        -- Si hay datos existentes, actualizar los valores NULL
        UPDATE public.leads 
        SET servicio = 'Sin especificar' 
        WHERE servicio IS NULL;

        -- Ahora hacer la columna NOT NULL (solo si no hay filas con NULL)
        -- Si hay filas con NULL, esto fallará, pero está bien porque ya las actualizamos
        ALTER TABLE public.leads
        ALTER COLUMN servicio SET NOT NULL;

        RAISE NOTICE '✅ Columna servicio agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna servicio ya existe';
    END IF;
END $$;

-- Paso 2: Verificar que la columna fue creada correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name = 'servicio';

-- Paso 3: Ver todas las columnas de la tabla leads para referencia
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
ORDER BY ordinal_position;

