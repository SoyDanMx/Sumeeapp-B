-- =========================================================================
-- SCRIPT: Deshabilitar Triggers Temporalmente para INSERT Rápido
-- =========================================================================
-- Este script deshabilita los triggers que están bloqueando el INSERT
-- Los triggers llaman a Edge Functions de forma síncrona, causando timeouts
-- =========================================================================

BEGIN;

-- Deshabilitar trigger de notificaciones
ALTER TABLE public.leads DISABLE TRIGGER trigger_notify_pros_on_new_lead;

-- Deshabilitar trigger de preparación de notificaciones (si existe)
ALTER TABLE public.leads DISABLE TRIGGER IF EXISTS trigger_prepare_lead_notification;

-- Verificar triggers deshabilitados
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  CASE 
    WHEN tgisinternal THEN 'INTERNO'
    ELSE 'EXTERNO'
  END as tipo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'leads'
  AND t.tgname LIKE '%notify%' OR t.tgname LIKE '%lead%';

COMMIT;

-- =========================================================================
-- NOTA: Para REHABILITAR los triggers después de probar:
-- =========================================================================
-- ALTER TABLE public.leads ENABLE TRIGGER trigger_notify_pros_on_new_lead;
-- ALTER TABLE public.leads ENABLE TRIGGER trigger_prepare_lead_notification;
-- =========================================================================


