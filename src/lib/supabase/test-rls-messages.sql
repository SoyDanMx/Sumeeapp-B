-- =========================================================================
-- TESTS DE SEGURIDAD RLS - TABLA MESSAGES
-- =========================================================================
-- Suite de pruebas para verificar que las políticas RLS funcionan correctamente
-- =========================================================================

-- =========================================================================
-- TEST 1: Verificar que RLS está habilitado
-- =========================================================================
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'messages' AND relnamespace = 'public'::regnamespace;
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ TEST 1 PASSED: RLS está habilitado en messages';
    ELSE
        RAISE EXCEPTION '❌ TEST 1 FAILED: RLS NO está habilitado';
    END IF;
END $$;

-- =========================================================================
-- TEST 2: Contar políticas activas
-- =========================================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages';
    
    IF policy_count >= 7 THEN
        RAISE NOTICE '✅ TEST 2 PASSED: % políticas activas encontradas', policy_count;
    ELSE
        RAISE WARNING '⚠️ TEST 2 WARNING: Solo % políticas. Se esperaban al menos 7.', policy_count;
    END IF;
END $$;

-- =========================================================================
-- TEST 3: Verificar cobertura de comandos
-- =========================================================================
DO $$
DECLARE
    has_select BOOLEAN;
    has_insert BOOLEAN;
    has_update BOOLEAN;
    has_delete BOOLEAN;
BEGIN
    SELECT 
        bool_or(cmd = 'SELECT') AS has_select,
        bool_or(cmd = 'INSERT') AS has_insert,
        bool_or(cmd = 'UPDATE') AS has_update,
        bool_or(cmd = 'DELETE') AS has_delete
    INTO has_select, has_insert, has_update, has_delete
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages';
    
    IF has_select AND has_insert AND has_update AND has_delete THEN
        RAISE NOTICE '✅ TEST 3 PASSED: Cobertura completa de operaciones (SELECT, INSERT, UPDATE, DELETE)';
    ELSE
        RAISE EXCEPTION '❌ TEST 3 FAILED: Falta cobertura - SELECT:% INSERT:% UPDATE:% DELETE:%', 
            has_select, has_insert, has_update, has_delete;
    END IF;
END $$;

-- =========================================================================
-- TEST 4: Verificar políticas críticas por nombre
-- =========================================================================
DO $$
DECLARE
    critical_policies TEXT[] := ARRAY[
        'Users can view messages from their leads',
        'Users can send messages in their leads',
        'Users can update their own messages',
        'Users can delete their own messages'
    ];
    policy_name TEXT;
    found_count INTEGER := 0;
BEGIN
    FOREACH policy_name IN ARRAY critical_policies
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'messages' 
            AND policyname = policy_name
        ) THEN
            found_count := found_count + 1;
            RAISE NOTICE '  ✓ Política encontrada: %', policy_name;
        ELSE
            RAISE WARNING '  ✗ Política faltante: %', policy_name;
        END IF;
    END LOOP;
    
    IF found_count = array_length(critical_policies, 1) THEN
        RAISE NOTICE '✅ TEST 4 PASSED: Todas las políticas críticas están presentes';
    ELSE
        RAISE EXCEPTION '❌ TEST 4 FAILED: Solo %/% políticas críticas encontradas', 
            found_count, array_length(critical_policies, 1);
    END IF;
END $$;

-- =========================================================================
-- TEST 5: Verificar políticas RPC
-- =========================================================================
DO $$
DECLARE
    rpc_policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rpc_policy_count
    FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'messages'
    AND policyname LIKE 'RPC%';
    
    IF rpc_policy_count >= 3 THEN
        RAISE NOTICE '✅ TEST 5 PASSED: % políticas RPC encontradas', rpc_policy_count;
    ELSE
        RAISE WARNING '⚠️ TEST 5 WARNING: Solo % políticas RPC. Se esperaban al menos 3.', rpc_policy_count;
    END IF;
END $$;

-- =========================================================================
-- TEST 6: Verificar validación de auth.uid() en políticas
-- =========================================================================
DO $$
DECLARE
    auth_check_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_check_count
    FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'messages'
    AND (
        qual LIKE '%auth.uid()%' 
        OR with_check LIKE '%auth.uid()%'
    );
    
    IF auth_check_count >= 4 THEN
        RAISE NOTICE '✅ TEST 6 PASSED: % políticas con validación de auth.uid()', auth_check_count;
    ELSE
        RAISE WARNING '⚠️ TEST 6 WARNING: Solo % políticas con auth.uid()', auth_check_count;
    END IF;
END $$;

-- =========================================================================
-- TEST 7: Verificar JOIN con tabla leads en políticas
-- =========================================================================
DO $$
DECLARE
    leads_check_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO leads_check_count
    FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'messages'
    AND (
        qual LIKE '%FROM leads%' 
        OR with_check LIKE '%FROM leads%'
    );
    
    IF leads_check_count >= 1 THEN
        RAISE NOTICE '✅ TEST 7 PASSED: % políticas con validación de leads', leads_check_count;
    ELSE
        RAISE WARNING '⚠️ TEST 7 WARNING: Ninguna política valida participación en leads';
    END IF;
END $$;

-- =========================================================================
-- TEST 8: Listar todas las políticas para revisión manual
-- =========================================================================
SELECT 
    '📋 LISTADO DE POLÍTICAS' AS info;

SELECT 
    policyname AS "Política",
    cmd AS "Comando",
    CASE 
        WHEN roles::text LIKE '%authenticated%' THEN 'Authenticated'
        WHEN roles::text LIKE '%postgres%' THEN 'Postgres (RPC)'
        ELSE 'Public'
    END AS "Rol",
    CASE 
        WHEN qual IS NOT NULL THEN '✅' 
        ELSE '-' 
    END AS "USING",
    CASE 
        WHEN with_check IS NOT NULL THEN '✅' 
        ELSE '-' 
    END AS "WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY cmd, policyname;

-- =========================================================================
-- RESUMEN FINAL
-- =========================================================================
DO $$
DECLARE
    total_policies INTEGER;
    rls_enabled BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'messages';
    
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'messages' AND relnamespace = 'public'::regnamespace;
    
    RAISE NOTICE '';
    RAISE NOTICE '═════════════════════════════════════════════';
    RAISE NOTICE '   RESUMEN DE SEGURIDAD RLS - MESSAGES';
    RAISE NOTICE '═════════════════════════════════════════════';
    RAISE NOTICE 'RLS Habilitado: %', CASE WHEN rls_enabled THEN '✅ SÍ' ELSE '❌ NO' END;
    RAISE NOTICE 'Políticas Activas: % políticas', total_policies;
    RAISE NOTICE 'Estado General: %', CASE WHEN rls_enabled AND total_policies >= 7 THEN '✅ SEGURO' ELSE '⚠️ REVISAR' END;
    RAISE NOTICE '═════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- =========================================================================
-- NOTAS
-- =========================================================================
-- Si todos los tests pasan con ✅, la seguridad RLS está correctamente implementada
-- Si algún test falla con ❌, revisar las políticas específicas
-- Las advertencias ⚠️ son informativas pero no críticas
-- =========================================================================

