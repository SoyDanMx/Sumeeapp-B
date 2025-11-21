DROP FUNCTION IF EXISTS public.create_lead_simple(TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, UUID, TEXT, TEXT, TEXT[]);

CREATE FUNCTION public.create_lead_simple(
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
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_lead_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF cliente_id_in IS NULL THEN
    cliente_id_in := current_user_id;
  END IF;
  
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
  
  RETURN new_lead_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_lead_simple TO anon, authenticated;


