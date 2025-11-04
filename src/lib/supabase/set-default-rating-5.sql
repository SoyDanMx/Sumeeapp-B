-- =========================================================================
-- CAMBIAR VALOR POR DEFECTO DE CALIFICACION_PROMEDIO A 5 ESTRELLAS
-- =========================================================================
-- Este script cambia el valor por defecto de calificacion_promedio de 0 a 5
-- para que todos los nuevos profesionales comiencen con 5 estrellas

-- =========================================================================
-- 1. CAMBIAR EL DEFAULT DE CALIFICACION_PROMEDIO
-- =========================================================================
ALTER TABLE public.profiles
ALTER COLUMN calificacion_promedio SET DEFAULT 5;

-- =========================================================================
-- 2. ACTUALIZAR PROFESIONALES EXISTENTES CON CALIFICACIÓN 0 A 5
-- =========================================================================
-- Opcional: Actualizar profesionales existentes que tienen 0 estrellas
-- Descomenta la siguiente línea si deseas actualizar los existentes:
-- UPDATE public.profiles 
-- SET calificacion_promedio = 5 
-- WHERE calificacion_promedio = 0 OR calificacion_promedio IS NULL;

-- =========================================================================
-- 3. VERIFICAR QUE EL DEFAULT SE APLICÓ CORRECTAMENTE
-- =========================================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public' 
  AND column_name = 'calificacion_promedio';

-- Debería mostrar: column_default = '5'
