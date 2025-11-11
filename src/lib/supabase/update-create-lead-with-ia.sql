-- =====================================================
-- ACTUALIZACIÓN SEGURA: create_lead con campos de IA
-- Elimina versión anterior y crea nueva con disciplina_ia, urgencia_ia, diagnostico_ia
-- =====================================================

-- PASO 1: Eliminar todas las versiones existentes de create_lead
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[]);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL);

-- PASO 2: Crear nueva versión con campos de IA
CREATE OR REPLACE FUNCTION public.create_lead(
  nombre_cliente_in TEXT,
  whatsapp_in TEXT,
  descripcion_proyecto_in TEXT,
  ubicacion_lat_in DECIMAL,
  ubicacion_lng_in DECIMAL,
  servicio_in TEXT DEFAULT NULL,
  urgencia_in TEXT DEFAULT NULL,
  ubicacion_direccion_in TEXT DEFAULT NULL,
  imagen_url_in TEXT DEFAULT NULL,
  photos_urls_in TEXT[] DEFAULT NULL,
  disciplina_ia_in TEXT DEFAULT NULL,
  urgencia_ia_in TEXT DEFAULT NULL,
  diagnostico_ia_in TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id UUID;
  v_lead_id UUID;
BEGIN
  -- Log de inicio (opcional, útil para debugging)
  RAISE NOTICE 'create_lead: Iniciando con cliente: %, servicio: %, disciplina_ia: %', 
    nombre_cliente_in, servicio_in, disciplina_ia_in;

  -- Obtener el ID del usuario autenticado
  v_cliente_id := auth.uid();
  
  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuario autenticado. Debes estar logueado para crear un lead.';
  END IF;

  -- Insertar el nuevo lead
  INSERT INTO public.leads (
    nombre_cliente,
    whatsapp,
    descripcion_proyecto,
    ubicacion_lat,
    ubicacion_lng,
    servicio_solicitado,
    urgencia,
    ubicacion_direccion,
    imagen_url,
    photos_urls,
    disciplina_ia,
    urgencia_ia,
    diagnostico_ia,
    cliente_id,
    estado,
    fecha_creacion
  ) VALUES (
    nombre_cliente_in,
    whatsapp_in,
    descripcion_proyecto_in,
    ubicacion_lat_in,
    ubicacion_lng_in,
    servicio_in,
    urgencia_in,
    ubicacion_direccion_in,
    imagen_url_in,
    photos_urls_in,
    disciplina_ia_in,
    urgencia_ia_in,
    diagnostico_ia_in,
    v_cliente_id,
    'nuevo',
    NOW()
  )
  RETURNING id INTO v_lead_id;

  -- Log de éxito
  RAISE NOTICE 'create_lead: Lead creado exitosamente con ID: %', v_lead_id;

  RETURN v_lead_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Log de error detallado
    RAISE WARNING 'create_lead: Error al crear lead - SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
    RAISE;
END;
$$;

-- PASO 3: Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) TO service_role;

-- PASO 4: Verificar que se creó correctamente
DO $$
DECLARE
  v_function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name = 'create_lead';
  
  IF v_function_count = 1 THEN
    RAISE NOTICE '✅ Función create_lead actualizada exitosamente (1 versión única)';
  ELSE
    RAISE WARNING '⚠️ Se encontraron % versiones de create_lead. Verifica manualmente.', v_function_count;
  END IF;
END $$;

-- PASO 5: Mostrar la firma de la función actualizada
SELECT 
  routine_name as nombre,
  pg_get_function_arguments(p.oid) as argumentos,
  pg_get_function_result(p.oid) as retorno
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';

