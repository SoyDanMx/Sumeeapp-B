-- =========================================================================
-- SCRIPT COMPLETO PARA ARREGLAR POLÍTICAS RLS DE LA TABLA LEADS
-- =========================================================================
-- Este script elimina TODAS las políticas de INSERT y crea una nueva política pública
-- que permite a cualquier usuario (anon y authenticated) crear leads

-- Paso 1: Verificar que RLS esté habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Paso 2: Ver TODAS las políticas existentes de INSERT (para diagnóstico)
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
-- (Incluyendo cualquier variante que pueda existir)
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
    RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
  END LOOP;
END $$;

-- Paso 4: Crear la política de INSERT pública (para anon y authenticated)
-- Esta política permite INSERT sin restricciones para el rol 'public'
CREATE POLICY "Public users can create leads"
ON public.leads
FOR INSERT
TO public  -- Incluye tanto 'anon' como 'authenticated'
WITH CHECK (true);

-- Paso 5: Verificar que la política fue creada
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
  AND cmd = 'INSERT';

-- Paso 6: Verificar que RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';

