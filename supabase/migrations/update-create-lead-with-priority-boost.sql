-- =========================================================================
-- ACTUALIZACIÓN: Modificar función RPC create_lead para soportar priority_boost
-- =========================================================================
-- Esta actualización permite que la función acepte priority_boost y lo establezca
-- automáticamente basado en el plan del usuario (pro_annual)
-- =========================================================================

-- PASO 1: Actualizar la función RPC create_lead para incluir priority_boost
CREATE OR REPLACE FUNCTION public.create_lead(
  nombre_cliente_in TEXT,
  whatsapp_in TEXT,
  descripcion_proyecto_in TEXT,
  servicio_in TEXT,
  ubicacion_lat_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_lng_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_direccion_in TEXT DEFAULT NULL,
  disciplina_ia_in TEXT DEFAULT NULL,
  urgencia_ia_in INTEGER DEFAULT NULL,
  diagnostico_ia_in TEXT DEFAULT NULL,
  imagen_url_in TEXT DEFAULT NULL,
  photos_urls_in TEXT[] DEFAULT NULL,
  priority_boost_in BOOLEAN DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  new_lead_id UUID;
  user_plan TEXT;
  final_priority_boost BOOLEAN;
BEGIN
  -- Obtener el user_id actual (puede ser NULL para usuarios anónimos)
  current_user_id := auth.uid();
  
  -- Determinar priority_boost:
  -- 1. Si se pasa explícitamente priority_boost_in, usarlo
  -- 2. Si no, verificar el plan del usuario desde la tabla profiles
  -- 3. Si el usuario tiene plan 'pro_annual', establecer priority_boost = TRUE
  IF priority_boost_in IS NOT NULL THEN
    final_priority_boost := priority_boost_in;
  ELSIF current_user_id IS NOT NULL THEN
    -- Obtener el plan del usuario
    SELECT plan INTO user_plan
    FROM public.profiles
    WHERE user_id = current_user_id
    LIMIT 1;
    
    -- Si el usuario tiene plan pro_annual, establecer priority_boost = TRUE
    final_priority_boost := COALESCE(user_plan = 'pro_annual', FALSE);
  ELSE
    -- Usuario anónimo o sin plan, priority_boost = FALSE
    final_priority_boost := FALSE;
  END IF;
  
  -- Insertar el lead en la base de datos
  INSERT INTO public.leads (
    nombre_cliente,
    whatsapp,
    descripcion_proyecto,
    servicio,
    ubicacion_lat,
    ubicacion_lng,
    ubicacion_direccion,
    cliente_id,
    disciplina_ia,
    urgencia_ia,
    diagnostico_ia,
    imagen_url,
    photos_urls,
    priority_boost,
    estado,
    profesional_asignado_id
  )
  VALUES (
    nombre_cliente_in,
    whatsapp_in,
    descripcion_proyecto_in,
    servicio_in,
    COALESCE(ubicacion_lat_in, 19.4326), -- CDMX por defecto
    COALESCE(ubicacion_lng_in, -99.1332), -- CDMX por defecto
    ubicacion_direccion_in,
    current_user_id, -- NULL si es usuario anónimo, UUID si está autenticado
    disciplina_ia_in,
    urgencia_ia_in,
    diagnostico_ia_in,
    imagen_url_in,
    photos_urls_in,
    final_priority_boost, -- Usar el valor calculado
    'nuevo',
    NULL -- Sin profesional asignado inicialmente
  )
  RETURNING id INTO new_lead_id;
  
  -- Retornar el ID del lead creado
  RETURN new_lead_id;
END;
$$;

-- PASO 2: Mantener permisos de ejecución
GRANT EXECUTE ON FUNCTION public.create_lead TO anon, authenticated;

-- PASO 3: Actualizar comentario descriptivo
COMMENT ON FUNCTION public.create_lead IS 
'Función RPC para crear leads. Permite a usuarios anónimos y autenticados crear leads 
resolviendo el problema de permisos de FOREIGN KEY mediante SECURITY DEFINER.
Ahora soporta priority_boost que se establece automáticamente si el usuario tiene plan pro_annual.';

-- PASO 4: Verificar que la función fue actualizada
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';

