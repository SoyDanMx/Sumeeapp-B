-- =========================================================================
-- TEST: Verificar Política RLS con User ID Específico
-- =========================================================================
-- Este script verifica si la política permite crear leads con tu user ID
-- =========================================================================

-- 1. Verificar la condición de la política
SELECT 
  'CONDICIÓN DE POLÍTICA' as tipo,
  policyname,
  with_check::text as condicion
FROM pg_policies
WHERE tablename = 'leads' 
  AND policyname = 'cliente_puede_crear_leads';

-- 2. Verificar tipo de dato de cliente_id
SELECT 
  'TIPO DE DATO' as tipo,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'leads' 
  AND column_name = 'cliente_id'
  AND table_schema = 'public';

-- 3. Simular la condición de la política manualmente
-- Esto verifica si la condición debería permitir el INSERT
SELECT 
  'SIMULACIÓN DE CONDICIÓN' as tipo,
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid as cliente_id_valor,
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid = 'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid as coincide_con_si_mismo,
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid IS NULL as es_null,
  CASE 
    WHEN 'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid = 'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid 
         OR 'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid IS NULL
      THEN '✅ CONDICIÓN CUMPLE (debería permitir INSERT)'
    ELSE '❌ CONDICIÓN NO CUMPLE (bloquearía INSERT)'
  END as resultado;

-- 4. Verificar si hay problemas de casting
SELECT 
  'TEST CASTING' as tipo,
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::text as como_texto,
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid as como_uuid,
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::text::uuid as texto_a_uuid;




