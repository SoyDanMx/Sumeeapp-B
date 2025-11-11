-- =====================================================
-- LIMPIEZA TOTAL: Eliminar TODAS las versiones de create_lead
-- =====================================================

-- Eliminar por nombre completo (sin especificar argumentos) - Método agresivo
DROP FUNCTION IF EXISTS public.create_lead CASCADE;

-- Si el CASCADE no funciona, eliminar cada versión específica detectada:

-- Versión 1: (text, text, text, text, double precision, double precision, text)
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) CASCADE;

-- Versión 2: (text, text, text, numeric, numeric, text, text, text, text, text[], text, text, text)
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) CASCADE;

-- Versión 3: Duplicado de versión 1
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) CASCADE;

-- Versión 4: Duplicado de versión 2
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) CASCADE;

-- Intentar eliminar otras posibles combinaciones
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_lead(TEXT, TEXT, TEXT, DECIMAL, DECIMAL) CASCADE;

-- Verificar que se eliminaron todas
DO $$
DECLARE
  v_function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name = 'create_lead';
  
  IF v_function_count = 0 THEN
    RAISE NOTICE '✅ Todas las versiones de create_lead eliminadas exitosamente';
  ELSE
    RAISE WARNING '⚠️ Aún quedan % versiones de create_lead. Verifica manualmente.', v_function_count;
  END IF;
END $$;

-- Mostrar las versiones restantes (si las hay)
SELECT 
  routine_name as nombre,
  pg_get_function_arguments(p.oid) as argumentos,
  pg_get_function_result(p.oid) as retorno
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';

