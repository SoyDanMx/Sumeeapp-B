-- =========================================================================
-- SCRIPT: Agregar Columna 'city' a profiles si no existe
-- =========================================================================
-- Este script agrega la columna 'city' a la tabla profiles si no existe.
-- Ejecutar ANTES de ejecutar create-calculate-avg-prices-function.sql
-- =========================================================================

-- Verificar si la columna 'city' ya existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'city'
  ) THEN
    -- Agregar columna 'city' si no existe
    ALTER TABLE public.profiles 
    ADD COLUMN city TEXT;
    
    -- Establecer valor por defecto para registros existentes
    UPDATE public.profiles 
    SET city = 'Ciudad de México' 
    WHERE city IS NULL;
    
    RAISE NOTICE '✅ Columna "city" agregada exitosamente a la tabla profiles';
  ELSE
    RAISE NOTICE 'ℹ️ La columna "city" ya existe en la tabla profiles';
  END IF;
END $$;

-- Verificar resultado
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'city';

-- =========================================================================
-- NOTAS
-- =========================================================================
-- 1. Si la columna ya existe, el script no hace nada (idempotente).
-- 2. Los registros existentes se actualizan con 'Ciudad de México' como default.
-- 3. Ejecutar este script ANTES de create-calculate-avg-prices-function.sql
--    para evitar el error "column p.city does not exist".
-- =========================================================================

