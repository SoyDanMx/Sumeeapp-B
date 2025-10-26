-- =========================================================================
-- SCRIPT RÁPIDO PARA CORREGIR TABLA PROFILES
-- =========================================================================
-- Ejecutar este script en Supabase SQL Editor para solucionar el error
-- "Could not find the 'updated_at' column"

-- 1. AGREGAR COLUMNA updated_at SI NO EXISTE
-- =========================================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. AGREGAR COLUMNA created_at SI NO EXISTE
-- =========================================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. ACTUALIZAR REGISTROS EXISTENTES
-- =========================================================================
UPDATE public.profiles 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

-- 4. CREAR TRIGGER PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
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

-- 5. VERIFICAR ESTRUCTURA DE LA TABLA
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

-- 6. CREAR POLÍTICA RLS PARA UPDATE SI NO EXISTE
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

-- =========================================================================
-- INSTRUCCIONES:
-- 1. Copiar todo este script
-- 2. Pegarlo en Supabase SQL Editor
-- 3. Ejecutar
-- 4. Verificar que no hay errores
-- 5. Probar la edición de perfil en la aplicación
-- =========================================================================
