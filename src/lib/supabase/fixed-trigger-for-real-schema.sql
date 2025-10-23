-- =========================================================================
-- TRIGGER CORREGIDO PARA EL ESQUEMA REAL
-- =========================================================================
-- Este trigger está corregido para coincidir exactamente con el esquema real

-- Primero, eliminar el trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear la función corregida que coincida con el esquema real
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
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN DE METADATOS
    -- =========================================================================
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_email := NEW.email;
    
    -- =========================================================================
    -- 2. LOGGING PARA DEBUGGING
    -- =========================================================================
    RAISE LOG '=== NUEVO USUARIO REGISTRADO ===';
    RAISE LOG 'User ID: %', NEW.id;
    RAISE LOG 'Email: %', user_email;
    RAISE LOG 'Full Name: %', user_full_name;
    RAISE LOG 'Profession: %', user_profession;
    RAISE LOG 'Raw Metadata: %', NEW.raw_user_meta_data;
    
    -- =========================================================================
    -- 3. DETERMINAR ROL
    -- =========================================================================
    user_role := CASE
        WHEN user_profession IS NOT NULL AND user_profession != '' AND user_profession != 'null'
        THEN 'profesional'
        ELSE 'client'
    END;
    
    RAISE LOG 'Role asignado: %', user_role;
    
    -- =========================================================================
    -- 4. INSERTAR EN PROFILES CON ESQUEMA REAL
    -- =========================================================================
    INSERT INTO public.profiles (
        user_id,
        full_name,
        email,
        phone,
        profession,
        experience,
        bio,
        work_zones,
        whatsapp,
        descripcion_perfil,
        role,
        membership_status,
        status,
        ubicacion_lat,
        ubicacion_lng,
        calificacion_promedio,
        experiencia_uber,
        años_experiencia_uber,
        areas_servicio
    ) VALUES (
        NEW.id,
        user_full_name,
        user_email,
        COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
        CASE WHEN user_role = 'profesional' THEN user_profession ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN 2 ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App') ELSE NULL END,
        CASE WHEN user_role = 'profesional' THEN COALESCE(NEW.raw_user_meta_data->>'work_zones', '{}')::text[] ELSE NULL END,
        COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
        CASE WHEN user_role = 'profesional' THEN COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App') ELSE NULL END,
        user_role,
        'free',
        'active',
        NULL,
        NULL,
        0,
        false,
        0,
        CASE WHEN user_role = 'profesional' THEN ARRAY[user_profession] ELSE NULL END
    );
    
    RAISE LOG 'Profile creado exitosamente con role: %', user_role;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- =========================================================================
        -- 5. MANEJO DE ERRORES
        -- =========================================================================
        RAISE LOG 'ERROR en handle_new_user: %', SQLERRM;
        RAISE LOG 'Error context: user_id=%, email=%, profession=%, role=%', 
                  NEW.id, user_email, user_profession, user_role;
        
        -- Intentar crear perfil básico como fallback
        BEGIN
            INSERT INTO public.profiles (
                user_id,
                full_name,
                email,
                role,
                membership_status,
                status
            ) VALUES (
                NEW.id,
                user_full_name,
                user_email,
                'client',
                'free',
                'active'
            );
            RAISE LOG 'Profile básico creado como fallback';
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
'Función corregida para manejar nuevos usuarios con el esquema real de la base de datos. Incluye logging detallado y manejo de errores robusto.';
