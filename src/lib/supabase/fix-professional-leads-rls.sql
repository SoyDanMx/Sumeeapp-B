-- =========================================================================
-- CORRECCIÓN: Política RLS para que profesionales puedan ver leads nuevos
-- =========================================================================
-- Este script crea/actualiza la política RLS para que los profesionales
-- autenticados puedan ver leads con estado 'nuevo' (disponibles para aceptar)

-- PASO 1: Eliminar políticas conflictivas existentes (si las hay)
DROP POLICY IF EXISTS "Professionals can view new leads" ON public.leads;
DROP POLICY IF EXISTS "Professionals can view available leads" ON public.leads;

-- PASO 2: Crear política para que profesionales puedan ver leads nuevos
-- Los profesionales pueden ver:
-- 1. Leads con estado 'nuevo' (disponibles para aceptar)
-- 2. Leads que tienen asignados (profesional_asignado_id = auth.uid())
CREATE POLICY "Professionals can view new and assigned leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  -- Pueden ver leads nuevos (disponibles para aceptar)
  estado = 'nuevo' OR
  -- O leads que tienen asignados
  profesional_asignado_id = auth.uid()
);

-- PASO 3: Verificar que la política se creó correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as "USING clause"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
  AND policyname = 'Professionals can view new and assigned leads';

-- PASO 4: Verificar que RLS está habilitado
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';

-- =========================================================================
-- NOTAS IMPORTANTES:
-- =========================================================================
-- 1. Esta política permite que profesionales autenticados vean:
--    - Todos los leads con estado 'nuevo' (para aceptar)
--    - Leads que tienen asignados (para gestionar)
--
-- 2. Los clientes pueden ver sus propios leads mediante la política:
--    "Users can view their own leads" (cliente_id = auth.uid())
--
-- 3. Si necesitas restringir más (por ejemplo, por ubicación), puedes
--    agregar condiciones adicionales en la cláusula USING

