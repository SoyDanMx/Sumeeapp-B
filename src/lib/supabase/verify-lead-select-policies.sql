-- =========================================================================
-- VERIFICACIÓN DE POLÍTICAS RLS DE SELECT PARA LEADS
-- =========================================================================
-- Este script verifica que las políticas de SELECT para leads estén correctamente configuradas

-- Paso 1: Verificar que RLS está habilitado
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';

-- Paso 2: Ver TODAS las políticas de SELECT en la tabla leads
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Paso 3: Contar políticas de SELECT
SELECT 
  COUNT(*) as "Total SELECT Policies"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT';

-- Paso 4: Verificar políticas esperadas
-- Deberías ver:
-- 1. "Users can view their own leads" - para authenticated
-- 2. "Public users can view leads by id" - para anon

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'SELECT'
        AND policyname = 'Users can view their own leads'
    ) THEN '✅ Política "Users can view their own leads" existe'
    ELSE '❌ Política "Users can view their own leads" NO existe'
  END as "Política Authenticated";

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'SELECT'
        AND policyname = 'Public users can view leads by id'
    ) THEN '✅ Política "Public users can view leads by id" existe'
    ELSE '❌ Política "Public users can view leads by id" NO existe'
  END as "Política Anon";

