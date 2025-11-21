-- =========================================================================
-- FUNCIÓN RPC SIMPLE PARA CREAR LEADS (EVITA RLS Y TRIGGERS)
-- =========================================================================
-- Esta función usa SECURITY DEFINER para evitar problemas de RLS
-- y permite crear leads de forma rápida sin triggers bloqueantes
-- =========================================================================

-- Eliminar la función existente si tiene un tipo de retorno diferente
DROP FUNCTION IF EXISTS public.create_lead_simple(
  TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, UUID, TEXT, TEXT, TEXT[]
);

-- Crear la función RPC
CREATE OR REPLACE FUNCTION public.create_lead_simple(
  nombre_cliente_in TEXT,
  whatsapp_in TEXT,
  descripcion_proyecto_in TEXT,
  servicio_in TEXT,
  ubicacion_lat_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_lng_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_direccion_in TEXT DEFAULT NULL,
  cliente_id_in UUID DEFAULT NULL,
  estado_in TEXT DEFAULT 'Nuevo',
  imagen_url_in TEXT DEFAULT NULL,
  photos_urls_in TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  nombre_cliente TEXT,
  whatsapp TEXT,
  descripcion_proyecto TEXT,
  servicio TEXT,
  ubicacion_lat DOUBLE PRECISION,
  ubicacion_lng DOUBLE PRECISION,
  ubicacion_direccion TEXT,
  cliente_id UUID,
  estado TEXT,
  imagen_url TEXT,
  photos_urls TEXT[],
  fecha_creacion TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_lead_id UUID;
  current_user_id UUID;
BEGIN
  -- Obtener el user_id actual (puede ser NULL para usuarios anónimos)
  current_user_id := auth.uid();
  
  -- Si no se proporciona cliente_id, usar el usuario actual
  IF cliente_id_in IS NULL THEN
    cliente_id_in := current_user_id;
  END IF;
  
  -- Insertar el lead directamente (sin triggers bloqueantes)
  INSERT INTO public.leads (
    nombre_cliente,
    whatsapp,
    descripcion_proyecto,
    servicio,
    ubicacion_lat,
    ubicacion_lng,
    ubicacion_direccion,
    cliente_id,
    estado,
    imagen_url,
    photos_urls
  ) VALUES (
    nombre_cliente_in,
    whatsapp_in,
    descripcion_proyecto_in,
    servicio_in,
    ubicacion_lat_in,
    ubicacion_lng_in,
    ubicacion_direccion_in,
    cliente_id_in,
    estado_in,
    imagen_url_in,
    photos_urls_in
  )
  RETURNING leads.id INTO new_lead_id;
  
  -- Retornar el lead creado
  RETURN QUERY
  SELECT 
    l.id,
    l.nombre_cliente,
    l.whatsapp,
    l.descripcion_proyecto,
    l.servicio,
    l.ubicacion_lat,
    l.ubicacion_lng,
    l.ubicacion_direccion,
    l.cliente_id,
    l.estado,
    l.imagen_url,
    l.photos_urls,
    l.fecha_creacion,
    l.updated_at
  FROM public.leads l
  WHERE l.id = new_lead_id;
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.create_lead_simple TO anon, authenticated;

-- Verificar que la función fue creada
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead_simple';

