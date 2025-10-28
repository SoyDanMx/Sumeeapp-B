-- =========================================================================
-- SCRIPT PARA VERIFICAR EL ESQUEMA DE LA TABLA LEADS
-- =========================================================================
-- Ejecuta este script primero para ver qué columnas tiene tu tabla leads

-- Ver todas las columnas de la tabla leads
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
ORDER BY ordinal_position;

-- Verificar específicamente si existe la columna cliente_id o client_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'cliente_id'
        ) THEN 'La tabla tiene la columna: cliente_id'
        ELSE 'La tabla NO tiene la columna: cliente_id'
    END as cliente_id_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'client_id'
        ) THEN 'La tabla tiene la columna: client_id'
        ELSE 'La tabla NO tiene la columna: client_id'
    END as client_id_check;

