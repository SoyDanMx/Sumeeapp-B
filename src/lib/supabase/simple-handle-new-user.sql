-- =========================================================================
-- TRIGGER SIMPLIFICADO Y ROBUSTO
-- =========================================================================
-- Esta versión es más simple y menos propensa a errores

-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear función simplificada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text := 'client';
    user_full_name text;
    user_profession text;
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN SEGURA DE DATOS
    -- =========================================================================
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    
    -- =========================================================================
    -- 2. DETERMINAR ROL
    -- =========================================================================
    -- Solo asignar 'profesional' si hay profession válida
    IF user_profession IS NOT NULL AND user_profession != '' AND user_profession != 'null' THEN
        user_role := 'profesional';
    END IF;
    
    -- =========================================================================
    -- 3. INSERTAR PERFIL BÁSICO
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
        NEW.email,
        NOW(),
        NOW()
    );
    
    -- =========================================================================
    -- 4. CREAR DATOS DE PROFESIONAL SI ES NECESARIO
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
            user_profession,
            COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
            COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App'),
            ARRAY[user_profession],
            2,
            'disponible',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar el registro
        RAISE LOG 'Error en handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- VERIFICAR QUE LAS TABLAS EXISTAN
-- =========================================================================
-- Ejecutar estas consultas para verificar que las tablas existen:

-- Verificar tabla profiles
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public';

-- Verificar tabla profesionales  
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profesionales' AND table_schema = 'public';

-- =========================================================================
-- COMENTARIOS
-- =========================================================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función simplificada para crear perfiles de usuario. Maneja errores sin fallar el registro.';
