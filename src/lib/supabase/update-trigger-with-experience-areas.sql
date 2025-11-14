-- =====================================================
-- ACTUALIZAR TRIGGER: handle_new_user
-- Agregar soporte para experience y areas_servicio
-- =====================================================

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
  v_experience INTEGER;  -- ← NUEVO: Años de experiencia
  v_areas_servicio TEXT[];  -- ← NUEVO: Áreas de servicio
BEGIN
  -- Extraer datos de raw_user_meta_data
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'whatsapp');
  v_whatsapp := COALESCE(NEW.raw_user_meta_data->>'whatsapp', NEW.raw_user_meta_data->>'phone');
  v_profession := NEW.raw_user_meta_data->>'profession';
  v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Ciudad de México');
  v_bio := NEW.raw_user_meta_data->>'bio';
  v_registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', 'client');
  
  -- 🗺️ Extraer coordenadas de ubicación
  v_ubicacion_lat := (NEW.raw_user_meta_data->>'ubicacion_lat')::DECIMAL(10, 8);
  v_ubicacion_lng := (NEW.raw_user_meta_data->>'ubicacion_lng')::DECIMAL(11, 8);
  
  -- 📊 NUEVO: Extraer experience (años de experiencia)
  IF NEW.raw_user_meta_data->>'experience' IS NOT NULL THEN
    v_experience := (NEW.raw_user_meta_data->>'experience')::INTEGER;
  END IF;
  
  -- 🏷️ NUEVO: Extraer areas_servicio (array JSON)
  IF NEW.raw_user_meta_data->>'areas_servicio' IS NOT NULL THEN
    v_areas_servicio := ARRAY(SELECT json_array_elements_text((NEW.raw_user_meta_data->>'areas_servicio')::json));
  END IF;
  
  -- Extraer work_zones (array JSON)
  IF NEW.raw_user_meta_data->>'work_zones' IS NOT NULL THEN
    v_work_zones := ARRAY(SELECT json_array_elements_text((NEW.raw_user_meta_data->>'work_zones')::json));
  END IF;
  
  v_work_zones_other := NEW.raw_user_meta_data->>'work_zones_other';

  -- Determinar el role basado en registration_type
  IF v_registration_type = 'professional' OR v_profession IS NOT NULL THEN
    -- Insertar como PROFESIONAL
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
      experience,  -- ← NUEVO
      areas_servicio,  -- ← NUEVO
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
      v_experience,  -- ← NUEVO
      v_areas_servicio,  -- ← NUEVO
      'free',
      'active',
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Perfil de PROFESIONAL creado: % (role: profesional, experience: %, areas: %)', 
      NEW.email, v_experience, v_areas_servicio;
  ELSE
    -- Insertar como CLIENTE
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
    
    RAISE LOG 'Perfil de CLIENTE creado: % (role: client)', NEW.email;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error en handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Verificar que el trigger esté activo
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Si el trigger no existe, crearlo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
      
    RAISE NOTICE 'Trigger on_auth_user_created creado exitosamente';
  ELSE
    RAISE NOTICE 'Trigger on_auth_user_created ya existe y ha sido actualizado';
  END IF;
END $$;

