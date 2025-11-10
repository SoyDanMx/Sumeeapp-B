-- =====================================================
-- FIX COMPLETO: Trigger handle_new_user
-- Para registro de profesionales y clientes
-- =====================================================

-- PASO 1: Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PASO 2: Eliminar función anterior si existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASO 3: Crear función COMPLETA y CORREGIDA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_whatsapp TEXT;
  v_profession TEXT;
  v_city TEXT;
  v_bio TEXT;
  v_work_zones TEXT[];
  v_work_zones_other TEXT;
  v_registration_type TEXT;
  v_ubicacion_lat DECIMAL(10, 8);
  v_ubicacion_lng DECIMAL(11, 8);
BEGIN
  -- Log de inicio
  RAISE NOTICE 'handle_new_user: Procesando usuario %', NEW.email;
  
  -- Extraer datos de raw_user_meta_data
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'whatsapp');
  v_whatsapp := COALESCE(NEW.raw_user_meta_data->>'whatsapp', NEW.raw_user_meta_data->>'phone');
  v_profession := NEW.raw_user_meta_data->>'profession';
  v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Ciudad de México');
  v_bio := NEW.raw_user_meta_data->>'bio';
  v_registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', 'client');
  
  -- Extraer coordenadas de ubicación
  BEGIN
    v_ubicacion_lat := (NEW.raw_user_meta_data->>'ubicacion_lat')::DECIMAL(10, 8);
    v_ubicacion_lng := (NEW.raw_user_meta_data->>'ubicacion_lng')::DECIMAL(11, 8);
  EXCEPTION
    WHEN OTHERS THEN
      v_ubicacion_lat := NULL;
      v_ubicacion_lng := NULL;
  END;
  
  -- Extraer work_zones (array JSON)
  BEGIN
    IF NEW.raw_user_meta_data->>'work_zones' IS NOT NULL THEN
      v_work_zones := ARRAY(SELECT json_array_elements_text((NEW.raw_user_meta_data->>'work_zones')::json));
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      v_work_zones := NULL;
  END;
  
  v_work_zones_other := NEW.raw_user_meta_data->>'work_zones_other';

  -- Determinar el role basado en registration_type
  IF v_registration_type = 'professional' OR v_profession IS NOT NULL THEN
    -- Insertar como PROFESIONAL
    RAISE NOTICE 'Creando perfil de PROFESIONAL: %', NEW.email;
    
    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      phone,
      whatsapp,
      profession,
      bio,
      work_zones,
      role,
      city,
      ubicacion_lat,
      ubicacion_lng,
      membership_status,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      v_phone,
      v_whatsapp,
      v_profession,
      v_bio,
      v_work_zones,
      'profesional',
      v_city,
      v_ubicacion_lat,
      v_ubicacion_lng,
      'free',
      'active',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Perfil de PROFESIONAL creado exitosamente: %', NEW.email;
  ELSE
    -- Insertar como CLIENTE
    RAISE NOTICE 'Creando perfil de CLIENTE: %', NEW.email;
    
    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      phone,
      whatsapp,
      role,
      city,
      ubicacion_lat,
      ubicacion_lng,
      membership_status,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      v_phone,
      v_whatsapp,
      'client',
      v_city,
      v_ubicacion_lat,
      v_ubicacion_lng,
      'free',
      'active',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Perfil de CLIENTE creado exitosamente: %', NEW.email;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error en handle_new_user para %: % - %', NEW.email, SQLERRM, SQLSTATE;
    -- No fallar el registro, solo loguear
    RETURN NEW;
END;
$$;

-- PASO 4: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 5: Dar permisos
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- PASO 6: Verificar que se creó correctamente
DO $$
DECLARE
  v_trigger_count INTEGER;
  v_function_count INTEGER;
BEGIN
  -- Contar triggers
  SELECT COUNT(*) INTO v_trigger_count
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users';
  
  -- Contar funciones
  SELECT COUNT(*) INTO v_function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name = 'handle_new_user';
  
  -- Reportar
  IF v_trigger_count > 0 AND v_function_count > 0 THEN
    RAISE NOTICE '✅ Trigger y función creados exitosamente';
    RAISE NOTICE '   - Triggers encontrados: %', v_trigger_count;
    RAISE NOTICE '   - Funciones encontradas: %', v_function_count;
  ELSE
    RAISE WARNING '⚠️ Verificación falló:';
    RAISE WARNING '   - Triggers: %', v_trigger_count;
    RAISE WARNING '   - Funciones: %', v_function_count;
  END IF;
END $$;

-- PASO 7: Mostrar configuración final
SELECT 
  'Trigger' as tipo,
  trigger_name as nombre,
  event_object_table as tabla,
  action_timing as timing,
  event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'

UNION ALL

SELECT 
  'Función' as tipo,
  routine_name as nombre,
  'public' as tabla,
  security_type as timing,
  routine_type as evento
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

