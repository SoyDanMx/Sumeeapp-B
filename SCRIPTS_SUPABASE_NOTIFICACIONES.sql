-- =========================================================================
-- SCRIPTS PARA EJECUTAR EN SUPABASE SQL EDITOR
-- =========================================================================
-- Copia y pega cada sección en el SQL Editor de Supabase
-- Ejecuta en el orden indicado

-- =========================================================================
-- SCRIPT 1: HABILITAR EXTENSIÓN pg_net (Opcional pero Recomendado)
-- =========================================================================
-- Ejecuta esto primero si quieres usar pg_net para llamadas HTTP asíncronas
-- Si no está disponible, usa el SCRIPT 2 (versión alternativa)

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verificar que se creó correctamente:
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- =========================================================================
-- SCRIPT 2: CONFIGURAR VARIABLES DE ENTORNO (IMPORTANTE)
-- =========================================================================
-- Reemplaza YOUR_PROJECT_REF con tu Project Reference de Supabase
-- Reemplaza YOUR_SERVICE_ROLE_KEY con tu Service Role Key
-- Puedes encontrar estos valores en: Settings > API

-- Configurar URL de Supabase
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';

-- Configurar Service Role Key (NUNCA exponer en frontend)
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'YOUR_SERVICE_ROLE_KEY';

-- Verificar configuración:
SELECT 
  current_setting('app.settings.supabase_url', true) as supabase_url,
  CASE 
    WHEN current_setting('app.settings.supabase_service_key', true) IS NOT NULL 
    THEN 'Configurada (oculta)' 
    ELSE 'No configurada' 
  END as service_key_status;

-- =========================================================================
-- SCRIPT 3: CREAR FUNCIÓN Y TRIGGER (Versión con pg_net)
-- =========================================================================
-- Esta versión usa pg_net para llamadas HTTP asíncronas
-- Si pg_net no está disponible, usa el SCRIPT 4 (versión alternativa)

-- Crear función que llama a la Edge Function
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
  -- Obtener configuración de Supabase
  supabase_url := current_setting('app.settings.supabase_url', true);
  supabase_service_key := current_setting('app.settings.supabase_service_key', true);
  
  -- Validar configuración
  IF supabase_url IS NULL OR supabase_url = '' THEN
    RAISE WARNING 'Supabase URL no configurada. Configura app.settings.supabase_url';
    RETURN NEW; -- Continuar sin fallar
  END IF;
  
  IF supabase_service_key IS NULL OR supabase_service_key = '' THEN
    RAISE WARNING 'Supabase Service Key no configurada. Configura app.settings.supabase_service_key';
    RETURN NEW; -- Continuar sin fallar
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
    
    RAISE NOTICE 'Edge Function notify-pros llamada. Job ID: %', job_id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Si falla, solo loguear pero no fallar la inserción del lead
    RAISE WARNING 'Error llamando a Edge Function notify-pros: %. El lead se creó correctamente pero no se enviaron emails.', SQLERRM;
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

-- Comentarios descriptivos
COMMENT ON FUNCTION notify_professionals_on_new_lead() IS 
'Función que se ejecuta después de insertar un nuevo lead. Llama a la Edge Function notify-pros para enviar emails a profesionales relevantes.';

COMMENT ON TRIGGER trigger_notify_pros_on_new_lead ON public.leads IS 
'Trigger que activa la notificación por email a profesionales cuando se crea un nuevo lead.';

-- =========================================================================
-- SCRIPT 4: VERSIÓN ALTERNATIVA (Sin pg_net - Usar si SCRIPT 3 falla)
-- =========================================================================
-- Esta versión es más simple pero requiere que configures un webhook externo
-- o que llames manualmente a la Edge Function desde el cliente

-- Primero, eliminar el trigger anterior si existe
DROP TRIGGER IF EXISTS trigger_notify_pros_on_new_lead ON public.leads;
DROP FUNCTION IF EXISTS notify_professionals_on_new_lead();

-- Crear función simplificada que solo prepara los datos
CREATE OR REPLACE FUNCTION prepare_lead_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debugging
  RAISE NOTICE 'Lead creado: ID=%, Disciplina=%, Ubicación=(%, %)', 
    NEW.id, 
    COALESCE(NEW.disciplina_ia, NEW.servicio_solicitado, 'General'),
    NEW.ubicacion_lat,
    NEW.ubicacion_lng;
  
  -- Aquí podrías insertar en una tabla de notificaciones pendientes
  -- o usar un webhook externo para llamar a la Edge Function
  
  RETURN NEW;
END;
$$;

-- Crear trigger simplificado
CREATE TRIGGER trigger_prepare_lead_notification
  AFTER INSERT ON public.leads
  FOR EACH ROW
  WHEN (NEW.estado = 'nuevo' OR NEW.estado IS NULL)
  EXECUTE FUNCTION prepare_lead_notification();

-- =========================================================================
-- SCRIPT 5: VERIFICAR INSTALACIÓN
-- =========================================================================
-- Ejecuta esto después de ejecutar los scripts anteriores para verificar

-- Verificar que el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name LIKE '%notify%' OR trigger_name LIKE '%lead%';

-- Verificar que la función existe
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name LIKE '%notify%' OR routine_name LIKE '%lead%';

-- Verificar extensión pg_net (si la usaste)
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- =========================================================================
-- SCRIPT 6: PROBAR EL TRIGGER (Opcional)
-- =========================================================================
-- Crea un lead de prueba para verificar que el trigger funciona
-- Revisa los logs en Supabase Dashboard > Logs > Postgres Logs

-- Insertar lead de prueba
INSERT INTO public.leads (
  nombre_cliente,
  whatsapp,
  descripcion_proyecto,
  servicio,
  ubicacion_lat,
  ubicacion_lng,
  ubicacion_direccion,
  disciplina_ia,
  estado
) VALUES (
  'Cliente Test',
  '5512345678',
  'Prueba de notificación de leads',
  'Electricidad',
  19.4326,
  -99.1332,
  'Ciudad de México, CDMX',
  'Electricidad',
  'nuevo'
);

-- Verificar que el lead se creó
SELECT id, nombre_cliente, disciplina_ia, estado, created_at
FROM public.leads
WHERE nombre_cliente = 'Cliente Test'
ORDER BY created_at DESC
LIMIT 1;

-- =========================================================================
-- SCRIPT 7: CONFIGURAR PERMISOS (Si es necesario)
-- =========================================================================
-- Asegúrate de que los profesionales puedan recibir notificaciones

-- Verificar que la tabla profiles tiene los campos necesarios
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('email', 'profession', 'areas_servicio', 'role', 'ubicacion_lat', 'ubicacion_lng')
ORDER BY column_name;

-- =========================================================================
-- NOTAS IMPORTANTES:
-- =========================================================================
-- 1. Reemplaza YOUR_PROJECT_REF con tu Project Reference de Supabase
-- 2. Reemplaza YOUR_SERVICE_ROLE_KEY con tu Service Role Key
-- 3. Asegúrate de que la Edge Function notify-pros esté desplegada
-- 4. Configura RESEND_API_KEY en Supabase Dashboard > Settings > Edge Functions > Secrets
-- 5. Si usas el SCRIPT 4 (versión alternativa), necesitarás llamar manualmente
--    a la Edge Function desde el cliente cuando se cree un lead

-- =========================================================================
-- TROUBLESHOOTING:
-- =========================================================================
-- Si el trigger no funciona:
-- 1. Verifica que las variables de entorno estén configuradas (SCRIPT 2)
-- 2. Revisa los logs en Supabase Dashboard > Logs > Postgres Logs
-- 3. Verifica que la Edge Function esté desplegada y funcione
-- 4. Si pg_net no está disponible, usa el SCRIPT 4 (versión alternativa)

-- Si los emails no se envían:
-- 1. Verifica que RESEND_API_KEY esté configurada en Edge Functions
-- 2. Revisa los logs de la Edge Function en Supabase Dashboard
-- 3. Verifica que el dominio esté verificado en Resend (opcional)

