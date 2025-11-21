-- =========================================================================
-- VERIFICACIÓN RÁPIDA: Estado actual de create_lead y RLS
-- =========================================================================
-- Ejecuta este script en Supabase SQL Editor para verificar el estado
-- =========================================================================

-- 1. Verificar si existe la función create_lead
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  p.prosecdef as is_security_definer,
  CASE 
    WHEN p.prosecdef THEN '✅ SECURITY DEFINER (bypass RLS)'
    ELSE '❌ NO es SECURITY DEFINER'
  END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'create_lead';

-- 2. Verificar políticas RLS en la tabla leads
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS activado'
    ELSE '❌ RLS desactivado'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'leads';

-- 3. Verificar políticas de INSERT en leads
SELECT 
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'leads'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- 4. Verificar permisos de ejecución de create_lead
SELECT 
  p.proname as function_name,
  r.rolname as role_name,
  CASE 
    WHEN has_function_privilege(r.oid, p.oid, 'EXECUTE') THEN '✅ Tiene permiso'
    ELSE '❌ Sin permiso'
  END as execute_permission
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
CROSS JOIN pg_roles r
WHERE n.nspname = 'public' 
  AND p.proname = 'create_lead'
  AND r.rolname IN ('authenticated', 'anon', 'service_role')
ORDER BY r.rolname;

-- 5. Verificar estructura de la tabla leads (columnas NOT NULL)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN is_nullable = 'NO' AND column_default IS NULL THEN '⚠️ NOT NULL sin default'
    WHEN is_nullable = 'NO' AND column_default IS NOT NULL THEN '✅ NOT NULL con default'
    ELSE '✅ NULL permitido'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name IN (
    'nombre_cliente',
    'descripcion_proyecto',
    'servicio',
    'ubicacion_lat',
    'ubicacion_lng',
    'estado',
    'cliente_id'
  )
ORDER BY column_name;

