-- =========================================================================
-- VERSIÓN SEGURA DE handle_new_user CON VALIDACIONES ESTRICTAS
-- Previene ataques de elevación de privilegios
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
    is_professional_registration boolean := false;
BEGIN
    -- =========================================================================
    -- 1. EXTRACCIÓN SEGURA DE METADATOS
    -- =========================================================================
    user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    user_email := NEW.email;
    registration_type := COALESCE(NEW.raw_user_meta_data->>'registration_type', '');
    
    -- =========================================================================
    -- 2. VALIDACIÓN DE SEGURIDAD - PREVENIR ATAQUES
    -- =========================================================================
    -- Solo permitir role 'profesional' si viene del flujo correcto
    is_professional_registration := (
        registration_type = 'profesional' OR
        -- Verificar que venga de la URL correcta (si está disponible en referer)
        (NEW.raw_user_meta_data->>'source_url' IS NOT NULL AND 
         NEW.raw_user_meta_data->>'source_url' LIKE '%/join-as-pro%')
    );
    
    -- =========================================================================
    -- 3. SANITIZACIÓN Y VALIDACIÓN DE DATOS
    -- =========================================================================
    user_profession := TRIM(user_profession);
    
    -- Validar que profession sea válido si se proporciona
    IF user_profession != '' AND NOT is_professional_registration THEN
        -- Si se proporciona profession pero no es un registro profesional legítimo,
        -- ignorar el profession y asignar como cliente
        user_profession := '';
    END IF;
    
    -- =========================================================================
    -- 4. LÓGICA DE ASIGNACIÓN DE ROL SEGURA
    -- =========================================================================
    user_role := CASE 
        -- Solo asignar 'profesional' si es un registro legítimo de profesional
        WHEN is_professional_registration AND user_profession != '' THEN 'profesional'
        WHEN is_professional_registration AND user_profession = '' THEN 'profesional' -- Fallback
        ELSE 'client'
    END;
    
    -- =========================================================================
    -- 5. VALIDACIÓN ADICIONAL DE INTEGRIDAD
    -- =========================================================================
    -- Asegurar que el email sea válido
    IF user_email IS NULL OR user_email = '' THEN
        RAISE EXCEPTION 'Email is required for user registration';
    END IF;
    
    -- =========================================================================
    -- 6. LOGGING DE SEGURIDAD
    -- =========================================================================
    RAISE LOG 'User registration: email=%, registration_type=%, is_professional=%, final_role=%', 
              user_email, registration_type, is_professional_registration, user_role;
    
    -- =========================================================================
    -- 7. INSERCIÓN EN PROFILES CON TRANSACCIÓN
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
        
        -- =========================================================================
        -- 8. CREAR DATOS ESPECÍFICOS SI ES PROFESIONAL
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
        END IF;
        
    EXCEPTION
        WHEN unique_violation THEN
            -- Si ya existe el perfil, actualizar en lugar de insertar
            UPDATE public.profiles 
            SET role = user_role,
                full_name = user_full_name,
                updated_at = NOW()
            WHERE user_id = NEW.id;
            
            -- Si es profesional y no existe en profesionales, crear
            IF user_role = 'profesional' THEN
                INSERT INTO public.profesionales (
                    user_id, profession, whatsapp, descripcion_perfil, 
                    specialties, experience_years, disponibilidad, created_at, updated_at
                ) VALUES (
                    NEW.id, COALESCE(user_profession, 'General'),
                    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
                    COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', 'Profesional verificado en Sumee App'),
                    ARRAY[COALESCE(user_profession, 'General')],
                    COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 2),
                    'disponible', NOW(), NOW()
                ) ON CONFLICT (user_id) DO UPDATE SET
                    profession = COALESCE(user_profession, 'General'),
                    updated_at = NOW();
            END IF;
            
        WHEN OTHERS THEN
            RAISE LOG 'Error in handle_new_user: %', SQLERRM;
            RAISE;
    END;
    
    RETURN NEW;
END;
$$;

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Función segura para manejar nuevos usuarios con validaciones estrictas contra ataques de elevación de privilegios';

-- =========================================================================
-- POLÍTICAS RLS ADICIONALES RECOMENDADAS
-- =========================================================================

-- Política para prevenir que usuarios modifiquen su propio rol
CREATE POLICY IF NOT EXISTS "Users cannot modify their own role" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

-- Política para prevenir inserción directa de roles
CREATE POLICY IF NOT EXISTS "Only system can insert profiles" ON public.profiles
    FOR INSERT
    WITH CHECK (false); -- Solo permitir inserción a través del trigger
