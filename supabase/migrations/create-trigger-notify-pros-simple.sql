-- =========================================================================
-- MIGRACIÓN ALTERNATIVA: Trigger simplificado (sin pg_net)
-- =========================================================================
-- Esta versión usa una función que puede ser llamada manualmente o desde
-- un webhook externo. Más simple pero requiere configuración adicional.

-- PASO 1: Crear función que prepara los datos para notificación
CREATE OR REPLACE FUNCTION prepare_lead_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta función solo prepara los datos
  -- La llamada real a la Edge Function se hace desde el cliente o un webhook
  
  -- Insertar en una tabla de notificaciones pendientes (opcional)
  -- O simplemente retornar NEW para que el trigger continúe
  
  -- Log para debugging
  RAISE NOTICE 'Lead creado: ID=%, Disciplina=%, Ubicación=(%, %)', 
    NEW.id, 
    COALESCE(NEW.disciplina_ia, NEW.servicio_solicitado, 'General'),
    NEW.ubicacion_lat,
    NEW.ubicacion_lng;
  
  RETURN NEW;
END;
$$;

-- PASO 2: Crear trigger
DROP TRIGGER IF EXISTS trigger_prepare_lead_notification ON public.leads;

CREATE TRIGGER trigger_prepare_lead_notification
  AFTER INSERT ON public.leads
  FOR EACH ROW
  WHEN (NEW.estado = 'nuevo' OR NEW.estado IS NULL)
  EXECUTE FUNCTION prepare_lead_notification();

-- PASO 3: Crear función RPC que puede ser llamada desde el cliente
-- para notificar profesionales (alternativa al trigger)
CREATE OR REPLACE FUNCTION notify_professionals_manual(lead_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_record RECORD;
  result JSONB;
BEGIN
  -- Obtener el lead
  SELECT * INTO lead_record
  FROM public.leads
  WHERE id = lead_id_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead no encontrado');
  END IF;
  
  -- Retornar datos del lead para que el cliente llame a la Edge Function
  result := jsonb_build_object(
    'success', true,
    'lead', jsonb_build_object(
      'id', lead_record.id,
      'disciplina_ia', lead_record.disciplina_ia,
      'servicio', lead_record.servicio,
      'servicio_solicitado', lead_record.servicio_solicitado,
      'ubicacion_lat', lead_record.ubicacion_lat,
      'ubicacion_lng', lead_record.ubicacion_lng,
      'ubicacion_direccion', lead_record.ubicacion_direccion,
      'nombre_cliente', lead_record.nombre_cliente,
      'descripcion_proyecto', lead_record.descripcion_proyecto,
      'priority_boost', COALESCE(lead_record.priority_boost, false)
    )
  );
  
  RETURN result;
END;
$$;

-- PASO 4: Otorgar permisos
GRANT EXECUTE ON FUNCTION notify_professionals_manual(UUID) TO authenticated, anon;

-- PASO 5: Comentarios
COMMENT ON FUNCTION prepare_lead_notification() IS 
'Función de trigger que prepara datos para notificación. Versión simplificada.';

COMMENT ON FUNCTION notify_professionals_manual(UUID) IS 
'Función RPC que puede ser llamada manualmente para obtener datos del lead y notificar profesionales.';

