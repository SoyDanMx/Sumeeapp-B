-- =========================================================================
-- TRIGGER MEJORADO: handle_new_user CON VALIDACIÓN OBLIGATORIA
-- Para clientes: WhatsApp y ubicación son REQUERIDOS
-- =========================================================================

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
  v_registration_type TEXT;
  v_ubicacion_lat DECIMAL(10, 8);
  v_ubicacion_lng DECIMAL(11, 8);
  v_role TEXT := 'client';
  v_whatsapp_valid BOOLEAN := false;
  v_location_valid BOOLEAN := false;
BEGIN
  -- =========================================================================
  -- 1. EXTRACCIÓN DE METADATOS
  -- =========================================================================
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  v_whatsapp := COALESCE(
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'phone',
    ''
  );
  v_profession := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'profession', '')), '');
  v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Ciudad de México');
  v_bio := NEW.raw_user_meta_data->>'bio';
  v_registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', 'client');
  
  -- Extraer coordenadas de ubicación
  BEGIN
    IF NEW.raw_user_meta_data->>'ubicacion_lat' IS NOT NULL 
       AND NEW.raw_user_meta_data->>'ubicacion_lat' != '' 
       AND NEW.raw_user_meta_data->>'ubicacion_lat' != 'null' THEN
      v_ubicacion_lat := (NEW.raw_user_meta_data->>'ubicacion_lat')::DECIMAL(10, 8);
    END IF;
    
    IF NEW.raw_user_meta_data->>'ubicacion_lng' IS NOT NULL 
       AND NEW.raw_user_meta_data->>'ubicacion_lng' != '' 
       AND NEW.raw_user_meta_data->>'ubicacion_lng' != 'null' THEN
      v_ubicacion_lng := (NEW.raw_user_meta_data->>'ubicacion_lng')::DECIMAL(11, 8);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      v_ubicacion_lat := NULL;
      v_ubicacion_lng := NULL;
  END;
  
  -- Extraer work_zones
  BEGIN
    IF NEW.raw_user_meta_data->>'work_zones' IS NOT NULL THEN
      v_work_zones := ARRAY(SELECT json_array_elements_text((NEW.raw_user_meta_data->>'work_zones')::json));
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      v_work_zones := NULL;
  END;

  -- =========================================================================
  -- 2. VALIDACIÓN DE WHATSAPP (10 dígitos, sin espacios)
  -- =========================================================================
  v_whatsapp := REGEXP_REPLACE(v_whatsapp, '[^0-9]', '', 'g'); -- Solo números
  IF LENGTH(v_whatsapp) = 10 AND v_whatsapp !~ '^0' THEN
    v_whatsapp_valid := true;
  END IF;

  -- =========================================================================
  -- 3. VALIDACIÓN DE UBICACIÓN
  -- =========================================================================
  IF v_ubicacion_lat IS NOT NULL 
     AND v_ubicacion_lng IS NOT NULL 
     AND v_ubicacion_lat BETWEEN -90 AND 90 
     AND v_ubicacion_lng BETWEEN -180 AND 180 THEN
    v_location_valid := true;
  END IF;

  -- =========================================================================
  -- 4. DETERMINAR ROL
  -- =========================================================================
  IF v_registration_type = 'professional' 
     OR v_registration_type = 'profesional' 
     OR v_profession IS NOT NULL THEN
    v_role := 'profesional';
  ELSE
    v_role := 'client';
  END IF;

  -- =========================================================================
  -- 5. VALIDACIÓN CRÍTICA PARA CLIENTES
  -- =========================================================================
  IF v_role = 'client' THEN
    -- Para clientes, WhatsApp y ubicación son OBLIGATORIOS
    IF NOT v_whatsapp_valid THEN
      RAISE EXCEPTION 'CLIENT_REQUIRES_WHATSAPP: Los clientes deben proporcionar un número de WhatsApp válido (10 dígitos)';
    END IF;
    
    IF NOT v_location_valid THEN
      RAISE EXCEPTION 'CLIENT_REQUIRES_LOCATION: Los clientes deben proporcionar su ubicación (latitud y longitud)';
    END IF;
  END IF;

  -- =========================================================================
  -- 6. INSERTAR PERFIL
  -- =========================================================================
  IF v_role = 'profesional' THEN
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
      membership_status,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      NULLIF(v_phone, ''),
      NULLIF(v_whatsapp, ''),
      v_profession,
      NULLIF(v_bio, ''),
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
    
    RAISE LOG '✅ Perfil PROFESIONAL creado: % (whatsapp: %, ubicacion: %, %)', 
      NEW.email, v_whatsapp, v_ubicacion_lat, v_ubicacion_lng;
      
  ELSE
    -- Insertar como CLIENTE (con validaciones pasadas)
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
      NULLIF(v_phone, ''),
      v_whatsapp, -- ✅ Garantizado que es válido
      'client',
      v_city,
      v_ubicacion_lat, -- ✅ Garantizado que es válido
      v_ubicacion_lng, -- ✅ Garantizado que es válido
      'free',
      'active',
      NOW(),
      NOW()
    );
    
    RAISE LOG '✅ Perfil CLIENTE creado: % (whatsapp: %, ubicacion: %, %)', 
      NEW.email, v_whatsapp, v_ubicacion_lat, v_ubicacion_lng;
  END IF;

  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error para debugging
    RAISE LOG '❌ ERROR en handle_new_user para %: % (SQLSTATE: %)', 
      NEW.email, SQLERRM, SQLSTATE;
    
    -- Re-lanzar excepciones de validación para que el frontend las capture
    IF SQLERRM LIKE 'CLIENT_REQUIRES_%' THEN
      RAISE;
    END IF;
    
    -- Para otros errores, intentar crear perfil mínimo (fallback)
    BEGIN
      INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        membership_status,
        status,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        v_role,
        'free',
        'active',
        NOW(),
        NOW()
      );
      RAISE LOG '⚠️ Perfil creado con datos mínimos debido a error: %', SQLERRM;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE LOG '❌ Error crítico al crear perfil mínimo: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- =========================================================================
-- COMENTARIOS
-- =========================================================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger mejorado que valida que los clientes tengan WhatsApp y ubicación obligatorios. Rechaza registros incompletos.';

-- =========================================================================
-- VERIFICAR TRIGGER
-- =========================================================================
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
    
    RAISE NOTICE '✅ Trigger on_auth_user_created creado';
  ELSE
    RAISE NOTICE '✅ Trigger on_auth_user_created ya existe';
  END IF;
END $$;

