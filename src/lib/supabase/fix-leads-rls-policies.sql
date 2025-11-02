-- =========================================================================
-- SCRIPT PARA ARREGLAR POLÍTICAS RLS DE LA TABLA LEADS
-- =========================================================================
-- Este script asegura que las políticas RLS estén configuradas correctamente
-- para permitir que usuarios anónimos y autenticados creen leads

-- Paso 1: Verificar que RLS esté habilitado en la tabla leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar todas las políticas de INSERT existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Public users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

-- Paso 3: Crear la política de INSERT para usuarios públicos (anon y authenticated)
-- Esta política permite que cualquier persona pueda crear un lead
CREATE POLICY "Public users can create leads"
ON public.leads
FOR INSERT
TO public  -- Esto incluye tanto 'anon' como 'authenticated'
WITH CHECK (true);

-- Paso 4: Verificar que la política fue creada correctamente
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

-- Paso 5: Verificar que RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';

