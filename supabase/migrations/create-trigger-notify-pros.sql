-- =========================================================================
-- MIGRACIÓN: Trigger para notificar profesionales por email
-- =========================================================================
-- Este trigger se activa después de insertar un nuevo lead y llama
-- a la Edge Function notify-pros para enviar emails a profesionales relevantes

-- PASO 1: Habilitar extensión pg_net si no está habilitada (más confiable que http)
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- PASO 2: Crear función que llama a la Edge Function usando pg_net
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
  -- Obtener configuración de Supabase desde variables de entorno
  -- Estas deben configurarse en Supabase Dashboard > Settings > Database > Custom Config
  supabase_url := current_setting('app.settings.supabase_url', true);
  supabase_service_key := current_setting('app.settings.supabase_service_key', true);
  
  -- Si no están configuradas, intentar obtenerlas de otras fuentes
  IF supabase_url IS NULL OR supabase_url = '' THEN
    -- Intentar obtener de la configuración de Supabase
    SELECT current_setting('app.settings.project_ref', true) INTO supabase_url;
    IF supabase_url IS NOT NULL AND supabase_url != '' THEN
      supabase_url := 'https://' || supabase_url || '.supabase.co';
    ELSE
      -- Fallback: usar el dominio por defecto (debe configurarse manualmente)
      supabase_url := 'https://YOUR_PROJECT_REF.supabase.co';
      RAISE WARNING 'Supabase URL no configurada. Usando valor por defecto. Configura app.settings.supabase_url';
    END IF;
  END IF;
  
  IF supabase_service_key IS NULL OR supabase_service_key = '' THEN
    RAISE WARNING 'Supabase Service Key no configurada. Configura app.settings.supabase_service_key';
    -- Continuar sin enviar email, pero no fallar la inserción
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
  
  -- Llamar a la Edge Function usando pg_net (más confiable)
  BEGIN
    -- Usar pg_net para hacer la llamada HTTP asíncrona
    SELECT net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_service_key
      ),
      body := payload::text
    ) INTO job_id;
    
    -- Log del job ID (opcional, para debugging)
    RAISE NOTICE 'Edge Function notify-pros llamada. Job ID: %', job_id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Si falla la llamada, solo loguear el error pero no fallar la inserción del lead
    RAISE WARNING 'Error llamando a Edge Function notify-pros: %. El lead se creó correctamente pero no se enviaron emails.', SQLERRM;
    -- Continuar sin fallar
  END;
  
  RETURN NEW;
END;
$$;

-- PASO 2: Crear el trigger que se activa después de INSERT
DROP TRIGGER IF EXISTS trigger_notify_pros_on_new_lead ON public.leads;

CREATE TRIGGER trigger_notify_pros_on_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  WHEN (NEW.estado = 'nuevo' OR NEW.estado IS NULL)
  EXECUTE FUNCTION notify_professionals_on_new_lead();

-- PASO 3: Comentarios descriptivos
COMMENT ON FUNCTION notify_professionals_on_new_lead() IS 
'Función que se ejecuta después de insertar un nuevo lead. Llama a la Edge Function notify-pros para enviar emails a profesionales relevantes.';

COMMENT ON TRIGGER trigger_notify_pros_on_new_lead ON public.leads IS 
'Trigger que activa la notificación por email a profesionales cuando se crea un nuevo lead.';

-- PASO 4: Verificar que el trigger fue creado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_pros_on_new_lead';

