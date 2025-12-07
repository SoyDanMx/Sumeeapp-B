-- =========================================================================
-- DIAGNÓSTICO: Error en Creación de Lead
-- =========================================================================
-- Este script ayuda a identificar por qué no se puede crear un lead
-- =========================================================================

-- 1. Verificar que la política existe y tiene la condición correcta
SELECT 
  'POLÍTICA INSERT authenticated' as verificacion,
  policyname,
  cmd,
  roles,
  with_check as condicion,
  CASE 
    WHEN with_check::text LIKE '%cliente_id = auth.uid()%' 
      THEN '✅ Condición correcta: cliente_id = auth.uid()'
    WHEN with_check::text LIKE '%cliente_id IS NULL%'
      THEN '✅ Condición correcta: cliente_id IS NULL'
    ELSE '⚠️ Verificar condición: ' || with_check::text
  END as estado
FROM pg_policies
WHERE tablename = 'leads' 
  AND policyname = 'cliente_puede_crear_leads';

-- 2. Verificar tipo de dato de cliente_id
SELECT 
  'TIPO DE DATO cliente_id' as verificacion,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  CASE 
    WHEN data_type = 'uuid' THEN '✅ Tipo UUID (correcto)'
    WHEN data_type = 'text' THEN '⚠️ Tipo TEXT - puede causar problemas'
    ELSE '❌ Tipo inesperado: ' || data_type
  END as estado
FROM information_schema.columns
WHERE table_name = 'leads' 
  AND column_name = 'cliente_id'
  AND table_schema = 'public';

-- 3. Verificar que auth.uid() funcione (solo si hay sesión activa)
-- NOTA: Esta consulta solo funcionará si hay un usuario autenticado
SELECT 
  'AUTH.UID() TEST' as verificacion,
  auth.uid() as current_auth_uid,
  auth.uid()::text as auth_uid_text,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ auth.uid() funciona'
    ELSE '⚠️ No hay usuario autenticado (normal si no hay sesión)'
  END as estado;

-- 4. Verificar si hay restricciones CHECK que puedan bloquear
SELECT 
  'RESTRICCIONES CHECK' as verificacion,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definicion,
  CASE 
    WHEN pg_get_constraintdef(oid)::text LIKE '%cliente_id%' 
      THEN '⚠️ Restricción que involucra cliente_id'
    ELSE '✅ Restricción general'
  END as tipo
FROM pg_constraint
WHERE conrelid = 'public.leads'::regclass
  AND contype = 'c'
ORDER BY conname;

-- 5. Verificar FOREIGN KEY constraints que puedan causar problemas
SELECT 
  'FOREIGN KEYS' as verificacion,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definicion,
  CASE 
    WHEN pg_get_constraintdef(oid)::text LIKE '%cliente_id%' 
      THEN '⚠️ FK que involucra cliente_id'
    ELSE '✅ FK general'
  END as tipo
FROM pg_constraint
WHERE conrelid = 'public.leads'::regclass
  AND contype = 'f'
ORDER BY conname;

-- 6. Verificar que no haya políticas conflictivas
SELECT 
  'POLÍTICAS CONFLICTIVAS' as verificacion,
  policyname,
  cmd,
  roles,
  CASE 
    WHEN cmd = 'INSERT' AND 'authenticated' = ANY(roles) 
      THEN '✅ Política INSERT para authenticated'
    WHEN cmd = 'INSERT' AND 'anon' = ANY(roles)
      THEN '✅ Política INSERT para anon'
    WHEN cmd = 'INSERT'
      THEN '⚠️ Política INSERT con otro rol'
    ELSE '✅ Otra política'
  END as tipo
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY cmd, policyname;




