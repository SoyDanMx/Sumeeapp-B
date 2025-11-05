-- =========================================================================
-- SCRIPT MEJORADO PARA ARREGLAR POLÍTICAS RLS PARA USUARIOS AUTENTICADOS
-- =========================================================================
-- Este script elimina TODAS las políticas de INSERT existentes y crea
-- políticas específicas para usuarios autenticados y anónimos

-- Paso 1: Verificar que RLS esté habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Paso 2: Ver todas las políticas de INSERT existentes (para diagnóstico)
SELECT 
  policyname,
  cmd,
  roles,
  with_check,
  qual
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT';

-- Paso 3: Eliminar TODAS las políticas de INSERT existentes
-- Esto incluye "Public users can create leads" y cualquier otra
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'leads' 
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', policy_record.policyname);
    RAISE NOTICE '✅ Eliminada política: %', policy_record.policyname;
  END LOOP;
END $$;

-- Paso 4: Crear política para usuarios autenticados
-- Permite a usuarios autenticados crear leads con su propio cliente_id
CREATE POLICY "authenticated_users_can_create_leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permite crear si el cliente_id coincide con el usuario autenticado
  cliente_id = auth.uid() 
  OR 
  -- También permite si cliente_id es NULL (para casos especiales)
  cliente_id IS NULL
);

-- Paso 5: Crear política para usuarios anónimos
-- Permite a usuarios anónimos crear leads sin cliente_id
CREATE POLICY "anonymous_users_can_create_leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (
  -- Solo permite crear leads sin cliente_id (usuarios anónimos)
  cliente_id IS NULL
);

-- Paso 6: Verificar que las políticas fueron creadas correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Paso 7: Verificar que RLS está habilitado
SELECT 
  schemaname,
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

-- =========================================================================
-- VERIFICACIÓN FINAL: Debe mostrar 2 políticas
-- =========================================================================
-- Después de ejecutar este script, ejecuta esta consulta para verificar:
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'leads' AND cmd = 'INSERT';
-- 
-- Resultado esperado:
-- 1. authenticated_users_can_create_leads | INSERT | {authenticated}
-- 2. anonymous_users_can_create_leads     | INSERT | {anon}
