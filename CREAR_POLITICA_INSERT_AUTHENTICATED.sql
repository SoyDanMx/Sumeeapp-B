-- =========================================================================
-- SCRIPT SIMPLE: Crear política INSERT para authenticated
-- =========================================================================
-- Este script crea la política faltante para usuarios autenticados
-- =========================================================================

-- Eliminar política existente si existe (por si acaso)
DROP POLICY IF EXISTS "cliente_puede_crear_leads" ON public.leads;
DROP POLICY IF EXISTS "clients_can_create_leads" ON public.leads;
DROP POLICY IF EXISTS "authenticated_users_can_create_leads" ON public.leads;

-- Crear política para usuarios autenticados
CREATE POLICY "cliente_puede_crear_leads"
ON public.leads
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permite crear si cliente_id coincide con el usuario autenticado
  cliente_id = auth.uid()
  OR
  -- También permite si cliente_id es NULL (para flexibilidad)
  cliente_id IS NULL
);

-- Verificar que se creó correctamente
SELECT 
  'VERIFICACIÓN' as tipo,
  policyname,
  cmd,
  roles,
  roles::text as roles_text
FROM pg_policies
WHERE tablename = 'leads'
  AND policyname = 'cliente_puede_crear_leads';




