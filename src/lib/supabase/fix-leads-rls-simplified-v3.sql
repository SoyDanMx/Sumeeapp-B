-- =========================================================================
-- SCRIPT SIMPLIFICADO Y ROBUSTO PARA ARREGLAR POLÍTICAS RLS
-- =========================================================================
-- Este script elimina TODAS las políticas y crea una única política simple
-- que permite a usuarios autenticados crear leads con su propio cliente_id

-- Paso 1: Verificar que RLS esté habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Paso 2: Ver todas las políticas de INSERT existentes
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

-- Paso 4: Crear política SIMPLIFICADA para usuarios autenticados
-- Esta política permite que cualquier usuario autenticado cree un lead
-- siempre que el cliente_id sea su propio user_id O NULL
CREATE POLICY "authenticated_users_can_create_leads_v3"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permite si cliente_id es NULL (para flexibilidad)
  cliente_id IS NULL
  OR
  -- O si cliente_id coincide con el usuario autenticado
  cliente_id::text = auth.uid()::text
);

-- Paso 5: Crear política para usuarios anónimos
CREATE POLICY "anonymous_users_can_create_leads_v3"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (
  -- Solo permite crear leads sin cliente_id (usuarios anónimos)
  cliente_id IS NULL
);

-- Paso 6: Verificar que las políticas fueron creadas
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Paso 7: Test de verificación - Esto debería mostrar tu user_id actual
SELECT 
  'Tu user_id actual es:' as info,
  auth.uid() as current_user_id,
  'Si estás autenticado, este será el ID usado en las políticas RLS' as note;
