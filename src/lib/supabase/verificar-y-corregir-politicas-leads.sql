-- =========================================================================
-- VERIFICACIÓN Y CORRECCIÓN: Políticas RLS para que profesionales vean leads
-- =========================================================================

-- PASO 1: Ver TODAS las políticas de SELECT en la tabla leads
SELECT 
  schemaname,
  tablename,
  policyname as "Nombre de Política",
  permissive,
  roles as "Roles",
  cmd as "Comando",
  qual as "Condición USING"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- PASO 2: Verificar si existe política para profesionales
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'SELECT'
        AND policyname = 'Professionals can view new and assigned leads'
    ) THEN '✅ Política para profesionales EXISTE'
    ELSE '❌ Política para profesionales NO EXISTE - Se creará ahora'
  END as "Estado";

-- PASO 3: Crear política para profesionales (si no existe o actualizar si existe)
DROP POLICY IF EXISTS "Professionals can view new and assigned leads" ON public.leads;

CREATE POLICY "Professionals can view new and assigned leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  -- Pueden ver leads nuevos (disponibles para aceptar)
  estado = 'nuevo' OR
  -- O leads que tienen asignados
  profesional_asignado_id = auth.uid()
);

-- PASO 4: Verificar que la política se creó correctamente
SELECT 
  schemaname,
  tablename,
  policyname as "Nombre de Política",
  permissive,
  roles as "Roles",
  cmd as "Comando",
  qual as "Condición USING"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
  AND policyname = 'Professionals can view new and assigned leads';

-- PASO 5: Resumen final
SELECT 
  'Resumen' as "Tipo",
  COUNT(*) as "Total Políticas SELECT"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
UNION ALL
SELECT 
  'Política Profesionales' as "Tipo",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'SELECT'
        AND policyname = 'Professionals can view new and assigned leads'
    ) THEN 1
    ELSE 0
  END as "Total Políticas SELECT";

