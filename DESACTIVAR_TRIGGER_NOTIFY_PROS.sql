-- =========================================================================
-- DESACTIVAR TRIGGER trigger_notify_pros_on_new_lead
-- =========================================================================
-- Este trigger intenta notificar a profesionales cuando se crea un lead
-- Si la notificación (email, push, WhatsApp) tarda o falla, bloquea el INSERT
-- =========================================================================

-- 1. Verificar estado actual del trigger
SELECT 
  t.tgname AS trigger_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ HABILITADO'
    WHEN 'D' THEN '❌ DESHABILITADO'
    WHEN 'R' THEN '⚠️ REPLICA'
    WHEN 'A' THEN '⚠️ ALWAYS'
    ELSE '❓ DESCONOCIDO'
  END AS estado_antes,
  pg_get_triggerdef(t.oid) AS definicion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'leads'
  AND t.tgname = 'trigger_notify_pros_on_new_lead'
  AND NOT t.tgisinternal;

-- 2. DESACTIVAR el trigger sospechoso
ALTER TABLE public.leads DISABLE TRIGGER trigger_notify_pros_on_new_lead;

-- 3. Verificar que se desactivó correctamente
SELECT 
  t.tgname AS trigger_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ HABILITADO'
    WHEN 'D' THEN '❌ DESHABILITADO'
    WHEN 'R' THEN '⚠️ REPLICA'
    WHEN 'A' THEN '⚠️ ALWAYS'
    ELSE '❓ DESCONOCIDO'
  END AS estado_despues,
  pg_get_triggerdef(t.oid) AS definicion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'leads'
  AND t.tgname = 'trigger_notify_pros_on_new_lead'
  AND NOT t.tgisinternal;

-- =========================================================================
-- NOTA: Este trigger se puede reactivar después con:
-- ALTER TABLE public.leads ENABLE TRIGGER trigger_notify_pros_on_new_lead;
-- =========================================================================



