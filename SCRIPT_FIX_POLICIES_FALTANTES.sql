-- =========================================================================
-- SCRIPT: Agregar Políticas RLS Faltantes (VERSIÓN SIMPLE)
-- =========================================================================
-- Copia y pega este script COMPLETO en Supabase SQL Editor
-- =========================================================================

BEGIN;

-- Eliminar políticas si existen (para evitar errores)
DROP POLICY IF EXISTS "clients_can_create_leads" ON public.leads;
DROP POLICY IF EXISTS "clients_can_view_own_leads" ON public.leads;
DROP POLICY IF EXISTS "professionals_can_view_leads" ON public.leads;
DROP POLICY IF EXISTS "professionals_can_accept_leads" ON public.leads;

-- Policy 1: Clientes autenticados pueden crear leads
CREATE POLICY "clients_can_create_leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  cliente_id = auth.uid()
  OR
  cliente_id IS NULL
);

-- Policy 2: Clientes pueden ver sus propios leads
CREATE POLICY "clients_can_view_own_leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  cliente_id = auth.uid()
);

-- Policy 3: Profesionales pueden ver leads disponibles
CREATE POLICY "professionals_can_view_leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  (
    (estado = 'Nuevo' OR estado = 'nuevo')
    AND profesional_asignado_id IS NULL
  )
  OR
  profesional_asignado_id = auth.uid()
  OR
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

-- Policy 4: Profesionales pueden aceptar leads disponibles
CREATE POLICY "professionals_can_accept_leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  (estado = 'Nuevo' OR estado = 'nuevo')
  AND profesional_asignado_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'profesional'
  )
)
WITH CHECK (
  profesional_asignado_id = auth.uid()
  AND (estado IN ('Asignado', 'asignado', 'En Progreso', 'en_progreso'))
);

COMMIT;

-- Verificación: Ver todas las políticas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY 
  CASE cmd
    WHEN 'INSERT' THEN 1
    WHEN 'SELECT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    WHEN 'ALL' THEN 5
    ELSE 6
  END,
  policyname;

