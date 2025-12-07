-- =========================================================================
-- MIGRACIÓN: Limpieza de Políticas RLS Duplicadas
-- =========================================================================
-- Este script elimina políticas duplicadas y mantiene solo las necesarias
-- Basado en las políticas creadas en 20250120000000_complete_leads_rls_policies.sql
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASO 1: Eliminar políticas duplicadas de INSERT
-- =========================================================================

-- Mantener: clients_can_create_leads, anonymous_users_can_create_leads
-- Eliminar duplicados:
DROP POLICY IF EXISTS "allow_create_lead_for_anonymous" ON public.leads;
DROP POLICY IF EXISTS "allow_create_lead_for_authenticated" ON public.leads;

-- =========================================================================
-- PASO 2: Eliminar políticas duplicadas de SELECT
-- =========================================================================

-- Mantener: clients_can_view_own_leads, professionals_can_view_leads, admins_can_view_all_leads
-- Eliminar duplicados:
DROP POLICY IF EXISTS "Professionals can view new and assigned leads" ON public.leads;
DROP POLICY IF EXISTS "customers_select_own_leads" ON public.leads;

-- =========================================================================
-- PASO 3: Eliminar políticas duplicadas de UPDATE
-- =========================================================================

-- Mantener: 
--   - clients_can_update_own_pending_leads
--   - professionals_can_accept_leads
--   - professionals_can_update_assigned_leads
-- Eliminar duplicados:
DROP POLICY IF EXISTS "customers_update_own_leads" ON public.leads;
-- Nota: customers_update_photos puede ser específica para fotos, la mantenemos por ahora

-- =========================================================================
-- PASO 4: Eliminar políticas duplicadas de DELETE
-- =========================================================================

-- Mantener: clients_can_delete_own_pending_leads
-- Eliminar duplicados:
DROP POLICY IF EXISTS "customers_delete_own_leads" ON public.leads;
-- Nota: customers_delete_photos puede ser específica para fotos, la mantenemos por ahora

COMMIT;

-- =========================================================================
-- VERIFICACIÓN: Ver políticas finales
-- =========================================================================

-- Ver todas las policies de la tabla leads (sin duplicados)
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

-- Resumen final
SELECT 
  COUNT(*) as total_policies_finales,
  COUNT(DISTINCT cmd) as tipos_de_operaciones
FROM pg_policies
WHERE tablename = 'leads';




