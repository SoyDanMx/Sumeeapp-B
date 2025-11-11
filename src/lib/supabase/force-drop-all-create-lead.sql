-- =====================================================
-- ELIMINACIÓN FORZADA: Todas las versiones de create_lead
-- Elimina cada versión por su OID específico
-- =====================================================

-- PASO 1: Identificar y eliminar cada versión automáticamente
DO $$
DECLARE
  func_oid OID;
  func_signature TEXT;
  deleted_count INT := 0;
BEGIN
  -- Iterar sobre todas las funciones create_lead
  FOR func_oid, func_signature IN 
    SELECT 
      p.oid,
      p.oid::regprocedure::text
    FROM pg_proc p
    WHERE p.proname = 'create_lead'
      AND p.pronamespace = 'public'::regnamespace
  LOOP
    -- Eliminar la función usando su OID
    EXECUTE format('DROP FUNCTION %s CASCADE', func_signature);
    deleted_count := deleted_count + 1;
    RAISE NOTICE '🗑️ Eliminada función: %', func_signature;
  END LOOP;
  
  IF deleted_count = 0 THEN
    RAISE NOTICE '⚠️ No se encontraron funciones create_lead para eliminar';
  ELSE
    RAISE NOTICE '✅ Total de funciones eliminadas: %', deleted_count;
  END IF;
END $$;

-- PASO 2: Verificar que se eliminaron todas
DO $$
DECLARE
  v_function_count INTEGER;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO v_function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name = 'create_lead';
  
  IF v_function_count = 0 THEN
    RAISE NOTICE '✅✅✅ ÉXITO: Todas las versiones de create_lead eliminadas';
  ELSE
    RAISE WARNING '❌ ERROR: Aún quedan % versiones. Contacta a soporte.', v_function_count;
    
    -- Mostrar las versiones que quedaron
    RAISE NOTICE 'Versiones restantes:';
    FOR rec IN 
      SELECT p.oid::regprocedure::text as signature
      FROM pg_proc p
      WHERE p.proname = 'create_lead'
        AND p.pronamespace = 'public'::regnamespace
    LOOP
      RAISE NOTICE '  - %', rec.signature;
    END LOOP;
  END IF;
END $$;

-- PASO 3: Mostrar resultado final
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Limpio - Listo para crear la nueva función'
    ELSE '❌ ' || COUNT(*)::text || ' versiones aún presentes'
  END as estado_final
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';

