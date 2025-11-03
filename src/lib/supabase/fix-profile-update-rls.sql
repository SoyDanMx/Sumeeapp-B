-- =========================================================================
-- SCRIPT PARA CORREGIR POLÍTICAS RLS DE UPDATE/UPSERT EN PROFILES
-- =========================================================================
-- Este script corrige el error "new row violates row-level security policy"
-- cuando los profesionales intentan actualizar su perfil

-- =========================================================================
-- 1. ELIMINAR POLÍTICAS CONFLICTIVAS DE UPDATE/UPSERT
-- =========================================================================
-- Primero, eliminamos políticas que puedan estar causando conflictos

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON public.profiles;

-- =========================================================================
-- 2. CREAR POLÍTICA RLS PERMISIVA PARA UPDATE
-- =========================================================================
-- Política que permite a usuarios autenticados actualizar su propio perfil

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 3. CREAR POLÍTICA RLS PARA UPSERT (INSERT OR UPDATE)
-- =========================================================================
-- Política que permite UPSERT siempre que el user_id coincida con auth.uid()

CREATE POLICY "Users can upsert their own profile" ON public.profiles
    FOR ALL  -- Permite tanto INSERT como UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 4. VERIFICAR QUE LAS POLÍTICAS FUERON CREADAS
-- =========================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
AND (cmd = 'UPDATE' OR cmd = 'ALL')
ORDER BY policyname;

-- =========================================================================
-- 5. COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
'Permite a usuarios autenticados actualizar su propio perfil. Solo pueden actualizar filas donde user_id = auth.uid()';

COMMENT ON POLICY "Users can upsert their own profile" ON public.profiles IS 
'Permite a usuarios autenticados hacer INSERT o UPDATE de su propio perfil. Útil para operaciones UPSERT.';

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. Las políticas usan auth.uid() para verificar que el usuario solo puede
--    modificar su propio perfil
-- 2. La política de UPSERT permite tanto INSERT como UPDATE
-- 3. Si hay conflictos, la política más específica (UPDATE) tiene prioridad
-- 4. Asegúrate de que RLS esté habilitado en la tabla: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

