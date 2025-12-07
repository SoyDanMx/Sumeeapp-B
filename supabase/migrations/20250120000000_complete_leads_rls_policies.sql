-- =========================================================================
-- MIGRACIÓN: Políticas RLS Completas para Leads
-- =========================================================================
-- Esta migración completa las políticas RLS para permitir:
-- 1. Clientes: Crear, ver, actualizar y eliminar sus propios leads
-- 2. Profesionales: Ver leads disponibles y aceptar leads
-- 3. Admins: Acceso completo (opcional)
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASO 1: Eliminar políticas existentes para empezar limpio
-- =========================================================================

DROP POLICY IF EXISTS "authenticated_users_can_create_leads_v3" ON public.leads;
DROP POLICY IF EXISTS "anonymous_users_can_create_leads_v3" ON public.leads;
DROP POLICY IF EXISTS "Public users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "clients_can_create_leads" ON public.leads;
DROP POLICY IF EXISTS "clients_can_view_own_leads" ON public.leads;
DROP POLICY IF EXISTS "professionals_can_view_leads" ON public.leads;
DROP POLICY IF EXISTS "professionals_can_accept_leads" ON public.leads;

-- Asegurar que RLS esté habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- PASO 2: POLÍTICAS PARA CLIENTES
-- =========================================================================

-- Policy 1: Clientes autenticados pueden crear leads
-- Solo pueden crear leads donde ellos son el cliente_id
CREATE POLICY "clients_can_create_leads"
ON public.leads
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permite crear si cliente_id coincide con el usuario autenticado
  cliente_id = auth.uid()
  OR
  -- También permite si cliente_id es NULL (para flexibilidad inicial)
  cliente_id IS NULL
);

-- Policy 2: Clientes pueden ver sus propios leads
CREATE POLICY "clients_can_view_own_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  cliente_id = auth.uid()
);

-- Policy 3: Clientes pueden actualizar sus propios leads
-- Solo si el lead aún no ha sido aceptado por un profesional
CREATE POLICY "clients_can_update_own_pending_leads"
ON public.leads
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  cliente_id = auth.uid() 
  AND (estado = 'Nuevo' OR estado = 'nuevo' OR profesional_asignado_id IS NULL)
)
WITH CHECK (
  cliente_id = auth.uid()
  AND (estado = 'Nuevo' OR estado = 'nuevo' OR profesional_asignado_id IS NULL)
);

-- Policy 4: Clientes pueden eliminar sus propios leads pendientes
CREATE POLICY "clients_can_delete_own_pending_leads"
ON public.leads
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  cliente_id = auth.uid() 
  AND (estado = 'Nuevo' OR estado = 'nuevo' OR profesional_asignado_id IS NULL)
);

-- =========================================================================
-- PASO 3: POLÍTICAS PARA PROFESIONALES
-- =========================================================================

-- Policy 5: Profesionales pueden ver leads disponibles
-- (sin asignar) O los que están asignados a ellos
CREATE POLICY "professionals_can_view_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  -- Leads disponibles para todos los profesionales (estado = 'Nuevo' y sin asignar)
  (
    (estado = 'Nuevo' OR estado = 'nuevo')
    AND profesional_asignado_id IS NULL
  )
  OR
  -- Leads asignados a este profesional
  profesional_asignado_id = auth.uid()
  OR
  -- Si el usuario es profesional verificado, puede ver leads en su zona
  (
    (estado = 'Nuevo' OR estado = 'nuevo')
    AND profesional_asignado_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'profesional'
    )
  )
);

-- Policy 6: Profesionales pueden aceptar leads disponibles
-- Asignándose a sí mismos como profesional_asignado_id
CREATE POLICY "professionals_can_accept_leads"
ON public.leads
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  -- Solo leads pendientes sin profesional asignado
  (estado = 'Nuevo' OR estado = 'nuevo')
  AND profesional_asignado_id IS NULL
  -- Y el usuario debe ser un profesional verificado
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'profesional'
  )
)
WITH CHECK (
  -- Pueden cambiar el profesional_asignado_id a su propio ID
  profesional_asignado_id = auth.uid()
  -- Y actualizar el estado
  AND (estado IN ('Asignado', 'asignado', 'En Progreso', 'en_progreso'))
);

-- Policy 7: Profesionales pueden actualizar leads que tienen asignados
CREATE POLICY "professionals_can_update_assigned_leads"
ON public.leads
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  profesional_asignado_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'profesional'
  )
)
WITH CHECK (
  profesional_asignado_id = auth.uid()
);

-- =========================================================================
-- PASO 4: POLÍTICAS PARA USUARIOS ANÓNIMOS (Opcional)
-- =========================================================================

-- Policy 8: Usuarios anónimos pueden crear leads sin cliente_id
CREATE POLICY "anonymous_users_can_create_leads"
ON public.leads
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (
  -- Solo permite crear leads sin cliente_id (usuarios anónimos)
  cliente_id IS NULL
);

-- =========================================================================
-- PASO 5: POLÍTICAS PARA ADMINS (Opcional)
-- =========================================================================

-- Policy 9: Admins pueden ver todos los leads
-- Nota: Requiere tabla user_roles o campo role en profiles
CREATE POLICY "admins_can_view_all_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 10: Admins pueden hacer cualquier operación
CREATE POLICY "admins_can_modify_all_leads"
ON public.leads
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

COMMIT;

-- =========================================================================
-- VERIFICACIÓN
-- =========================================================================

-- Ver todas las policies de la tabla leads
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
WHERE tablename = 'leads'
ORDER BY policyname;

-- Contar policies activas
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'leads';

-- Verificar que RLS está habilitado
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN 'RLS Habilitado ✅'
    ELSE 'RLS Deshabilitado ❌'
  END as rls_status
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';




