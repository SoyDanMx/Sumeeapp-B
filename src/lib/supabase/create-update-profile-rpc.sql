-- =========================================================================
-- FUNCIÓN RPC PARA ACTUALIZAR PERFIL DE PROFESIONAL
-- =========================================================================
-- Esta función RPC con SECURITY DEFINER permite actualizar perfiles
-- sin problemas de RLS, similar a create_lead

-- =========================================================================
-- 1. ELIMINAR FUNCIÓN EXISTENTE SI EXISTE
-- =========================================================================
DROP FUNCTION IF EXISTS public.update_profile(UUID, JSONB);

-- =========================================================================
-- 2. CREAR FUNCIÓN RPC CON SECURITY DEFINER
-- =========================================================================
-- Esta función acepta un JSONB con los campos a actualizar
-- y los aplica dinámicamente a la tabla profiles

CREATE OR REPLACE FUNCTION public.update_profile(
  user_id_in UUID,
  updates JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_user_id UUID;
  update_sql TEXT;
  key TEXT;
  value JSONB;
  set_parts TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- =========================================================================
  -- VALIDACIÓN: Verificar que el usuario existe
  -- =========================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_in) THEN
    RAISE EXCEPTION 'Usuario no encontrado: %', user_id_in;
  END IF;

  -- =========================================================================
  -- VALIDACIÓN: Verificar que el user_id_in coincide con auth.uid()
  -- =========================================================================
  -- Solo permitir que el usuario actualice su propio perfil
  IF user_id_in != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permisos para actualizar este perfil';
  END IF;

  -- =========================================================================
  -- CONSTRUIR CLAUSULA UPDATE DINÁMICAMENTE DESDE JSONB
  -- =========================================================================
  FOR key, value IN SELECT * FROM jsonb_each(updates)
  LOOP
    -- Validar que la columna existe en la tabla profiles
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = key
    ) THEN
      -- Construir la parte SET según el tipo de dato
      IF value IS NULL OR jsonb_typeof(value) = 'null' THEN
        set_parts := array_append(set_parts, format('%I = NULL', key));
      ELSIF jsonb_typeof(value) = 'string' THEN
        set_parts := array_append(set_parts, format('%I = %L', key, value #>> '{}'));
      ELSIF jsonb_typeof(value) = 'number' THEN
        set_parts := array_append(set_parts, format('%I = %s', key, value::numeric));
      ELSIF jsonb_typeof(value) = 'boolean' THEN
        set_parts := array_append(set_parts, format('%I = %s', key, value::boolean));
      ELSIF jsonb_typeof(value) = 'array' THEN
        -- Para arrays, convertir a formato PostgreSQL array
        set_parts := array_append(set_parts, format(
          '%I = %L::text[]', 
          key, 
          (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(value) AS elem)
        ));
      ELSE
        -- Para otros tipos, usar como texto
        set_parts := array_append(set_parts, format('%I = %L', key, value #>> '{}'));
      END IF;
    ELSE
      RAISE WARNING 'Columna % no existe en la tabla profiles, ignorando...', key;
    END IF;
  END LOOP;

  -- =========================================================================
  -- EJECUTAR UPDATE
  -- =========================================================================
  IF array_length(set_parts, 1) IS NULL THEN
    RAISE EXCEPTION 'No hay campos válidos para actualizar';
  END IF;

  -- Añadir updated_at solo si la columna existe
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    set_parts := array_append(set_parts, 'updated_at = NOW()');
  END IF;

  -- Construir la consulta UPDATE
  update_sql := format(
    'UPDATE public.profiles SET %s WHERE user_id = %L RETURNING user_id',
    array_to_string(set_parts, ', '),
    user_id_in
  );

  -- Ejecutar la consulta
  EXECUTE update_sql INTO updated_user_id;

  -- =========================================================================
  -- VERIFICAR QUE LA ACTUALIZACIÓN FUE EXITOSA
  -- =========================================================================
  IF updated_user_id IS NULL THEN
    RAISE EXCEPTION 'No se pudo actualizar el perfil. El usuario puede no existir.';
  END IF;

  -- =========================================================================
  -- RETORNAR EL ID DEL USUARIO ACTUALIZADO
  -- =========================================================================
  RETURN updated_user_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Log del error para debugging
    RAISE LOG 'Error en update_profile: %', SQLERRM;
    -- Re-lanzar el error con contexto
    RAISE EXCEPTION 'Error al actualizar perfil: %', SQLERRM;
END;
$$;

-- =========================================================================
-- 3. COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON FUNCTION public.update_profile(UUID, JSONB) IS 
'Función RPC para actualizar perfiles de usuarios. Ejecuta con SECURITY DEFINER para bypass RLS.
Solo permite que el usuario actualice su propio perfil (user_id_in = auth.uid()).
Acepta un objeto JSONB con los campos a actualizar y construye dinámicamente la consulta UPDATE.';

-- =========================================================================
-- 4. PERMISOS
-- =========================================================================
-- Asegurar que los usuarios autenticados pueden ejecutar esta función
GRANT EXECUTE ON FUNCTION public.update_profile(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile(UUID, JSONB) TO anon;

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. Esta función usa SECURITY DEFINER, por lo que ejecuta con permisos de postgres
-- 2. Esto permite bypassar RLS para operaciones de UPDATE
-- 3. La función valida que user_id_in = auth.uid() para seguridad
-- 4. Solo actualiza columnas que existen en la tabla profiles
-- 5. Maneja diferentes tipos de datos (string, number, boolean, array, null)
-- 6. Actualiza automáticamente updated_at solo si la columna existe

