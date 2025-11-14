-- =====================================================
-- CORRECCIÓN: create_lead sin columnas imagen_url/photos_urls
-- Verificar si existen y agregarlas si no, o eliminarlas del INSERT
-- =====================================================

-- PASO 1: Verificar si las columnas existen
DO $$
DECLARE
  imagen_url_exists BOOLEAN;
  photos_urls_exists BOOLEAN;
BEGIN
  -- Verificar imagen_url
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'imagen_url'
  ) INTO imagen_url_exists;
  
  -- Verificar photos_urls
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'photos_urls'
  ) INTO photos_urls_exists;
  
  -- Agregar imagen_url si no existe
  IF NOT imagen_url_exists THEN
    ALTER TABLE public.leads
    ADD COLUMN imagen_url TEXT;
    RAISE NOTICE '✅ Columna imagen_url agregada';
  ELSE
    RAISE NOTICE 'ℹ️ Columna imagen_url ya existe';
  END IF;
  
  -- Agregar photos_urls si no existe
  IF NOT photos_urls_exists THEN
    ALTER TABLE public.leads
    ADD COLUMN photos_urls TEXT[];
    RAISE NOTICE '✅ Columna photos_urls agregada';
  ELSE
    RAISE NOTICE 'ℹ️ Columna photos_urls ya existe';
  END IF;
END $$;

-- PASO 2: Eliminar todas las versiones existentes de create_lead
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[]);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT);
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION);

-- PASO 3: Crear nueva versión con columnas imagen_url y photos_urls (ahora que existen)
CREATE OR REPLACE FUNCTION public.create_lead(
  nombre_cliente_in TEXT,
  whatsapp_in TEXT,
  descripcion_proyecto_in TEXT,
  ubicacion_lat_in DECIMAL,
  ubicacion_lng_in DECIMAL,
  servicio_in TEXT DEFAULT NULL,
  urgencia_in TEXT DEFAULT NULL, -- Mantener para compatibilidad pero no usar en INSERT
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

  -- Insertar el nuevo lead con todas las columnas correctas
  INSERT INTO public.leads (
    nombre_cliente,
    whatsapp,
    descripcion_proyecto,
    ubicacion_lat,
    ubicacion_lng,
    servicio_solicitado,
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
    ubicacion_direccion_in,
    imagen_url_in,
    photos_urls_in,
    disciplina_ia_in,
    COALESCE(urgencia_ia_in, urgencia_in, '5'), -- Usar urgencia_ia_in si existe, sino urgencia_in, sino '5'
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

-- PASO 4: Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) TO service_role;

-- PASO 5: Verificar que se creó correctamente
SELECT 
  routine_name as nombre,
  pg_get_function_arguments(p.oid) as argumentos,
  pg_get_function_result(p.oid) as retorno
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';

-- PASO 6: Verificar que las columnas existen ahora
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name IN ('imagen_url', 'photos_urls')
ORDER BY column_name;

