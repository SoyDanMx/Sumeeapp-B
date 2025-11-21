-- =========================================================================
-- SCRIPT: Verificar y Deshabilitar Triggers que Bloquean INSERT
-- =========================================================================
-- Los triggers que llaman a Edge Functions de forma síncrona están bloqueando
-- el INSERT en la tabla leads, causando timeouts de más de 15 segundos
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASO 1: Verificar triggers existentes en la tabla leads
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
    ELSE 'UNKNOWN'
  END as event_manipulation,
  CASE 
    WHEN t.tgisinternal THEN 'INTERNO (PostgreSQL)'
    ELSE 'EXTERNO (Usuario)'
  END as tipo_trigger,
  CASE 
    WHEN t.tgenabled = 'O' THEN '✅ HABILITADO'
    WHEN t.tgenabled = 'D' THEN '❌ DESHABILITADO'
    ELSE '⚠️ DESCONOCIDO'
  END as estado
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND c.relname = 'leads'
ORDER BY t.tgname;

-- =========================================================================
-- PASO 2: Verificar funciones que pueden estar siendo llamadas por triggers
-- =========================================================================
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%notify%' 
    OR routine_name LIKE '%lead%'
    OR routine_name LIKE '%trigger%'
  )
ORDER BY routine_name;

-- =========================================================================
-- PASO 3: Deshabilitar triggers que llaman a Edge Functions
-- =========================================================================
-- Estos triggers están bloqueando el INSERT porque hacen llamadas HTTP síncronas

-- Deshabilitar trigger de notificaciones (si existe)
ALTER TABLE public.leads DISABLE TRIGGER IF EXISTS trigger_notify_pros_on_new_lead;

-- Deshabilitar trigger de preparación de notificaciones (si existe)
ALTER TABLE public.leads DISABLE TRIGGER IF EXISTS trigger_prepare_lead_notification;

-- Deshabilitar cualquier otro trigger relacionado con notificaciones
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  FOR trigger_rec IN 
    SELECT trigger_name 
    FROM information_schema.triggers
    WHERE event_object_table = 'leads'
      AND event_object_schema = 'public'
      AND (trigger_name LIKE '%notify%' OR trigger_name LIKE '%notification%')
  LOOP
    EXECUTE format('ALTER TABLE public.leads DISABLE TRIGGER %I', trigger_rec.trigger_name);
    RAISE NOTICE 'Trigger deshabilitado: %', trigger_rec.trigger_name;
  END LOOP;
END $$;

-- =========================================================================
-- PASO 4: Verificar triggers deshabilitados
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
    ELSE 'UNKNOWN'
  END as event_manipulation,
  CASE 
    WHEN t.tgenabled = 'O' THEN '✅ HABILITADO'
    WHEN t.tgenabled = 'D' THEN '❌ DESHABILITADO'
    WHEN t.tgenabled = 'R' THEN '⚠️ REPLICA'
    WHEN t.tgenabled = 'A' THEN '⚠️ ALWAYS'
    ELSE '⚠️ DESCONOCIDO'
  END as estado
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND c.relname = 'leads'
ORDER BY t.tgname;

COMMIT;

-- =========================================================================
-- NOTA IMPORTANTE:
-- =========================================================================
-- Después de deshabilitar los triggers, el INSERT debería ser mucho más rápido.
-- Sin embargo, las notificaciones a profesionales NO se enviarán automáticamente.
-- 
-- OPCIONES:
-- 1. Mantener los triggers deshabilitados y enviar notificaciones manualmente después
-- 2. Hacer que los triggers sean asíncronos (usar pg_net de forma no bloqueante)
-- 3. Usar un sistema de cola (como pg_cron o un servicio externo)
-- =========================================================================

