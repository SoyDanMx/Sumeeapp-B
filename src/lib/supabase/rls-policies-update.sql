-- =========================================================================
-- ACTUALIZACIÓN DE POLÍTICAS RLS PARA FUNCIONES RPC
-- =========================================================================
-- Estas políticas permiten que las funciones RPC con SECURITY DEFINER
-- puedan realizar las operaciones necesarias de forma segura.
-- =========================================================================

-- =========================================================================
-- POLÍTICAS PARA TABLA PROFILES
-- =========================================================================

-- Política para permitir que las funciones RPC inserten en profiles
CREATE POLICY IF NOT EXISTS "RPC functions can insert profiles" ON public.profiles
    FOR INSERT
    TO postgres
    WITH CHECK (true);

-- Política para permitir que las funciones RPC actualicen profiles
CREATE POLICY IF NOT EXISTS "RPC functions can update profiles" ON public.profiles
    FOR UPDATE
    TO postgres
    USING (true)
    WITH CHECK (true);

-- Política para permitir que las funciones RPC lean profiles
CREATE POLICY IF NOT EXISTS "RPC functions can select profiles" ON public.profiles
    FOR SELECT
    TO postgres
    USING (true);

-- =========================================================================
-- POLÍTICAS PARA TABLA PROFESIONALES
-- =========================================================================

-- Política para permitir que las funciones RPC inserten en profesionales
CREATE POLICY IF NOT EXISTS "RPC functions can insert profesionales" ON public.profesionales
    FOR INSERT
    TO postgres
    WITH CHECK (true);

-- Política para permitir que las funciones RPC actualicen profesionales
CREATE POLICY IF NOT EXISTS "RPC functions can update profesionales" ON public.profesionales
    FOR UPDATE
    TO postgres
    USING (true)
    WITH CHECK (true);

-- Política para permitir que las funciones RPC lean profesionales
CREATE POLICY IF NOT EXISTS "RPC functions can select profesionales" ON public.profesionales
    FOR SELECT
    TO postgres
    USING (true);

-- =========================================================================
-- POLÍTICAS PARA TABLA LEADS
-- =========================================================================

-- Política para permitir que las funciones RPC inserten en leads
CREATE POLICY IF NOT EXISTS "RPC functions can insert leads" ON public.leads
    FOR INSERT
    TO postgres
    WITH CHECK (true);

-- Política para permitir que las funciones RPC actualicen leads
CREATE POLICY IF NOT EXISTS "RPC functions can update leads" ON public.leads
    FOR UPDATE
    TO postgres
    USING (true)
    WITH CHECK (true);

-- Política para permitir que las funciones RPC lean leads
CREATE POLICY IF NOT EXISTS "RPC functions can select leads" ON public.leads
    FOR SELECT
    TO postgres
    USING (true);

-- =========================================================================
-- VERIFICACIÓN DE POLÍTICAS EXISTENTES
-- =========================================================================

-- Verificar que las políticas de usuario existentes no interfieran
-- Las siguientes políticas deben seguir existiendo para usuarios normales:

-- Política para usuarios autenticados en profiles
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para usuarios autenticados en profesionales
CREATE POLICY IF NOT EXISTS "Professionals can view their own data" ON public.profesionales
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Professionals can update their own data" ON public.profesionales
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Professionals can insert their own data" ON public.profesionales
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para usuarios autenticados en leads
CREATE POLICY IF NOT EXISTS "Users can view their own leads" ON public.leads
    FOR SELECT
    USING (auth.uid() = cliente_id OR auth.uid() = profesional_asignado_id);

CREATE POLICY IF NOT EXISTS "Users can create leads" ON public.leads
    FOR INSERT
    WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY IF NOT EXISTS "Professionals can update assigned leads" ON public.leads
    FOR UPDATE
    USING (auth.uid() = profesional_asignado_id);

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON POLICY "RPC functions can insert profiles" ON public.profiles IS 'Permite que las funciones RPC inserten perfiles';
COMMENT ON POLICY "RPC functions can insert profesionales" ON public.profesionales IS 'Permite que las funciones RPC inserten datos de profesionales';
COMMENT ON POLICY "RPC functions can insert leads" ON public.leads IS 'Permite que las funciones RPC inserten leads';

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. Las funciones RPC con SECURITY DEFINER ejecutan con permisos de postgres
-- 2. Las políticas RPC son necesarias para permitir operaciones desde las funciones
-- 3. Las políticas de usuario siguen siendo necesarias para operaciones normales
-- 4. No hay conflicto entre las políticas RPC y las políticas de usuario
-- 5. Las funciones RPC pueden realizar operaciones que los usuarios normales no pueden
