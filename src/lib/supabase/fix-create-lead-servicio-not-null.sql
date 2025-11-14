-- =====================================================
-- CORRECCIÓN: create_lead - columna servicio NOT NULL
-- La columna servicio es NOT NULL pero estamos insertando NULL
-- =====================================================

-- PASO 1: Eliminar todas las versiones existentes de create_lead
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

-- PASO 2: Crear nueva versión con manejo correcto de servicio NOT NULL
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
  urgencia_ia_in TEXT DEFAULT NULL, -- Recibe TEXT pero lo convertimos a INTEGER
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
  v_urgencia_ia INTEGER;
  v_servicio TEXT;
BEGIN
  -- Log de inicio (opcional, útil para debugging)
  RAISE NOTICE 'create_lead: Iniciando con cliente: %, servicio: %, disciplina_ia: %', 
    nombre_cliente_in, servicio_in, disciplina_ia_in;

  -- Obtener el ID del usuario autenticado
  v_cliente_id := auth.uid();
  
  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuario autenticado. Debes estar logueado para crear un lead.';
  END IF;

  -- Determinar el valor de servicio (NOT NULL)
  -- Prioridad: servicio_in > disciplina_ia_in > 'General'
  IF servicio_in IS NOT NULL AND servicio_in != '' THEN
    v_servicio := servicio_in;
  ELSIF disciplina_ia_in IS NOT NULL AND disciplina_ia_in != '' THEN
    v_servicio := disciplina_ia_in;
  ELSE
    v_servicio := 'General'; -- Valor por defecto si todo es NULL
  END IF;

  -- Convertir urgencia_ia a INTEGER
  -- Prioridad: urgencia_ia_in > urgencia_in > 5 (default)
  BEGIN
    IF urgencia_ia_in IS NOT NULL AND urgencia_ia_in != '' THEN
      v_urgencia_ia := urgencia_ia_in::INTEGER;
    ELSIF urgencia_in IS NOT NULL AND urgencia_in != '' THEN
      v_urgencia_ia := urgencia_in::INTEGER;
    ELSE
      v_urgencia_ia := 5; -- Valor por defecto
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Si la conversión falla, usar valor por defecto
      RAISE WARNING 'create_lead: Error convirtiendo urgencia a INTEGER, usando valor por defecto 5. Valor recibido: %', COALESCE(urgencia_ia_in, urgencia_in);
      v_urgencia_ia := 5;
  END;

  -- Insertar el nuevo lead con todas las columnas correctas
  -- NOTA: Si la tabla tiene columna 'servicio' (NOT NULL), usarla; si tiene 'servicio_solicitado', usar esa
  INSERT INTO public.leads (
    nombre_cliente,
    whatsapp,
    descripcion_proyecto,
    ubicacion_lat,
    ubicacion_lng,
    servicio, -- Columna NOT NULL
    servicio_solicitado, -- Columna alternativa (si existe)
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
    v_servicio, -- Usar el servicio determinado (nunca NULL)
    v_servicio, -- También en servicio_solicitado por compatibilidad
    ubicacion_direccion_in,
    imagen_url_in,
    photos_urls_in,
    disciplina_ia_in,
    v_urgencia_ia, -- Usar el INTEGER convertido
    diagnostico_ia_in,
    v_cliente_id,
    'nuevo',
    NOW()
  )
  RETURNING id INTO v_lead_id;

  -- Log de éxito
  RAISE NOTICE 'create_lead: Lead creado exitosamente con ID: %, servicio: %, urgencia_ia: %', v_lead_id, v_servicio, v_urgencia_ia;

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
SELECT 
  routine_name as nombre,
  pg_get_function_arguments(p.oid) as argumentos,
  pg_get_function_result(p.oid) as retorno
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';

