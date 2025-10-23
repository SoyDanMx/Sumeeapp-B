-- =========================================================================
-- TRIGGER CORREGIDO PARA ASIGNACIÓN DE ROLES DE PROFESIONALES
-- Soluciona el bug de asignación de roles en el registro de profesionales
-- =========================================================================

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
    registration_type text;
    source_url text;
    is_professional_registration boolean := false;
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN DE METADATOS CON VALORES POR DEFECTO
    -- =========================================================================
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_email := NEW.email;
    registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', '');
    source_url := COALESCE(NEW.raw_user_meta_data->>'source_url', '');
    
    -- =========================================================================
    -- 2. LOGGING PARA DEBUGGING
    -- =========================================================================
    RAISE LOG '=== NUEVO USUARIO REGISTRADO ===';
    RAISE LOG 'Email: %', user_email;
    RAISE LOG 'Profession: %', user_profession;
    RAISE LOG 'Full Name: %', user_full_name;
    RAISE LOG 'Registration Type: %', registration_type;
    RAISE LOG 'Source URL: %', source_url;
    RAISE LOG 'Raw Metadata: %', NEW.raw_user_meta_data;
    
    -- =========================================================================
    -- 3. DETERMINAR SI ES REGISTRO PROFESIONAL
    -- =========================================================================
    -- Múltiples indicadores para determinar si es un profesional
    is_professional_registration := (
        -- Indicador principal: registration_type = 'profesional'
        registration_type = 'profesional' OR
        -- Indicador secundario: profession no vacío
        (user_profession IS NOT NULL AND user_profession != '' AND user_profession != 'null') OR
        -- Indicador terciario: viene de la URL de registro profesional
        (source_url LIKE '%/join-as-pro%') OR
        -- Indicador cuaternario: email contiene indicadores
        (user_email ILIKE '%profesional%' OR user_email ILIKE '%pro%')
    );
    
    RAISE LOG 'Is Professional Registration: %', is_professional_registration;
    
    -- =========================================================================
    -- 4. ASIGNACIÓN DE ROL BASADA EN INDICADORES
    -- =========================================================================
    user_role := CASE 
        WHEN is_professional_registration THEN 'profesional'
        ELSE 'client'
    END;
    
    RAISE LOG 'Final Role Assigned: %', user_role;
    
    -- =========================================================================
    -- 5. VALIDACIONES DE SEGURIDAD
    -- =========================================================================
    -- Asegurar que el email sea válido
    IF user_email IS NULL OR user_email = '' THEN
        RAISE EXCEPTION 'Email is required for user registration';
    END IF;
    
    -- =========================================================================
    -- 6. INSERCIÓN EN PROFILES
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
    -- 7. CREAR DATOS ESPECÍFICOS SI ES PROFESIONAL
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
        -- =========================================================================
        -- 8. MANEJO DE ERRORES
        -- =========================================================================
        RAISE LOG 'ERROR in handle_new_user: %', SQLERRM;
        RAISE LOG 'Error context: email=%, profession=%, registration_type=%', 
                  user_email, user_profession, registration_type;
        RAISE;
END;
$$;

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Función corregida para manejar nuevos usuarios con asignación correcta de roles para profesionales. Incluye logging detallado para debugging.';

-- =========================================================================
-- VERIFICAR QUE EL TRIGGER ESTÉ ACTIVO
-- =========================================================================

-- Asegurar que el trigger esté activo en la tabla auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- POLÍTICAS RLS ADICIONALES PARA SEGURIDAD
-- =========================================================================

-- Política para prevenir que usuarios modifiquen su propio rol
CREATE POLICY IF NOT EXISTS "Users cannot modify their own role" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

-- Política para prevenir inserción directa de perfiles (solo a través del trigger)
CREATE POLICY IF NOT EXISTS "Only system can insert profiles" ON public.profiles
    FOR INSERT
    WITH CHECK (false);
