-- =========================================================================
-- SCRIPT PARA CORREGIR LA TABLA PROFILES
-- =========================================================================
-- Este script verifica y corrige la estructura de la tabla profiles
-- para solucionar el error "Could not find the 'updated_at' column"

-- 1. VERIFICAR SI LA COLUMNA updated_at EXISTE
-- =========================================================================
DO $$
BEGIN
    -- Verificar si la columna updated_at existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        -- Agregar la columna updated_at si no existe
        ALTER TABLE public.profiles 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Columna updated_at agregada a la tabla profiles';
    ELSE
        RAISE NOTICE 'La columna updated_at ya existe en la tabla profiles';
    END IF;
END $$;

-- 2. VERIFICAR SI LA COLUMNA created_at EXISTE
-- =========================================================================
DO $$
BEGIN
    -- Verificar si la columna created_at existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        -- Agregar la columna created_at si no existe
        ALTER TABLE public.profiles 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Columna created_at agregada a la tabla profiles';
    ELSE
        RAISE NOTICE 'La columna created_at ya existe en la tabla profiles';
    END IF;
END $$;

-- 3. VERIFICAR ESTRUCTURA COMPLETA DE LA TABLA PROFILES
-- =========================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. ACTUALIZAR REGISTROS EXISTENTES CON TIMESTAMPS
-- =========================================================================
UPDATE public.profiles 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

-- 5. CREAR TRIGGER PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =========================================================================
-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. VERIFICAR POLÍTICAS RLS
-- =========================================================================
-- Verificar si existe la política de UPDATE
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
AND cmd = 'UPDATE';

-- 7. CREAR POLÍTICA RLS SI NO EXISTE
-- =========================================================================
-- Crear política de UPDATE si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
        AND policyname = 'users_can_update_own_profile'
    ) THEN
        CREATE POLICY "users_can_update_own_profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Política RLS de UPDATE creada para profiles';
    ELSE
        RAISE NOTICE 'La política RLS de UPDATE ya existe para profiles';
    END IF;
END $$;

-- 8. COMENTARIOS FINALES
-- =========================================================================
COMMENT ON TABLE public.profiles IS 'Tabla base para todos los usuarios (clientes y profesionales)';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp de última actualización del perfil';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp de creación del perfil';

-- =========================================================================
-- INSTRUCCIONES DE USO
-- =========================================================================
-- 1. Ejecutar este script en el SQL Editor de Supabase
-- 2. Verificar que no hay errores en la ejecución
-- 3. Probar la actualización de perfil desde la aplicación
-- =========================================================================
