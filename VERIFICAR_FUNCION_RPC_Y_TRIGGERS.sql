-- =========================================================================
-- VERIFICAR FUNCIÓN RPC Y TRIGGERS QUE PUEDEN ESTAR BLOQUEANDO
-- =========================================================================

-- 1. Verificar que la función existe y tiene los permisos correctos
SELECT 
  routine_name,
  routine_type,
  security_type,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead_simple';

-- 2. Verificar permisos de ejecución
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead_simple';

-- 3. Verificar triggers en la tabla leads
SELECT 
  t.tgname AS trigger_name,
  t.tgenabled AS enabled,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ ORIGINAL (habilitado)'
    WHEN 'D' THEN '❌ DISABLED (deshabilitado)'
    WHEN 'R' THEN '⚠️ REPLICA (solo réplicas)'
    WHEN 'A' THEN '⚠️ ALWAYS (siempre)'
    ELSE '❓ DESCONOCIDO'
  END AS estado,
  pg_get_triggerdef(t.oid) AS definicion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'leads'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 4. Verificar si hay locks activos en la tabla leads
SELECT 
  l.locktype,
  l.database,
  l.relation::regclass AS table_name,
  l.mode,
  l.granted,
  a.pid,
  a.usename,
  a.query,
  a.query_start,
  now() - a.query_start AS query_duration
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.relation::regclass::text = 'public.leads'
  AND a.state != 'idle'
ORDER BY a.query_start;

-- 5. Verificar constraints que podrían estar bloqueando
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.leads'::regclass
ORDER BY conname;

-- 6. Probar la función directamente con un usuario autenticado
-- User ID: f03f1982-5004-4268-a4b4-a52649f8ec15
SELECT public.create_lead_simple(
  'Test Cliente',
  '551234567890',
  'Test descripción',
  'electricidad',
  19.4326,
  -99.1332,
  'Test ubicación',
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::UUID,
  'Nuevo',
  NULL,
  NULL
);

