-- =========================================================================
-- SCRIPT 3: Limpieza de Políticas RLS Duplicadas (CORREGIDO)
-- =========================================================================
-- Copia y pega este script COMPLETO en Supabase SQL Editor
-- =========================================================================

BEGIN;

-- Eliminar políticas duplicadas de INSERT
DROP POLICY IF EXISTS "allow_create_lead_for_anonymous" ON public.leads;
DROP POLICY IF EXISTS "allow_create_lead_for_authenticated" ON public.leads;

-- Eliminar políticas duplicadas de SELECT
DROP POLICY IF EXISTS "Professionals can view new and assigned leads" ON public.leads;
DROP POLICY IF EXISTS "customers_select_own_leads" ON public.leads;

-- Eliminar políticas duplicadas de UPDATE
DROP POLICY IF EXISTS "customers_update_own_leads" ON public.leads;

-- Eliminar políticas duplicadas de DELETE
DROP POLICY IF EXISTS "customers_delete_own_leads" ON public.leads;

COMMIT;

-- =========================================================================
-- VERIFICACIÓN: Ver políticas finales
-- =========================================================================

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




