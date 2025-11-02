-- =========================================================================
-- POLÍTICA RLS PARA PERMITIR INSERT PÚBLICO EN LEADS
-- =========================================================================
-- Esta política permite que cualquier persona (usuarios anónimos y autenticados)
-- pueda crear un lead en la tabla public.leads

-- IMPORTANTE: Esta política es SEGURA porque:
-- 1. Solo permite INSERT, no SELECT, UPDATE o DELETE
-- 2. Los usuarios anónimos NO pueden ver ni modificar leads de otros
-- 3. La seguridad de los datos se mantiene con políticas de SELECT separadas

-- Paso 1: Eliminar políticas conflictivas existentes de INSERT
-- (Si existe una política que requiere auth.uid() = cliente_id, bloquea usuarios anónimos)
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Public users can create leads" ON public.leads;

-- Paso 2: Crear la nueva política de INSERT para usuarios públicos
-- Esta política permite INSERT a cualquier persona (anon y authenticated)
CREATE POLICY "Public users can create leads"
ON public.leads
FOR INSERT
TO public  -- Esto incluye tanto 'anon' como 'authenticated'
WITH CHECK (true);

-- Verificar que la política fue creada
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
  AND policyname = 'Public users can create leads';

-- =========================================================================
-- NOTAS ADICIONALES DE SEGURIDAD
-- =========================================================================
-- Esta política solo afecta a INSERT. Las políticas de SELECT deben seguir
-- restringiendo el acceso para que solo:
-- - El cliente que creó el lead pueda ver su propio lead (cliente_id = auth.uid())
-- - El profesional asignado pueda ver leads asignados a él
-- - Los profesionales puedan ver leads públicos (opcional, según tu modelo de negocio)

-- Para verificar las políticas existentes de SELECT:
-- SELECT * FROM pg_policies WHERE tablename = 'leads' AND cmd = 'SELECT';

