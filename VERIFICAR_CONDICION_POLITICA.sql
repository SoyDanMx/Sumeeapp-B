-- =========================================================================
-- VERIFICAR CONDICIÓN DE LA POLÍTICA
-- =========================================================================
-- Esta consulta muestra la condición exacta de la política
-- =========================================================================

SELECT 
  policyname,
  cmd,
  roles,
  with_check as condicion_completa,
  with_check::text as condicion_texto
FROM pg_policies
WHERE tablename = 'leads' 
  AND policyname = 'cliente_puede_crear_leads';

-- Verificar tipo de dato de cliente_id
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'leads' 
  AND column_name = 'cliente_id'
  AND table_schema = 'public';




