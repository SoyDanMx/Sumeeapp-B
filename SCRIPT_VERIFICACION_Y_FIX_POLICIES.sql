-- =========================================================================
-- SCRIPT: Verificación y Fix de Políticas RLS Faltantes
-- =========================================================================
-- Este script verifica qué políticas faltan y las crea
-- =========================================================================

-- Verificar políticas actuales
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY cmd, policyname;

-- =========================================================================
-- CREAR POLÍTICAS FALTANTES
-- =========================================================================

BEGIN;

-- Policy 1: Clientes autenticados pueden crear leads (FALTA)
CREATE POLICY IF NOT EXISTS "clients_can_create_leads"
ON public.leads
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  cliente_id = auth.uid()
  OR
  cliente_id IS NULL
);

-- Policy 2: Clientes pueden ver sus propios leads (FALTA)
CREATE POLICY IF NOT EXISTS "clients_can_view_own_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  cliente_id = auth.uid()
);

-- Policy 3: Profesionales pueden ver leads disponibles (FALTA)
CREATE POLICY IF NOT EXISTS "professionals_can_view_leads"
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

-- Policy 4: Profesionales pueden aceptar leads disponibles (FALTA)
CREATE POLICY IF NOT EXISTS "professionals_can_accept_leads"
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

COMMIT;

-- =========================================================================
-- VERIFICACIÓN FINAL
-- =========================================================================

SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN cmd = 'INSERT' THEN '✅ Crear leads'
    WHEN cmd = 'SELECT' THEN '✅ Ver leads'
    WHEN cmd = 'UPDATE' THEN '✅ Actualizar leads'
    WHEN cmd = 'DELETE' THEN '✅ Eliminar leads'
    WHEN cmd = 'ALL' THEN '✅ Admins (todas las operaciones)'
    ELSE cmd
  END as descripcion
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

-- Contar políticas por tipo
SELECT 
  cmd,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'leads'
GROUP BY cmd
ORDER BY 
  CASE cmd
    WHEN 'INSERT' THEN 1
    WHEN 'SELECT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    WHEN 'ALL' THEN 5
    ELSE 6
  END;




