-- =========================================================================
-- ACTUALIZACIÓN DE handle_new_user PARA MANEJAR CITY Y ONBOARDING_STATUS
-- =========================================================================
-- Este script actualiza el trigger handle_new_user para procesar el campo city
-- desde raw_user_meta_data y establecer el onboarding_status apropiado

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    user_profession text;
    user_full_name text;
    user_email text;
    user_city text;
    user_work_zones text[];
    user_work_zones_other text;
    registration_type text;
    onboarding_status_val text;
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN SEGURA DE METADATOS
    -- =========================================================================
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_email := NEW.email;
    user_city := COALESCE(NEW.raw_user_meta_data->>'city', '');
    registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', '');
    
    -- Extraer work_zones (puede ser array o string separado por comas)
    IF NEW.raw_user_meta_data->>'work_zones' IS NOT NULL THEN
        BEGIN
            -- Intentar parsear como array JSON
            user_work_zones := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'work_zones'));
        EXCEPTION
            WHEN OTHERS THEN
                -- Si falla, intentar como string separado por comas
                user_work_zones := string_to_array(
                    COALESCE(NEW.raw_user_meta_data->>'work_zones', ''), 
                    ','
                );
        END;
    ELSE
        user_work_zones := NULL;
    END IF;
    
    user_work_zones_other := COALESCE(NEW.raw_user_meta_data->>'work_zones_other', '');
    
    -- =========================================================================
    -- 2. VALIDACIÓN Y SANITIZACIÓN
    -- =========================================================================
    user_profession := TRIM(user_profession);
    user_city := TRIM(user_city);
    
    -- Si city está vacío y es profesional, establecer CDMX por defecto
    IF user_city = '' AND user_profession != '' THEN
        user_city := 'Ciudad de México';
    END IF;
    
    -- =========================================================================
    -- 3. DETERMINAR ROL
    -- =========================================================================
    user_role := CASE 
        WHEN user_profession IS NOT NULL AND user_profession != '' THEN 'profesional'
        WHEN COALESCE(NEW.raw_user_meta_data->>'registration_type', '') = 'profesional' THEN 'profesional'
        ELSE 'client'
    END;
    
    -- =========================================================================
    -- 4. DETERMINAR ONBOARDING_STATUS PARA PROFESIONALES
    -- =========================================================================
    IF user_role = 'profesional' THEN
        onboarding_status_val := CASE
            -- Si es de Ciudad de México, está pendiente de revisión inicialmente
            WHEN user_city = 'Ciudad de México' THEN 'pending_review'
            -- Si es de otra ciudad, va a lista de espera
            WHEN user_city != '' AND user_city != 'Ciudad de México' THEN 'waitlist_other_city'
            -- Por defecto, pendiente de revisión
            ELSE 'pending_review'
        END;
    ELSE
        onboarding_status_val := 'pending_review'; -- Para clientes, no aplica pero necesitamos un valor
    END IF;
    
    -- =========================================================================
    -- 5. LOGGING PARA DEBUGGING
    -- =========================================================================
    RAISE LOG '=== NUEVO USUARIO REGISTRADO ===';
    RAISE LOG 'Email: %', user_email;
    RAISE LOG 'Profession: %', user_profession;
    RAISE LOG 'Full Name: %', user_full_name;
    RAISE LOG 'City: %', user_city;
    RAISE LOG 'Role: %', user_role;
    RAISE LOG 'Onboarding Status: %', onboarding_status_val;
    RAISE LOG 'Work Zones: %', user_work_zones;
    
    -- =========================================================================
    -- 6. INSERCIÓN EN PROFILES CON NUEVOS CAMPOS
    -- =========================================================================
    INSERT INTO public.profiles (
        user_id,
        role,
        full_name,
        email,
        city,
        onboarding_status,
        work_zones,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        user_role,
        user_full_name,
        user_email,
        CASE WHEN user_city != '' THEN user_city ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN onboarding_status_val ELSE 'pending_review' END,
        user_work_zones,
        NOW(),
        NOW()
    );
    
    -- =========================================================================
    -- 7. CREAR DATOS ESPECÍFICOS SI ES PROFESIONAL
    -- =========================================================================
    IF user_role = 'profesional' THEN
        -- Construir work_zones final: si es otra ciudad, usar work_zones_other
        DECLARE
            final_work_zones text[];
        BEGIN
            IF user_city = 'Ciudad de México' THEN
                final_work_zones := user_work_zones;
            ELSIF user_work_zones_other != '' THEN
                -- Convertir work_zones_other (texto separado por comas) en array
                final_work_zones := string_to_array(user_work_zones_other, ',');
            ELSE
                final_work_zones := user_work_zones;
            END IF;
            
            INSERT INTO public.profesionales (
                user_id,
                profession,
                whatsapp,
                descripcion_perfil,
                specialties,
                experience_years,
                disponibilidad,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                user_profession,
                COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
                COALESCE(NEW.raw_user_meta_data->>'bio', 'Profesional verificado en Sumee App'),
                ARRAY[user_profession],
                COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 2),
                'disponible',
                NOW(),
                NOW()
            );
        END;
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$$;

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Función actualizada para manejar nuevos usuarios con soporte para city y onboarding_status. 
Gestiona el registro de profesionales de diferentes ciudades y establece el estado de onboarding apropiado.';

