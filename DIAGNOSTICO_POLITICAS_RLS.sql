-- =========================================================================
-- DIAGNÓSTICO: Verificar políticas RLS existentes
-- =========================================================================
-- Este script muestra todas las políticas y cómo se almacenan los roles

-- Ver todas las políticas de INSERT
SELECT 
  policyname,
  cmd,
  roles,
  roles::text as roles_text,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ Contiene authenticated'
    ELSE '❌ No contiene authenticated'
  END as tiene_authenticated,
  CASE 
    WHEN roles::text LIKE '%anon%' THEN '✅ Contiene anon'
    ELSE '❌ No contiene anon'
  END as tiene_anon
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Verificar específicamente la política cliente_puede_crear_leads
SELECT 
  'POLÍTICA cliente_puede_crear_leads' as verificacion,
  policyname,
  cmd,
  roles,
  roles::text as roles_text,
  CASE 
    WHEN policyname = 'cliente_puede_crear_leads' THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as estado
FROM pg_policies
WHERE tablename = 'leads'
  AND policyname = 'cliente_puede_crear_leads';



