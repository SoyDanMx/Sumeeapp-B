-- =========================================================================
-- SCRIPT SQL ALTERNATIVO - Sin necesidad de configurar variables de BD
-- =========================================================================
-- Esta versión hardcodea los valores directamente en la función
-- No requiere permisos especiales de ALTER DATABASE

-- =========================================================================
-- PASO 1: HABILITAR EXTENSIÓN pg_net
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verificar que se creó:
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- =========================================================================
-- PASO 2: CREAR FUNCIÓN QUE LLAMA A LA EDGE FUNCTION
-- =========================================================================
-- ⚠️ IMPORTANTE: Los valores están hardcodeados en la función
-- PROJECT_REF: jkdvrwmanmwoyyoixmnt
-- SERVICE_ROLE_KEY: (ya configurado)

CREATE OR REPLACE FUNCTION notify_professionals_on_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT := 'https://jkdvrwmanmwoyyoixmnt.supabase.co';
  supabase_service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHZyd21hbm13b3l5b2l4bW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Mjk4NCwiZXhwIjoyMDY4MTI4OTg0fQ.8P4dlVWyD6-Cb0ynf5A0UvuGWCJ47B9-dsNuH656OPU';
  function_url TEXT;
  payload JSONB;
  job_id BIGINT;
BEGIN
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
-- PASO 3: CREAR EL TRIGGER
-- =========================================================================
DROP TRIGGER IF EXISTS trigger_notify_pros_on_new_lead ON public.leads;

CREATE TRIGGER trigger_notify_pros_on_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  WHEN (NEW.estado = 'nuevo' OR NEW.estado IS NULL)
  EXECUTE FUNCTION notify_professionals_on_new_lead();

-- =========================================================================
-- PASO 4: AGREGAR COMENTARIOS DESCRIPTIVOS
-- =========================================================================
COMMENT ON FUNCTION notify_professionals_on_new_lead() IS 
'Función que se ejecuta después de insertar un nuevo lead. Llama a la Edge Function notify-pros para enviar emails a profesionales relevantes.';

COMMENT ON TRIGGER trigger_notify_pros_on_new_lead ON public.leads IS 
'Trigger que activa la notificación por email a profesionales cuando se crea un nuevo lead.';

-- =========================================================================
-- PASO 5: VERIFICAR INSTALACIÓN
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
-- Esta versión no requiere permisos especiales de ALTER DATABASE
-- Los valores están hardcodeados directamente en la función

