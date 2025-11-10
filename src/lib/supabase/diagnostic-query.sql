-- =====================================================
-- DIAGNÓSTICO: Estructura de la tabla profiles
-- =====================================================
-- Ejecuta este query para ver qué columnas existen actualmente

-- Ver todas las columnas de la tabla profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Ver los primeros 5 registros completos
SELECT * FROM public.profiles LIMIT 5;

-- Ver usuarios profesionales (para entender la estructura)
SELECT 
  user_id,
  full_name,
  email,
  role,
  phone,
  whatsapp,
  profession,
  created_at
FROM public.profiles
WHERE role = 'profesional'
LIMIT 5;

-- Verificar si existe alguna columna relacionada con membresía
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND (
    column_name LIKE '%plan%' OR
    column_name LIKE '%member%' OR
    column_name LIKE '%subscri%' OR
    column_name LIKE '%tier%'
  );

