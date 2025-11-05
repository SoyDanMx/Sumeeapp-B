-- =========================================================================
-- SCRIPT DE VERIFICACIÓN DE POLÍTICAS RLS
-- =========================================================================
-- Ejecuta este script para verificar el estado de las políticas RLS

-- 1. Verificar que RLS está habilitado
SELECT 
  tablename,
  CASE 
    WHEN c.relrowsecurity THEN 'RLS Habilitado ✅'
    ELSE 'RLS Deshabilitado ❌'
  END as rls_status
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = pt.schemaname
WHERE pt.tablename = 'leads'
  AND pt.schemaname = 'public';

-- 2. Ver TODAS las políticas de INSERT para la tabla leads
SELECT 
  policyname,
  cmd,
  roles,
  permissive,
  with_check,
  qual
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- 3. Verificar si existen políticas viejas que puedan causar conflictos
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'INSERT'
        AND policyname = 'Public users can create leads'
    ) THEN '⚠️ Política antigua "Public users can create leads" AÚN EXISTE'
    ELSE '✅ Política antigua "Public users can create leads" NO EXISTE (correcto)'
  END as politica_antigua_check;

-- 4. Verificar que las políticas v3 existen
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'INSERT'
        AND policyname = 'authenticated_users_can_create_leads_v3'
    ) THEN '✅ Política authenticated_users_can_create_leads_v3 existe'
    ELSE '❌ Política authenticated_users_can_create_leads_v3 NO existe'
  END as politica_v3_authenticated_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'INSERT'
        AND policyname = 'anonymous_users_can_create_leads_v3'
    ) THEN '✅ Política anonymous_users_can_create_leads_v3 existe'
    ELSE '❌ Política anonymous_users_can_create_leads_v3 NO existe'
  END as politica_v3_anonymous_check;

-- 5. Mostrar el contenido completo de las políticas v3
SELECT 
  'authenticated_users_can_create_leads_v3' as politica,
  with_check as condicion
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT'
  AND policyname = 'authenticated_users_can_create_leads_v3'
UNION ALL
SELECT 
  'anonymous_users_can_create_leads_v3' as politica,
  with_check as condicion
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT'
  AND policyname = 'anonymous_users_can_create_leads_v3';
