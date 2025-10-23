-- =========================================================================
-- CORREGIR DEFAULTS MAL DEFINIDOS EN LA TABLA PROFILES
-- =========================================================================
-- Este script corrige los valores por defecto mal definidos que están causando errores

-- 1. CORREGIR EL DEFAULT DE MEMBERSHIP_STATUS
-- =========================================================================
-- El problema: membership_status text NOT NULL DEFAULT '''free'''::text
-- La solución: Corregir el DEFAULT a 'free'
ALTER TABLE public.profiles
ALTER COLUMN membership_status SET DEFAULT 'free';

-- 2. VERIFICAR QUE EL DEFAULT SE APLICÓ CORRECTAMENTE
-- =========================================================================
-- Ejecutar esta consulta para verificar que el DEFAULT esté correcto:
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public' 
  AND column_name = 'membership_status';

-- Debería mostrar: column_default = 'free'::text

-- 3. VERIFICAR TODAS LAS COLUMNAS NOT NULL
-- =========================================================================
-- Ejecutar esta consulta para ver todas las columnas NOT NULL:
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public' 
  AND is_nullable = 'NO'
ORDER BY column_name;

-- 4. COMENTARIOS
-- =========================================================================
-- Después de ejecutar este script, la tabla profiles tendrá
-- los DEFAULTS correctos y el trigger funcionará sin problemas.
