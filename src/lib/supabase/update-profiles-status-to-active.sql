-- =========================================================================
-- ACTUALIZAR STATUS DE PERFILES A 'active'
-- =========================================================================
-- Este script actualiza todos los perfiles profesionales a status 'active'
-- y establece 'active' como valor por defecto para nuevos registros.

-- 1. ACTUALIZAR TODOS LOS PERFILES PROFESIONALES A 'active'
-- =========================================================================
UPDATE public.profiles
SET status = 'active'
WHERE role = 'profesional'
  AND (status = 'inactive' OR status IS NULL);

-- 2. VERIFICAR CUÁNTOS PERFILES SE ACTUALIZARON
-- =========================================================================
SELECT 
  COUNT(*) as total_profesionales,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as activos,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactivos
FROM public.profiles
WHERE role = 'profesional';

-- 3. ESTABLECER 'active' COMO VALOR POR DEFECTO
-- =========================================================================
-- Verificar si la columna tiene un default
DO $$
BEGIN
    -- Verificar si el default existe y es diferente a 'active'
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'status'
        AND (column_default IS NULL OR column_default != '''active''::text')
    ) THEN
        -- Establecer 'active' como default
        ALTER TABLE public.profiles
        ALTER COLUMN status SET DEFAULT 'active';
        
        RAISE NOTICE '✅ Valor por defecto "active" establecido para la columna status';
    ELSE
        RAISE NOTICE 'ℹ️ La columna status ya tiene el default correcto';
    END IF;
END $$;

-- 4. VERIFICAR EL DEFAULT ESTABLECIDO
-- =========================================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'status';

-- Debería mostrar: column_default = 'active'::text

-- 5. COMENTARIOS
-- =========================================================================
-- Este script asegura que:
-- 1. Todos los perfiles profesionales existentes tengan status = 'active'
-- 2. Los nuevos perfiles profesionales se creen automáticamente con status = 'active'
-- 3. Los profesionales puedan cambiar su status usando el toggle en el dashboard
