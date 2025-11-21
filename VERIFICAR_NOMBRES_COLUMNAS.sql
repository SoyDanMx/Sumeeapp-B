-- =========================================================================
-- SCRIPT: Verificar Nombres de Columnas en la Tabla Leads
-- =========================================================================
-- Este script verifica que los nombres de columnas coincidan con el código
-- =========================================================================

-- 1. Ver TODAS las columnas de la tabla leads
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
ORDER BY ordinal_position;

-- 2. Verificar específicamente las columnas críticas
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'cliente_id'
        ) THEN '✅ EXISTE: cliente_id'
        ELSE '❌ NO EXISTE: cliente_id'
    END as cliente_id_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'client_id'
        ) THEN '⚠️ EXISTE: client_id (INCORRECTO - debe ser cliente_id)'
        ELSE '✅ NO EXISTE: client_id (correcto)'
    END as client_id_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'profesional_asignado_id'
        ) THEN '✅ EXISTE: profesional_asignado_id'
        ELSE '❌ NO EXISTE: profesional_asignado_id'
    END as profesional_asignado_id_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'professional_id'
        ) THEN '⚠️ EXISTE: professional_id (INCORRECTO - debe ser profesional_asignado_id)'
        ELSE '✅ NO EXISTE: professional_id (correcto)'
    END as professional_id_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'estado'
        ) THEN '✅ EXISTE: estado'
        ELSE '❌ NO EXISTE: estado'
    END as estado_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'status'
        ) THEN '⚠️ EXISTE: status (INCORRECTO - debe ser estado)'
        ELSE '✅ NO EXISTE: status (correcto)'
    END as status_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'fecha_creacion'
        ) THEN '✅ EXISTE: fecha_creacion'
        ELSE '❌ NO EXISTE: fecha_creacion'
    END as fecha_creacion_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'leads'
              AND column_name = 'created_at'
        ) THEN '⚠️ EXISTE: created_at (verificar si se usa)'
        ELSE '✅ NO EXISTE: created_at'
    END as created_at_check;

-- 3. Verificar que las RLS policies usan los nombres correctos
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual::text LIKE '%cliente_id%' THEN '✅ Usa cliente_id'
        WHEN qual::text LIKE '%client_id%' THEN '❌ Usa client_id (INCORRECTO)'
        ELSE '⚠️ No usa cliente_id'
    END as cliente_id_usage,
    CASE 
        WHEN qual::text LIKE '%profesional_asignado_id%' THEN '✅ Usa profesional_asignado_id'
        WHEN qual::text LIKE '%professional_id%' THEN '❌ Usa professional_id (INCORRECTO)'
        ELSE '⚠️ No usa profesional_asignado_id'
    END as profesional_usage,
    CASE 
        WHEN qual::text LIKE '%estado%' THEN '✅ Usa estado'
        WHEN qual::text LIKE '%status%' THEN '❌ Usa status (INCORRECTO)'
        ELSE '⚠️ No usa estado'
    END as estado_usage
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY cmd, policyname;

-- 4. Test: Intentar query con nombres correctos
-- (Ejecuta esto con un usuario autenticado)
SELECT 
    id,
    cliente_id,
    profesional_asignado_id,
    estado,
    fecha_creacion,
    servicio,
    nombre_cliente
FROM public.leads
WHERE cliente_id IS NOT NULL
LIMIT 5;



