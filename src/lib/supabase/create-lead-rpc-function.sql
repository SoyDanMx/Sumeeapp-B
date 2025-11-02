-- =========================================================================
-- FUNCIÓN RPC PARA CREAR LEADS (SOLUCIÓN ARQUITECTÓNICA ROBUSTA)
-- =========================================================================
-- Esta función resuelve el problema de RLS al usar SECURITY DEFINER
-- que permite validar FOREIGN KEY sin problemas de permisos

-- Paso 1: Eliminar TODAS las políticas de INSERT de la tabla leads
-- Ya no las necesitamos porque el frontend usará esta función RPC
DROP POLICY IF EXISTS "Public users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

-- Paso 2: Crear la función RPC create_lead
CREATE OR REPLACE FUNCTION public.create_lead(
  nombre_cliente_in TEXT,
  whatsapp_in TEXT,
  descripcion_proyecto_in TEXT,
  servicio_in TEXT,
  ubicacion_lat_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_lng_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_direccion_in TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER  -- CRÍTICO: Ejecuta con permisos de superusuario
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  new_lead_id UUID;
BEGIN
  -- Obtener el user_id actual (puede ser NULL para usuarios anónimos)
  current_user_id := auth.uid();
  
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
    'nuevo',
    NULL -- Sin profesional asignado inicialmente
  )
  RETURNING id INTO new_lead_id;
  
  -- Retornar el ID del lead creado
  RETURN new_lead_id;
END;
$$;

-- Paso 3: Crear política RLS para permitir que el rol public ejecute la función
-- Las funciones con SECURITY DEFINER necesitan esta política
GRANT EXECUTE ON FUNCTION public.create_lead TO anon, authenticated;

-- Paso 4: Comentario descriptivo
COMMENT ON FUNCTION public.create_lead IS 
'Función RPC para crear leads. Permite a usuarios anónimos y autenticados crear leads 
resolviendo el problema de permisos de FOREIGN KEY mediante SECURITY DEFINER.';

-- Paso 5: Verificar que la función fue creada
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';

