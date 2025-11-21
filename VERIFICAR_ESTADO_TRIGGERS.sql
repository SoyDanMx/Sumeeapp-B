-- =========================================================================
-- CONSULTA SIMPLE: Verificar estado de triggers en tabla leads
-- =========================================================================
-- Esta consulta muestra directamente el estado de los triggers usando pg_trigger
-- =========================================================================

SELECT 
  t.tgname as trigger_name,
  CASE 
    WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
    WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as action_timing,
  CASE 
    WHEN t.tgtype & 4 = 4 THEN 'INSERT'
    WHEN t.tgtype & 8 = 8 THEN 'DELETE'
    WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
    WHEN t.tgtype & 20 = 20 THEN 'INSERT, UPDATE'
    WHEN t.tgtype & 24 = 24 THEN 'UPDATE, DELETE'
    ELSE 'UNKNOWN'
  END as event_manipulation,
  CASE 
    WHEN t.tgenabled = 'O' THEN '✅ HABILITADO'
    WHEN t.tgenabled = 'D' THEN '❌ DESHABILITADO'
    WHEN t.tgenabled = 'R' THEN '⚠️ REPLICA'
    WHEN t.tgenabled = 'A' THEN '⚠️ ALWAYS'
    ELSE '⚠️ DESCONOCIDO (' || t.tgenabled::text || ')'
  END as estado,
  pg_get_triggerdef(t.oid) as definicion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND c.relname = 'leads'
ORDER BY t.tgname;

-- =========================================================================
-- Si no hay resultados, significa que:
-- 1. No hay triggers en la tabla leads (todos fueron eliminados)
-- 2. O todos los triggers son internos (sistema)
-- =========================================================================

