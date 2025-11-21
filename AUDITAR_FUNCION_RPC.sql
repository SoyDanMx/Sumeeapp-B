-- =========================================================================
-- AUDITORÍA COMPLETA DE LA FUNCIÓN RPC create_lead_simple
-- =========================================================================
-- Este script verifica qué puede estar bloqueando la función RPC
-- =========================================================================

-- =========================================================================
-- 1. VERIFICAR LA FUNCIÓN RPC
-- =========================================================================
SELECT 
  routine_name,
  routine_type,
  security_type,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead_simple';

-- =========================================================================
-- 2. VERIFICAR PERMISOS DE LA FUNCIÓN
-- =========================================================================
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead_simple';

-- =========================================================================
-- 3. VERIFICAR TODOS LOS TRIGGERS EN LA TABLA LEADS
-- =========================================================================
SELECT 
  t.tgname as trigger_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN '✅ HABILITADO'
    WHEN t.tgenabled = 'D' THEN '❌ DESHABILITADO'
    WHEN t.tgenabled = 'R' THEN '⚠️ REPLICA'
    WHEN t.tgenabled = 'A' THEN '⚠️ ALWAYS'
    ELSE '⚠️ DESCONOCIDO'
  END as estado,
  CASE 
    WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
    WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE 
    WHEN t.tgtype & 4 = 4 THEN 'INSERT'
    WHEN t.tgtype & 8 = 8 THEN 'DELETE'
    WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
    WHEN t.tgtype & 20 = 20 THEN 'INSERT, UPDATE'
    ELSE 'UNKNOWN'
  END as evento,
  pg_get_triggerdef(t.oid) as definicion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND c.relname = 'leads'
ORDER BY t.tgname;

-- =========================================================================
-- 4. VERIFICAR FUNCIONES QUE SE EJECUTAN EN TRIGGERS
-- =========================================================================
SELECT DISTINCT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_trigger t ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'leads'
  AND NOT t.tgisinternal;

-- =========================================================================
-- 5. VERIFICAR CONSTRAINTS QUE PUEDAN BLOQUEAR
-- =========================================================================
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.leads'::regclass
ORDER BY conname;

-- =========================================================================
-- 6. VERIFICAR ÍNDICES QUE PUEDAN CAUSAR PROBLEMAS
-- =========================================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'leads';

-- =========================================================================
-- 7. VERIFICAR RLS Y POLÍTICAS
-- =========================================================================
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'leads';

SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'leads'
ORDER BY policyname;

-- =========================================================================
-- 8. PROBAR LA FUNCIÓN DIRECTAMENTE (TEST)
-- =========================================================================
-- Descomenta esto para probar la función directamente:
/*
SELECT * FROM create_lead_simple(
  'Test Cliente',
  '5512345678',
  'Descripción de prueba',
  'electricidad',
  19.4326,
  -99.1332,
  'CDMX',
  'd7253e26-4a3c-4184-809c-7a357887a1ee'::uuid,
  'Nuevo',
  NULL,
  NULL
);
*/

-- =========================================================================
-- 9. VERIFICAR SI HAY LOCKS EN LA TABLA
-- =========================================================================
SELECT 
  l.locktype,
  l.relation::regclass,
  l.mode,
  l.granted,
  a.pid,
  a.usename,
  a.application_name,
  a.state,
  a.query_start,
  now() - a.query_start as query_duration
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.relation = 'public.leads'::regclass
  AND NOT l.granted;

-- =========================================================================
-- 10. VERIFICAR CONEXIONES ACTIVAS Y QUERIES LENTAS
-- =========================================================================
SELECT 
  pid,
  usename,
  application_name,
  state,
  query_start,
  now() - query_start as query_duration,
  left(query, 100) as query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND state != 'idle'
  AND query_start IS NOT NULL
  AND now() - query_start > interval '1 second'
ORDER BY query_start;

