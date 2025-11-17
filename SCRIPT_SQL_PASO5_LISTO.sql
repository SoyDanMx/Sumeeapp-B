-- =========================================================================
-- SCRIPT SQL - PASO 5: CONFIGURAR TRIGGER Y FUNCIÓN
-- =========================================================================
-- INSTRUCCIONES:
-- 1. ANTES DE EJECUTAR: Reemplaza los valores marcados con ⚠️
-- 2. Copia TODO este script
-- 3. Pégalo en Supabase SQL Editor
-- 4. Ejecuta (Run o Ctrl+Enter)

-- =========================================================================
-- PASO 1: HABILITAR EXTENSIÓN pg_net
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verificar que se creó:
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- =========================================================================
-- PASO 2: CONFIGURAR VARIABLES DE ENTORNO
-- =========================================================================
-- ⚠️ REEMPLAZA ESTOS VALORES ANTES DE EJECUTAR:

-- 1. PROJECT_REF extraído de NEXT_PUBLIC_SUPABASE_URL
--    URL: https://jkdvrwmanmwoyyoixmnt.supabase.co
--    PROJECT_REF: jkdvrwmanmwoyyoixmnt
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://jkdvrwmanmwoyyoixmnt.supabase.co';

-- 2. SERVICE_ROLE_KEY copiado de SUPABASE_SERVICE_ROLE_KEY
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHZyd21hbm13b3l5b2l4bW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Mjk4NCwiZXhwIjoyMDY4MTI4OTg0fQ.8P4dlVWyD6-Cb0ynf5A0UvuGWCJ47B9-dsNuH656OPU';

-- Verificar configuración:
SELECT 
  current_setting('app.settings.supabase_url', true) as supabase_url,
  CASE 
    WHEN current_setting('app.settings.supabase_service_key', true) IS NOT NULL 
    THEN '✅ Configurada (oculta)' 
    ELSE '❌ No configurada' 
  END as service_key_status;

-- =========================================================================
-- PASO 3: CREAR FUNCIÓN QUE LLAMA A LA EDGE FUNCTION
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

-- =========================================================================
-- PASO 4: CREAR EL TRIGGER
-- =========================================================================
DROP TRIGGER IF EXISTS trigger_notify_pros_on_new_lead ON public.leads;

CREATE TRIGGER trigger_notify_pros_on_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  WHEN (NEW.estado = 'nuevo' OR NEW.estado IS NULL)
  EXECUTE FUNCTION notify_professionals_on_new_lead();

-- =========================================================================
-- PASO 5: AGREGAR COMENTARIOS DESCRIPTIVOS
-- =========================================================================
COMMENT ON FUNCTION notify_professionals_on_new_lead() IS 
'Función que se ejecuta después de insertar un nuevo lead. Llama a la Edge Function notify-pros para enviar emails a profesionales relevantes.';

COMMENT ON TRIGGER trigger_notify_pros_on_new_lead ON public.leads IS 
'Trigger que activa la notificación por email a profesionales cuando se crea un nuevo lead.';

-- =========================================================================
-- PASO 6: VERIFICAR INSTALACIÓN
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

-- =========================================================================
-- ✅ FIN DEL SCRIPT
-- =========================================================================
-- Si ves los resultados de las consultas de verificación, todo está correcto.
-- El trigger se activará automáticamente cuando se cree un nuevo lead.

