-- =========================================================================
-- REACTIVAR TRIGGER trigger_notify_pros_on_new_lead
-- =========================================================================
-- Este script reactiva el trigger después de diagnosticar el problema
-- =========================================================================

-- 1. Verificar estado actual
SELECT 
  t.tgname AS trigger_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ HABILITADO'
    WHEN 'D' THEN '❌ DESHABILITADO'
    WHEN 'R' THEN '⚠️ REPLICA'
    WHEN 'A' THEN '⚠️ ALWAYS'
    ELSE '❓ DESCONOCIDO'
  END AS estado_antes
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'leads'
  AND t.tgname = 'trigger_notify_pros_on_new_lead'
  AND NOT t.tgisinternal;

-- 2. REACTIVAR el trigger
ALTER TABLE public.leads ENABLE TRIGGER trigger_notify_pros_on_new_lead;

-- 3. Verificar que se reactivó correctamente
SELECT 
  t.tgname AS trigger_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ HABILITADO'
    WHEN 'D' THEN '❌ DESHABILITADO'
    WHEN 'R' THEN '⚠️ REPLICA'
    WHEN 'A' THEN '⚠️ ALWAYS'
    ELSE '❓ DESCONOCIDO'
  END AS estado_despues
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'leads'
  AND t.tgname = 'trigger_notify_pros_on_new_lead'
  AND NOT t.tgisinternal;



