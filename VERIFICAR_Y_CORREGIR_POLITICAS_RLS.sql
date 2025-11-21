-- =========================================================================
-- SCRIPT: Verificar y Corregir Políticas RLS para Leads
-- =========================================================================
-- Este script verifica las políticas actuales y asegura que estén
-- correctamente configuradas para permitir la creación de leads
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASO 1: Verificar políticas actuales
-- =========================================================================
SELECT 
  'POLÍTICAS ACTUALES' as seccion,
  policyname,
  cmd,
  roles,
  CASE 
    WHEN cmd = 'INSERT' THEN '🔵 INSERT'
    WHEN cmd = 'SELECT' THEN '🟢 SELECT'
    WHEN cmd = 'UPDATE' THEN '🟡 UPDATE'
    WHEN cmd = 'DELETE' THEN '🔴 DELETE'
    WHEN cmd = 'ALL' THEN '⚪ ALL'
    ELSE '❓ OTRO'
  END as tipo
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

-- =========================================================================
-- PASO 2: Verificar que RLS esté habilitado
-- =========================================================================
-- Simplemente habilitar RLS (si ya está habilitado, no causa error)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- PASO 3: Corregir política de INSERT para usuarios autenticados
-- =========================================================================
-- Eliminar políticas existentes (tanto en inglés como español) si tienen condiciones incorrectas
DROP POLICY IF EXISTS "clients_can_create_leads" ON public.leads;
DROP POLICY IF EXISTS "cliente_puede_crear_leads" ON public.leads;
DROP POLICY IF EXISTS "authenticated_users_can_create_leads" ON public.leads;
DROP POLICY IF EXISTS "authenticated_users_can_create_leads_v3" ON public.leads;

-- Crear política CORRECTA para usuarios autenticados (usando español)
-- Esta política permite que usuarios autenticados creen leads
-- siempre que el cliente_id sea su propio user_id O NULL
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

-- =========================================================================
-- PASO 4: Asegurar política para usuarios anónimos
-- =========================================================================
DROP POLICY IF EXISTS "anonymous_users_can_create_leads" ON public.leads;
DROP POLICY IF EXISTS "anonymous_users_can_create_leads_v3" ON public.leads;
DROP POLICY IF EXISTS "usuario_anonimo_puede_crear_leads" ON public.leads;

CREATE POLICY "usuario_anonimo_puede_crear_leads"
ON public.leads
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (
  -- Solo permite crear leads sin cliente_id (usuarios anónimos)
  cliente_id IS NULL
);

-- =========================================================================
-- PASO 5: Verificar políticas críticas de SELECT
-- =========================================================================
-- Asegurar que los clientes puedan ver sus propios leads
DROP POLICY IF EXISTS "clients_can_view_own_leads" ON public.leads;
DROP POLICY IF EXISTS "cliente_puede_ver_sus_leads" ON public.leads;

CREATE POLICY "cliente_puede_ver_sus_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  cliente_id = auth.uid()
);

-- =========================================================================
-- PASO 6: Verificación final
-- =========================================================================
SELECT 
  'POLÍTICAS DESPUÉS DE CORRECCIÓN' as seccion,
  policyname,
  cmd,
  roles,
  CASE 
    WHEN cmd = 'INSERT' AND roles::text LIKE '%authenticated%' THEN '✅ CRÍTICA'
    WHEN cmd = 'INSERT' AND roles::text LIKE '%anon%' THEN '✅ IMPORTANTE'
    WHEN cmd = 'SELECT' THEN '✅ NECESARIA'
    ELSE '✅ OTRA'
  END as importancia
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd IN ('INSERT', 'SELECT')
ORDER BY 
  CASE cmd
    WHEN 'INSERT' THEN 1
    WHEN 'SELECT' THEN 2
  END,
  policyname;

COMMIT;

-- =========================================================================
-- RESUMEN: Verificar que las políticas críticas existan
-- =========================================================================
SELECT 
  CASE 
    WHEN COUNT(*) FILTER (
      WHERE cmd = 'INSERT' 
      AND (
        'authenticated' = ANY(roles) 
        OR roles::text LIKE '%authenticated%'
      )
    ) > 0 
      THEN '✅ Política INSERT para authenticated: EXISTE'
    ELSE '❌ Política INSERT para authenticated: FALTA'
  END as verificacion_insert_authenticated,
  CASE 
    WHEN COUNT(*) FILTER (
      WHERE cmd = 'INSERT' 
      AND (
        'anon' = ANY(roles) 
        OR roles::text LIKE '%anon%'
      )
    ) > 0 
      THEN '✅ Política INSERT para anon: EXISTE'
    ELSE '⚠️ Política INSERT para anon: FALTA (opcional)'
  END as verificacion_insert_anon,
  CASE 
    WHEN COUNT(*) FILTER (
      WHERE cmd = 'SELECT' 
      AND (
        'authenticated' = ANY(roles) 
        OR roles::text LIKE '%authenticated%'
      )
    ) > 0 
      THEN '✅ Política SELECT para authenticated: EXISTE'
    ELSE '⚠️ Política SELECT para authenticated: FALTA'
  END as verificacion_select_authenticated
FROM pg_policies
WHERE tablename = 'leads';

