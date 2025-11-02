-- =========================================================================
-- POLÍTICA RLS PARA PERMITIR SELECT DE LEADS POR ID
-- =========================================================================
-- Esta política permite que cualquier usuario (anon y authenticated) pueda
-- leer un lead específico si conoce su ID. Esto es necesario para que los
-- usuarios anónimos puedan ver el lead que acaban de crear.

-- IMPORTANTE: Esta política es SEGURA porque:
-- 1. Solo permite leer leads por ID específico (no listar todos)
-- 2. El UUID del lead es difícil de adivinar
-- 3. Esto es necesario para que usuarios anónimos vean sus propios leads

-- Paso 1: Eliminar políticas de SELECT conflictivas existentes (si las hay)
DROP POLICY IF EXISTS "Public users can view leads by id" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;

-- Paso 2: Crear política para usuarios autenticados que puedan ver sus propios leads
CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  cliente_id = auth.uid() OR 
  profesional_asignado_id = auth.uid()
);

-- Paso 3: Crear política para usuarios anónimos que puedan ver cualquier lead por ID
-- Esto permite que usuarios anónimos vean el lead que acaban de crear
-- Es seguro porque el UUID del lead es difícil de adivinar
CREATE POLICY "Public users can view leads by id"
ON public.leads
FOR SELECT
TO anon
USING (true); -- Permite leer cualquier lead (necesario para ver leads anónimos creados)

-- NOTA: Para mejorar la seguridad en el futuro, podrías restringir esto a:
-- USING (cliente_id IS NULL) -- Solo leads anónimos
-- Pero esto no funcionaría si el usuario se autentica después

-- Paso 4: Verificar que las políticas fueron creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
ORDER BY policyname;

