-- =========================================================================
-- SCRIPT: Verificar Índices y RLS para Optimizar Queries
-- =========================================================================
-- Este script verifica que existan los índices necesarios y que las RLS
-- policies estén correctamente configuradas
-- =========================================================================

-- =========================================================================
-- PARTE 1: VERIFICAR ÍNDICES
-- =========================================================================

-- Ver TODOS los índices en la tabla leads
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'leads'
  AND schemaname = 'public'
ORDER BY indexname;

-- Verificar específicamente si existe índice en cliente_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'leads'
              AND schemaname = 'public'
              AND indexdef LIKE '%cliente_id%'
        ) THEN '✅ EXISTE índice en cliente_id'
        ELSE '❌ NO EXISTE índice en cliente_id (CRÍTICO - crear uno)'
    END as cliente_id_index_check;

-- Verificar si existe índice en profesional_asignado_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'leads'
              AND schemaname = 'public'
              AND indexdef LIKE '%profesional_asignado_id%'
        ) THEN '✅ EXISTE índice en profesional_asignado_id'
        ELSE '⚠️ NO EXISTE índice en profesional_asignado_id (recomendado)'
    END as profesional_index_check;

-- Verificar si existe índice en estado
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'leads'
              AND schemaname = 'public'
              AND indexdef LIKE '%estado%'
        ) THEN '✅ EXISTE índice en estado'
        ELSE '⚠️ NO EXISTE índice en estado (opcional)'
    END as estado_index_check;

-- =========================================================================
-- PARTE 2: CREAR ÍNDICES FALTANTES (si no existen)
-- =========================================================================

-- Índice en cliente_id (CRÍTICO para queries rápidas)
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id 
ON public.leads(cliente_id)
WHERE cliente_id IS NOT NULL; -- Índice parcial (solo para valores no nulos)

-- Índice en profesional_asignado_id (para queries de profesionales)
CREATE INDEX IF NOT EXISTS idx_leads_profesional_asignado_id 
ON public.leads(profesional_asignado_id)
WHERE profesional_asignado_id IS NOT NULL;

-- Índice compuesto para queries comunes (estado + profesional_asignado_id)
CREATE INDEX IF NOT EXISTS idx_leads_estado_profesional 
ON public.leads(estado, profesional_asignado_id)
WHERE estado IN ('Nuevo', 'nuevo') AND profesional_asignado_id IS NULL;

-- Índice en fecha_creacion para ordenamiento rápido
CREATE INDEX IF NOT EXISTS idx_leads_fecha_creacion 
ON public.leads(fecha_creacion DESC);

-- =========================================================================
-- PARTE 3: VERIFICAR RLS POLICIES
-- =========================================================================

-- Ver TODAS las policies con sus condiciones
SELECT 
    policyname,
    cmd,
    roles::text as roles,
    CASE 
        WHEN qual IS NOT NULL THEN qual::text
        ELSE 'N/A'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN with_check::text
        ELSE 'N/A'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY 
    CASE cmd
        WHEN 'INSERT' THEN 1
        WHEN 'SELECT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END,
    policyname;

-- Verificar que RLS esté habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO (CRÍTICO)'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'leads';

-- =========================================================================
-- PARTE 4: TEST DE PERFORMANCE
-- =========================================================================

-- Test 1: Query simple con cliente_id (debe ser rápida con índice)
EXPLAIN ANALYZE
SELECT * FROM public.leads
WHERE cliente_id = '00000000-0000-0000-0000-000000000000'::uuid
ORDER BY fecha_creacion DESC
LIMIT 10;

-- Test 2: Query para leads disponibles (debe usar índice compuesto)
EXPLAIN ANALYZE
SELECT * FROM public.leads
WHERE (estado = 'Nuevo' OR estado = 'nuevo')
  AND profesional_asignado_id IS NULL
ORDER BY fecha_creacion DESC
LIMIT 10;

-- =========================================================================
-- PARTE 5: VERIFICAR ESTADÍSTICAS DE LA TABLA
-- =========================================================================

-- Ver cuántos registros hay
SELECT 
    COUNT(*) as total_leads,
    COUNT(DISTINCT cliente_id) as clientes_unicos,
    COUNT(DISTINCT profesional_asignado_id) as profesionales_unicos,
    COUNT(*) FILTER (WHERE estado = 'Nuevo' OR estado = 'nuevo') as leads_nuevos,
    COUNT(*) FILTER (WHERE profesional_asignado_id IS NULL) as leads_sin_asignar
FROM public.leads;

-- Ver distribución de estados
SELECT 
    estado,
    COUNT(*) as cantidad,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM public.leads
GROUP BY estado
ORDER BY cantidad DESC;




