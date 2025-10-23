-- =========================================================================
-- TRIGGER CORREGIDO PARA EL ESQUEMA ACTUAL (3 TABLAS)
-- =========================================================================
-- Este trigger maneja correctamente el esquema actual con:
-- - public.profiles (usuarios base)
-- - public.profesionales (datos específicos de profesionales)
-- - public.leads (solicitudes)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    user_profession text;
    user_full_name text;
    user_email text;
    registration_type text;
    is_professional_registration boolean := false;
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN DE METADATOS
    -- =========================================================================
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_email := NEW.email;
    registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', '');
    
    -- =========================================================================
    -- 2. LOGGING PARA DEBUGGING
    -- =========================================================================
    RAISE LOG '=== NUEVO USUARIO REGISTRADO ===';
    RAISE LOG 'Email: %', user_email;
    RAISE LOG 'Profession: %', user_profession;
    RAISE LOG 'Full Name: %', user_full_name;
    RAISE LOG 'Registration Type: %', registration_type;
    RAISE LOG 'Raw Metadata: %', NEW.raw_user_meta_data;
    
    -- =========================================================================
    -- 3. DETERMINAR SI ES REGISTRO PROFESIONAL
    -- =========================================================================
    is_professional_registration := (
        registration_type = 'profesional' OR
        (user_profession IS NOT NULL AND user_profession != '' AND user_profession != 'null')
    );
    
    -- =========================================================================
    -- 4. ASIGNACIÓN DE ROL
    -- =========================================================================
    user_role := CASE 
        WHEN is_professional_registration THEN 'profesional'
        ELSE 'client'
    END;
    
    RAISE LOG 'Final Role Assigned: %', user_role;
    
    -- =========================================================================
    -- 5. INSERTAR EN PROFILES (TABLA BASE)
    -- =========================================================================
    INSERT INTO public.profiles (
        user_id,
        role,
        full_name,
        email,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        user_role,
        user_full_name,
        user_email,
        NOW(),
        NOW()
    );
    
    RAISE LOG 'Profile created with role: %', user_role;
    
    -- =========================================================================
    -- 6. CREAR DATOS ESPECÍFICOS SI ES PROFESIONAL
    -- =========================================================================
    IF user_role = 'profesional' THEN
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
            COALESCE(user_profession, 'General'),
            COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
            COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App'),
            ARRAY[COALESCE(user_profession, 'General')],
            COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 2),
            'disponible',
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Professional profile created for profession: %', COALESCE(user_profession, 'General');
    END IF;
    
    RAISE LOG '=== REGISTRO COMPLETADO ===';
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'ERROR in handle_new_user: %', SQLERRM;
        RAISE LOG 'Error context: email=%, profession=%, registration_type=%', 
                  user_email, user_profession, registration_type;
        RAISE;
END;
$$;

-- =========================================================================
-- VERSIÓN ALTERNATIVA PARA ESQUEMA SIMPLIFICADO (2 TABLAS)
-- =========================================================================
-- Si prefieres el esquema simplificado con solo profiles y leads:

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    user_profession text;
    user_full_name text;
    user_email text;
    registration_type text;
    is_professional_registration boolean := false;
BEGIN
    -- Extraer metadatos
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_email := NEW.email;
    registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', '');
    
    -- Determinar si es profesional
    is_professional_registration := (
        registration_type = 'profesional' OR
        (user_profession IS NOT NULL AND user_profession != '' AND user_profession != 'null')
    );
    
    -- Asignar rol
    user_role := CASE 
        WHEN is_professional_registration THEN 'profesional'
        ELSE 'client'
    END;
    
    -- Insertar en profiles con todos los campos
    INSERT INTO public.profiles (
        user_id,
        role,
        full_name,
        email,
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
        user_role,
        user_full_name,
        user_email,
        CASE WHEN user_role = 'profesional' THEN COALESCE(user_profession, 'General') ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN COALESCE(NEW.raw_user_meta_data->>'whatsapp', '') ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App') ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN ARRAY[COALESCE(user_profession, 'General')] ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 2) ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN 'disponible' ELSE NULL END,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$;
*/

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Función corregida para manejar nuevos usuarios con asignación correcta de roles. Compatible con esquema de 3 tablas (profiles, profesionales, leads).';

-- Asegurar que el trigger esté activo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
