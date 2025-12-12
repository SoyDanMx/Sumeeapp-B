-- =========================================================================
-- OPTIMIZACIÓN DE RENDIMIENTO PARA LOGIN
-- =========================================================================
-- Este script verifica y crea índices necesarios para mejorar el rendimiento
-- del login y las consultas a la tabla profiles
-- =========================================================================

-- Verificar y crear índice en profiles.user_id (CRÍTICO para login)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' 
        AND indexname = 'idx_profiles_user_id'
    ) THEN
        CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
        RAISE NOTICE '✅ Índice idx_profiles_user_id creado';
    ELSE
        RAISE NOTICE '✅ Índice idx_profiles_user_id ya existe';
    END IF;
END $$;

-- Verificar y crear índice en profiles.role (para filtrado rápido)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' 
        AND indexname = 'idx_profiles_role'
    ) THEN
        CREATE INDEX idx_profiles_role ON public.profiles(role);
        RAISE NOTICE '✅ Índice idx_profiles_role creado';
    ELSE
        RAISE NOTICE '✅ Índice idx_profiles_role ya existe';
    END IF;
END $$;

-- Verificar y crear índice compuesto para consultas comunes (user_id + role)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' 
        AND indexname = 'idx_profiles_user_id_role'
    ) THEN
        CREATE INDEX idx_profiles_user_id_role ON public.profiles(user_id, role);
        RAISE NOTICE '✅ Índice compuesto idx_profiles_user_id_role creado';
    ELSE
        RAISE NOTICE '✅ Índice compuesto idx_profiles_user_id_role ya existe';
    END IF;
END $$;

-- Verificar estadísticas de la tabla
ANALYZE public.profiles;

-- Mostrar índices existentes en profiles
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
ORDER BY indexname;

