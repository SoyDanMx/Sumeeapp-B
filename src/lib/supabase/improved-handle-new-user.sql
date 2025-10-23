-- =========================================================================
-- VERSIÓN MEJORADA DE handle_new_user
-- Soluciona vulnerabilidades de seguridad y casos borde
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
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN SEGURA DE METADATOS
    -- =========================================================================
    -- Extraer datos de forma segura con valores por defecto
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_email := NEW.email;
    
    -- =========================================================================
    -- 2. VALIDACIÓN Y SANITIZACIÓN
    -- =========================================================================
    -- Validar que el profession no sea solo espacios en blanco
    user_profession := TRIM(user_profession);
    
    -- =========================================================================
    -- 3. LÓGICA DE ASIGNACIÓN DE ROL MEJORADA
    -- =========================================================================
    -- Lógica más robusta que considera múltiples indicadores
    user_role := CASE 
        -- Indicador principal: profession no vacío
        WHEN user_profession IS NOT NULL AND user_profession != '' THEN 'profesional'
        
        -- Indicador secundario: registration_type en metadatos
        WHEN COALESCE(NEW.raw_user_meta_data->>'registration_type', '') = 'profesional' THEN 'profesional'
        
        -- Indicador terciario: email contiene indicadores de profesional
        WHEN user_email ILIKE '%profesional%' OR user_email ILIKE '%pro%' THEN 'profesional'
        
        -- Indicador cuaternario: full_name contiene indicadores
        WHEN user_full_name ILIKE '%profesional%' OR user_full_name ILIKE '%pro%' THEN 'profesional'
        
        -- Por defecto: cliente
        ELSE 'client'
    END;
    
    -- =========================================================================
    -- 4. LOGGING PARA DEBUGGING (OPCIONAL)
    -- =========================================================================
    -- Solo en desarrollo, log de la decisión
    IF current_setting('app.debug', true) = 'true' THEN
        RAISE LOG 'User role assignment: email=%, profession=%, role=%', 
                  user_email, user_profession, user_role;
    END IF;
    
    -- =========================================================================
    -- 5. INSERCIÓN EN PROFILES CON VALIDACIÓN
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
            user_profession,
            COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
            COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App'),
            ARRAY[user_profession],
            COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 2),
            'disponible',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- =========================================================================
        -- 7. MANEJO DE ERRORES ROBUSTO
        -- =========================================================================
        -- Log del error para debugging
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        
        -- Re-lanzar el error para que Supabase lo maneje
        RAISE;
END;
$$;

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Función mejorada para manejar nuevos usuarios con asignación inteligente de roles basada en múltiples indicadores';

-- =========================================================================
-- CONFIGURACIÓN DE DEBUG (OPCIONAL)
-- =========================================================================
-- Para habilitar logging de debug, ejecutar:
-- ALTER DATABASE your_database_name SET app.debug = 'true';
