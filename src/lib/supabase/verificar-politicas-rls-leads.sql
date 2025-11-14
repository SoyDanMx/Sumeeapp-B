-- =========================================================================
-- VERIFICACIÓN FINAL: Políticas RLS para Leads
-- =========================================================================
-- Ejecuta este script para verificar que las políticas RLS están correctas

-- Verificar todas las políticas de SELECT en la tabla leads
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

-- Verificar que existe la política para profesionales
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'SELECT'
        AND (
          policyname = 'Professionals can view new and assigned leads' OR
          qual LIKE '%estado%nuevo%' OR
          qual LIKE '%profesional_asignado_id%'
        )
    ) THEN '✅ Política para profesionales existe'
    ELSE '❌ Política para profesionales NO existe - Ejecuta fix-professional-leads-rls.sql'
  END as "Estado Política Profesionales";

-- Verificar que RLS está habilitado
SELECT 
  tablename,
  rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';

-- Contar leads disponibles (esto requiere autenticación)
-- Para probar manualmente desde el dashboard del profesional:
-- SELECT COUNT(*) FROM leads WHERE estado = 'nuevo' OR profesional_asignado_id = auth.uid();

