-- =========================================================================
-- SCRIPT SQL PERSONALIZADO PARA TU PROYECTO
-- =========================================================================
-- INSTRUCCIONES:
-- 1. Extrae el PROJECT_REF de tu NEXT_PUBLIC_SUPABASE_URL
--    Ejemplo: Si tu URL es https://abcdefghijklmnop.supabase.co
--    Entonces tu PROJECT_REF es: abcdefghijklmnop
-- 2. Copia tu SUPABASE_SERVICE_ROLE_KEY del archivo .env.local
-- 3. Reemplaza los valores en este script
-- 4. Ejecuta en Supabase SQL Editor

-- =========================================================================
-- PASO 1: HABILITAR EXTENSIÓN pg_net
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verificar:
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- =========================================================================
-- PASO 2: CONFIGURAR VARIABLES DE ENTORNO
-- =========================================================================
-- ⚠️ REEMPLAZA ESTOS VALORES:
-- 1. Extrae el PROJECT_REF de tu NEXT_PUBLIC_SUPABASE_URL
--    Si tu URL es: https://abcdefghijklmnop.supabase.co
--    Entonces PROJECT_REF = abcdefghijklmnop
-- 2. Copia tu SUPABASE_SERVICE_ROLE_KEY completo del .env.local

-- Configurar URL de Supabase
-- REEMPLAZA 'abcdefghijklmnop' con tu PROJECT_REF real
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://TU_PROJECT_REF_AQUI.supabase.co';

-- Configurar Service Role Key
-- REEMPLAZA 'TU_SERVICE_ROLE_KEY_AQUI' con tu SUPABASE_SERVICE_ROLE_KEY completo
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'TU_SERVICE_ROLE_KEY_AQUI';

-- Verificar configuración:
SELECT 
  current_setting('app.settings.supabase_url', true) as supabase_url,
  CASE 
    WHEN current_setting('app.settings.supabase_service_key', true) IS NOT NULL 
    THEN '✅ Configurada (oculta)' 
    ELSE '❌ No configurada' 
  END as service_key_status;

-- =========================================================================
-- PASO 3: CREAR FUNCIÓN Y TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION notify_professionals_on_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT;
  supabase_service_key TEXT;
  function_url TEXT;
  payload JSONB;
  job_id BIGINT;
BEGIN
  -- Obtener configuración
  supabase_url := current_setting('app.settings.supabase_url', true);
  supabase_service_key := current_setting('app.settings.supabase_service_key', true);
  
  IF supabase_url IS NULL OR supabase_url = '' THEN
    RAISE WARNING 'Supabase URL no configurada. Configura app.settings.supabase_url';
    RETURN NEW;
  END IF;
  
  IF supabase_service_key IS NULL OR supabase_service_key = '' THEN
    RAISE WARNING 'Supabase Service Key no configurada. Configura app.settings.supabase_service_key';
    RETURN NEW;
  END IF;
  
  -- Construir URL de la Edge Function
  function_url := supabase_url || '/functions/v1/notify-pros';
  
  -- Preparar payload con el nuevo lead
  payload := jsonb_build_object(
    'id', NEW.id,
    'disciplina_ia', NEW.disciplina_ia,
    'servicio', NEW.servicio,
    'servicio_solicitado', NEW.servicio_solicitado,
    'ubicacion_lat', NEW.ubicacion_lat,
    'ubicacion_lng', NEW.ubicacion_lng,
    'ubicacion_direccion', NEW.ubicacion_direccion,
    'nombre_cliente', NEW.nombre_cliente,
    'descripcion_proyecto', NEW.descripcion_proyecto,
    'priority_boost', COALESCE(NEW.priority_boost, false)
  );
  
  -- Llamar a la Edge Function usando pg_net
  BEGIN
    SELECT net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_service_key
      ),
      body := payload::text
    ) INTO job_id;
    
    RAISE NOTICE '✅ Edge Function notify-pros llamada. Job ID: %', job_id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '⚠️ Error llamando a Edge Function notify-pros: %. El lead se creó correctamente pero no se enviaron emails.', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_notify_pros_on_new_lead ON public.leads;

CREATE TRIGGER trigger_notify_pros_on_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  WHEN (NEW.estado = 'nuevo' OR NEW.estado IS NULL)
  EXECUTE FUNCTION notify_professionals_on_new_lead();

-- Comentarios
COMMENT ON FUNCTION notify_professionals_on_new_lead() IS 
'Función que se ejecuta después de insertar un nuevo lead. Llama a la Edge Function notify-pros para enviar emails a profesionales relevantes.';

COMMENT ON TRIGGER trigger_notify_pros_on_new_lead ON public.leads IS 
'Trigger que activa la notificación por email a profesionales cuando se crea un nuevo lead.';

-- =========================================================================
-- PASO 4: VERIFICAR INSTALACIÓN
-- =========================================================================
-- Verificar trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_pros_on_new_lead';

-- Verificar función
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'notify_professionals_on_new_lead';

-- Verificar extensión
SELECT * FROM pg_extension WHERE extname = 'pg_net';

