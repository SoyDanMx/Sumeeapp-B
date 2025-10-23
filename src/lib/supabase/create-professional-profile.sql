-- =========================================================================
-- FUNCIÓN RPC PARA CREAR PERFIL PROFESIONAL DE FORMA TRANSACCIONAL
-- =========================================================================
-- Esta función garantiza que el usuario y su perfil se creen de forma atómica
-- o que no se cree ninguno si algo falla.
-- =========================================================================

-- Eliminar la función si existe
DROP FUNCTION IF EXISTS create_professional_profile(text, text, text, text, text, text);

-- Crear la función RPC
CREATE OR REPLACE FUNCTION create_professional_profile(
    p_full_name text,
    p_email text,
    p_password text,
    p_profession text DEFAULT 'General',
    p_whatsapp text DEFAULT '',
    p_descripcion_perfil text DEFAULT 'Profesional verificado en Sumee App'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid;
    v_profile_id uuid;
    v_professional_id uuid;
    v_result json;
BEGIN
    -- Iniciar transacción implícita
    BEGIN
        -- 1. Crear usuario en auth.users usando la función de Supabase
        -- Nota: En Supabase, no podemos insertar directamente en auth.users
        -- Por lo tanto, usaremos una estrategia diferente:
        -- 1. Crear el usuario usando auth.signup() desde el cliente
        -- 2. Usar esta función solo para crear el perfil
        
        -- Verificar que el email no existe ya
        IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
            RETURN json_build_object(
                'success', false,
                'error', 'El email ya está registrado',
                'code', 'EMAIL_EXISTS'
            );
        END IF;
        
        -- Verificar que el email no existe en profiles
        IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email) THEN
            RETURN json_build_object(
                'success', false,
                'error', 'El email ya está registrado en profiles',
                'code', 'PROFILE_EXISTS'
            );
        END IF;
        
        -- Esta función será llamada DESPUÉS de que el usuario se haya creado en auth.users
        -- Obtener el user_id del usuario recién creado
        SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
        
        IF v_user_id IS NULL THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Usuario no encontrado en auth.users',
                'code', 'USER_NOT_FOUND'
            );
        END IF;
        
        -- 2. Crear perfil en public.profiles
        INSERT INTO public.profiles (
            user_id,
            role,
            full_name,
            email,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            'profesional',
            p_full_name,
            p_email,
            NOW(),
            NOW()
        ) RETURNING id INTO v_profile_id;
        
        -- 3. Crear datos específicos de profesional en public.profesionales
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
            v_user_id,
            p_profession,
            p_whatsapp,
            p_descripcion_perfil,
            ARRAY[p_profession],
            2, -- Años de experiencia por defecto
            'disponible',
            NOW(),
            NOW()
        ) RETURNING id INTO v_professional_id;
        
        -- 4. Retornar resultado exitoso
        v_result := json_build_object(
            'success', true,
            'user_id', v_user_id,
            'profile_id', v_profile_id,
            'professional_id', v_professional_id,
            'message', 'Perfil profesional creado exitosamente'
        );
        
        RETURN v_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- En caso de error, la transacción se revierte automáticamente
            RETURN json_build_object(
                'success', false,
                'error', SQLERRM,
                'code', 'DATABASE_ERROR',
                'detail', 'Error al crear perfil profesional: ' || SQLERRM
            );
    END;
END;
$$;

-- =========================================================================
-- FUNCIÓN ALTERNATIVA: CREAR USUARIO Y PERFIL COMPLETO
-- =========================================================================
-- Esta función maneja todo el proceso desde el frontend
-- =========================================================================

CREATE OR REPLACE FUNCTION create_professional_complete(
    p_full_name text,
    p_email text,
    p_password text,
    p_profession text DEFAULT 'General',
    p_whatsapp text DEFAULT '',
    p_descripcion_perfil text DEFAULT 'Profesional verificado en Sumee App'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid;
    v_profile_id uuid;
    v_professional_id uuid;
    v_result json;
BEGIN
    -- Esta función será llamada DESPUÉS de que el usuario se haya creado y confirmado
    -- Obtener el user_id del usuario actual (autenticado)
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuario no autenticado',
            'code', 'NOT_AUTHENTICATED'
        );
    END IF;
    
    -- Verificar que el usuario no tenga ya un perfil
    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El usuario ya tiene un perfil',
            'code', 'PROFILE_EXISTS'
        );
    END IF;
    
    BEGIN
        -- 1. Crear perfil en public.profiles
        INSERT INTO public.profiles (
            user_id,
            role,
            full_name,
            email,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            'profesional',
            p_full_name,
            p_email,
            NOW(),
            NOW()
        ) RETURNING id INTO v_profile_id;
        
        -- 2. Crear datos específicos de profesional en public.profesionales
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
            v_user_id,
            p_profession,
            p_whatsapp,
            p_descripcion_perfil,
            ARRAY[p_profession],
            2, -- Años de experiencia por defecto
            'disponible',
            NOW(),
            NOW()
        ) RETURNING id INTO v_professional_id;
        
        -- 3. Retornar resultado exitoso
        v_result := json_build_object(
            'success', true,
            'user_id', v_user_id,
            'profile_id', v_profile_id,
            'professional_id', v_professional_id,
            'message', 'Perfil profesional creado exitosamente'
        );
        
        RETURN v_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- En caso de error, la transacción se revierte automáticamente
            RETURN json_build_object(
                'success', false,
                'error', SQLERRM,
                'code', 'DATABASE_ERROR',
                'detail', 'Error al crear perfil profesional: ' || SQLERRM
            );
    END;
END;
$$;

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON FUNCTION create_professional_profile IS 'Crea un perfil profesional de forma transaccional';
COMMENT ON FUNCTION create_professional_complete IS 'Crea perfil profesional para usuario autenticado';

-- =========================================================================
-- POLÍTICAS RLS NECESARIAS
-- =========================================================================
-- Las funciones RPC con SECURITY DEFINER ejecutan con permisos de postgres
-- Por lo tanto, no necesitan políticas RLS específicas para INSERT
-- Sin embargo, asegúrate de que las políticas existentes permitan:
-- - SELECT en auth.users para verificar existencia
-- - INSERT en public.profiles y public.profesionales

-- Verificar que las políticas RLS existentes permitan las operaciones necesarias
-- Si no existen, crear las siguientes políticas:

-- Política para permitir que la función RPC inserte en profiles
CREATE POLICY IF NOT EXISTS "RPC functions can insert profiles" ON public.profiles
    FOR INSERT
    TO postgres
    WITH CHECK (true);

-- Política para permitir que la función RPC inserte en profesionales  
CREATE POLICY IF NOT EXISTS "RPC functions can insert profesionales" ON public.profesionales
    FOR INSERT
    TO postgres
    WITH CHECK (true);

-- Política para permitir que la función RPC lea auth.users
-- (Esta política puede no ser necesaria ya que SECURITY DEFINER otorga permisos de postgres)
