-- =========================================================================
-- SCRIPT PARA VERIFICAR LA ESTRUCTURA DE LA TABLA 'messages'
-- =========================================================================

-- Verificar que la tabla existe y ver sus columnas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- Verificar que las políticas RLS existen
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages';

-- Verificar que los índices fueron creados
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'messages'
  AND schemaname = 'public';

-- Verificar que el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages';
