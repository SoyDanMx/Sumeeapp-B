-- =========================================================================
-- VERIFICAR TIPO DE DATO DE cliente_id
-- =========================================================================

SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leads' 
  AND column_name = 'cliente_id'
  AND table_schema = 'public';




