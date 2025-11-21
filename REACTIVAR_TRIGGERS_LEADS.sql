-- =========================================================================
-- REACTIVAR TRIGGERS EN LA TABLA LEADS
-- =========================================================================
-- Este script reactiva todos los triggers que fueron desactivados
-- =========================================================================

-- 1. Verificar estado actual de los triggers
SELECT 
  t.tgname AS trigger_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ HABILITADO'
    WHEN 'D' THEN '❌ DESHABILITADO'
    WHEN 'R' THEN '⚠️ REPLICA'
    WHEN 'A' THEN '⚠️ ALWAYS'
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

-- 2. REACTIVAR TODOS los triggers en la tabla 'leads'
ALTER TABLE public.leads ENABLE TRIGGER ALL;

-- 3. Verificar que se reactivaron correctamente
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
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- =========================================================================
-- NOTA: Si quieres reactivar solo triggers específicos, usa:
-- ALTER TABLE public.leads ENABLE TRIGGER nombre_del_trigger;
-- =========================================================================


