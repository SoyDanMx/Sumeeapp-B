-- =========================================================================
-- VERIFICACIÓN PREVENTIVA: Detectar posibles errores antes de que ocurran
-- =========================================================================
-- Este script verifica que todo esté configurado correctamente
-- =========================================================================

-- 1. Verificar que RLS esté habilitado
SELECT 
  'RLS Status' as verificacion,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESHABILITADO - HABILITAR INMEDIATAMENTE'
  END as estado
FROM pg_tables
WHERE tablename = 'leads' AND schemaname = 'public';

-- 2. Verificar políticas de INSERT
SELECT 
  'Políticas INSERT' as verificacion,
  policyname,
  cmd,
  roles,
  CASE 
    WHEN 'authenticated' = ANY(roles) THEN '✅ Para authenticated'
    WHEN 'anon' = ANY(roles) THEN '✅ Para anon'
    ELSE '❌ Rol desconocido'
  END as para_rol
FROM pg_policies
WHERE tablename = 'leads' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- 3. Verificar que la política cliente_puede_crear_leads tenga la condición correcta
SELECT 
  'Condición de Política' as verificacion,
  policyname,
  with_check as condicion,
  CASE 
    WHEN with_check::text LIKE '%cliente_id = auth.uid()%' 
         OR with_check::text LIKE '%cliente_id IS NULL%' 
      THEN '✅ Condición correcta'
    ELSE '⚠️ Verificar condición'
  END as estado_condicion
FROM pg_policies
WHERE tablename = 'leads' 
  AND policyname = 'cliente_puede_crear_leads';

-- 4. Verificar tipo de dato de cliente_id en la tabla
SELECT 
  'Tipo de Dato' as verificacion,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN data_type = 'uuid' THEN '✅ Tipo correcto (UUID)'
    WHEN data_type = 'text' THEN '⚠️ Tipo TEXT - puede causar problemas de comparación'
    ELSE '❌ Tipo inesperado: ' || data_type
  END as estado_tipo
FROM information_schema.columns
WHERE table_name = 'leads' 
  AND column_name = 'cliente_id'
  AND table_schema = 'public';

-- 5. Verificar que auth.uid() funcione correctamente (solo si hay sesión)
-- Esta consulta solo funcionará si hay un usuario autenticado
SELECT 
  'Auth.uid() Test' as verificacion,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ auth.uid() funciona'
    ELSE '⚠️ No hay usuario autenticado (esto es normal si no hay sesión)'
  END as estado_auth
WHERE auth.uid() IS NOT NULL;

-- 6. Resumen de verificación
SELECT 
  'RESUMEN' as tipo,
  COUNT(*) FILTER (WHERE cmd = 'INSERT' AND 'authenticated' = ANY(roles)) as politicas_insert_authenticated,
  COUNT(*) FILTER (WHERE cmd = 'INSERT' AND 'anon' = ANY(roles)) as politicas_insert_anon,
  CASE 
    WHEN COUNT(*) FILTER (WHERE cmd = 'INSERT' AND 'authenticated' = ANY(roles)) > 0 
         AND COUNT(*) FILTER (WHERE cmd = 'INSERT' AND 'anon' = ANY(roles)) > 0
      THEN '✅ Todas las políticas necesarias existen'
    WHEN COUNT(*) FILTER (WHERE cmd = 'INSERT' AND 'authenticated' = ANY(roles)) = 0
      THEN '❌ FALTA política INSERT para authenticated'
    WHEN COUNT(*) FILTER (WHERE cmd = 'INSERT' AND 'anon' = ANY(roles)) = 0
      THEN '⚠️ FALTA política INSERT para anon (opcional)'
    ELSE '❌ FALTAN políticas'
  END as estado_final
FROM pg_policies
WHERE tablename = 'leads' 
  AND cmd = 'INSERT';




