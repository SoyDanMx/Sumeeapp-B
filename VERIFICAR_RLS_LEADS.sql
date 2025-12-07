-- =========================================================================
-- VERIFICAR POLÍTICAS RLS EN TABLA LEADS
-- =========================================================================
-- Las políticas RLS pueden estar bloqueando el INSERT
-- =========================================================================

-- Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'leads';

-- Ver todas las políticas RLS en la tabla leads
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'leads'
ORDER BY policyname;

-- Verificar permisos del usuario actual
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND grantee = current_user;

-- =========================================================================
-- Si hay políticas RLS que bloquean INSERT, necesitamos:
-- 1. Verificar que el usuario tenga permisos
-- 2. O crear una política que permita INSERT a usuarios autenticados
-- =========================================================================



