-- =========================================================================
-- TRIGGER DE DEBUG PARA DIAGNOSTICAR ERRORES
-- =========================================================================
-- Este trigger incluye manejo robusto de errores y logging detallado

-- Primero, eliminar el trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar la función existente si existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear la función con manejo robusto de errores
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
    profile_inserted boolean := false;
    profesional_inserted boolean := false;
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN SEGURA DE METADATOS
    -- =========================================================================
    BEGIN
        user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
        user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
        user_email := NEW.email;
        registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', '');
        
        RAISE LOG '=== INICIANDO REGISTRO DE USUARIO ===';
        RAISE LOG 'User ID: %', NEW.id;
        RAISE LOG 'Email: %', user_email;
        RAISE LOG 'Full Name: %', user_full_name;
        RAISE LOG 'Profession: %', user_profession;
        RAISE LOG 'Registration Type: %', registration_type;
        RAISE LOG 'Raw Metadata: %', NEW.raw_user_meta_data;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE LOG 'ERROR extrayendo metadatos: %', SQLERRM;
            -- Continuar con valores por defecto
            user_profession := '';
            user_full_name := NEW.email;
            user_email := NEW.email;
            registration_type := '';
    END;

    -- =========================================================================
    -- 2. DETERMINAR SI ES REGISTRO PROFESIONAL
    -- =========================================================================
    BEGIN
        is_professional_registration := (
            registration_type = 'profesional' OR
            (user_profession IS NOT NULL AND user_profession != '' AND user_profession != 'null')
        );
        
        RAISE LOG 'Is Professional Registration: %', is_professional_registration;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE LOG 'ERROR determinando tipo de registro: %', SQLERRM;
            is_professional_registration := false;
    END;

    -- =========================================================================
    -- 3. ASIGNAR ROL
    -- =========================================================================
    BEGIN
        user_role := CASE 
            WHEN is_professional_registration THEN 'profesional'
            ELSE 'client'
        END;
        
        RAISE LOG 'Role asignado: %', user_role;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE LOG 'ERROR asignando rol: %', SQLERRM;
            user_role := 'client';
    END;

    -- =========================================================================
    -- 4. INSERTAR EN PROFILES CON MANEJO DE ERRORES
    -- =========================================================================
    BEGIN
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
        
        profile_inserted := true;
        RAISE LOG 'Profile insertado exitosamente con role: %', user_role;
        
    EXCEPTION
        WHEN unique_violation THEN
            RAISE LOG 'Profile ya existe para user_id: %', NEW.id;
            -- Intentar actualizar el perfil existente
            UPDATE public.profiles 
            SET role = user_role,
                full_name = user_full_name,
                updated_at = NOW()
            WHERE user_id = NEW.id;
            profile_inserted := true;
            RAISE LOG 'Profile actualizado exitosamente';
            
        WHEN OTHERS THEN
            RAISE LOG 'ERROR insertando profile: %', SQLERRM;
            RAISE LOG 'Error details: %', SQLSTATE;
            -- No re-lanzar el error, continuar
    END;

    -- =========================================================================
    -- 5. CREAR DATOS ESPECÍFICOS SI ES PROFESIONAL
    -- =========================================================================
    IF user_role = 'profesional' AND profile_inserted THEN
        BEGIN
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
            
            profesional_inserted := true;
            RAISE LOG 'Datos de profesional insertados exitosamente';
            
        EXCEPTION
            WHEN unique_violation THEN
                RAISE LOG 'Datos de profesional ya existen para user_id: %', NEW.id;
                -- Intentar actualizar
                UPDATE public.profesionales 
                SET profession = COALESCE(user_profession, 'General'),
                    whatsapp = COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
                    descripcion_perfil = COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App'),
                    specialties = ARRAY[COALESCE(user_profession, 'General')],
                    experience_years = COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 2),
                    updated_at = NOW()
                WHERE user_id = NEW.id;
                profesional_inserted := true;
                RAISE LOG 'Datos de profesional actualizados exitosamente';
                
            WHEN OTHERS THEN
                RAISE LOG 'ERROR insertando datos de profesional: %', SQLERRM;
                RAISE LOG 'Error details: %', SQLSTATE;
                -- No re-lanzar el error, continuar
        END;
    END IF;

    -- =========================================================================
    -- 6. LOGGING FINAL
    -- =========================================================================
    RAISE LOG '=== REGISTRO COMPLETADO ===';
    RAISE LOG 'Profile insertado: %', profile_inserted;
    RAISE LOG 'Profesional insertado: %', profesional_inserted;
    RAISE LOG 'Role final: %', user_role;

    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- =========================================================================
        -- 7. MANEJO GLOBAL DE ERRORES
        -- =========================================================================
        RAISE LOG 'ERROR GLOBAL en handle_new_user: %', SQLERRM;
        RAISE LOG 'Error context: user_id=%, email=%, profession=%, registration_type=%', 
                  NEW.id, user_email, user_profession, registration_type;
        
        -- Intentar insertar al menos el perfil básico
        BEGIN
            INSERT INTO public.profiles (
                user_id,
                role,
                full_name,
                email,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                'client',
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
                NEW.email,
                NOW(),
                NOW()
            );
            RAISE LOG 'Profile básico insertado como fallback';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE LOG 'ERROR en fallback: %', SQLERRM;
        END;
        
        -- Re-lanzar el error original
        RAISE;
END;
$$;

-- =========================================================================
-- CREAR EL TRIGGER
-- =========================================================================
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- VERIFICAR QUE EL TRIGGER ESTÉ ACTIVO
-- =========================================================================
-- Ejecutar esta consulta para verificar que el trigger existe:
-- SELECT trigger_name, event_manipulation, action_statement 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'on_auth_user_created';

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función robusta para manejar nuevos usuarios con manejo completo de errores y logging detallado. Incluye fallbacks para casos de error.';
