-- =========================================================================
-- SCRIPT: Crear Índices Críticos para Optimizar Queries
-- =========================================================================
-- Este script crea los índices necesarios para que las queries sean rápidas
-- Es seguro ejecutarlo múltiples veces (usa IF NOT EXISTS)
-- =========================================================================

BEGIN;

-- =========================================================================
-- ÍNDICE 1: cliente_id (CRÍTICO - para queries de clientes)
-- =========================================================================
-- Este índice es esencial para que getClientLeads() sea rápida
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id 
ON public.leads(cliente_id)
WHERE cliente_id IS NOT NULL;

COMMENT ON INDEX idx_leads_cliente_id IS 
'Índice crítico para queries de leads por cliente. Acelera getClientLeads().';

-- =========================================================================
-- ÍNDICE 2: profesional_asignado_id (para queries de profesionales)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_leads_profesional_asignado_id 
ON public.leads(profesional_asignado_id)
WHERE profesional_asignado_id IS NOT NULL;

COMMENT ON INDEX idx_leads_profesional_asignado_id IS 
'Índice para queries de leads asignados a profesionales.';

-- =========================================================================
-- ÍNDICE 3: Compuesto (estado + profesional_asignado_id)
-- =========================================================================
-- Optimiza queries de "leads disponibles" (estado = 'Nuevo' y sin asignar)
CREATE INDEX IF NOT EXISTS idx_leads_estado_profesional 
ON public.leads(estado, profesional_asignado_id)
WHERE (estado = 'Nuevo' OR estado = 'nuevo') 
  AND profesional_asignado_id IS NULL;

COMMENT ON INDEX idx_leads_estado_profesional IS 
'Índice compuesto para queries de leads disponibles (nuevos y sin asignar).';

-- =========================================================================
-- ÍNDICE 4: fecha_creacion (para ordenamiento rápido)
-- =========================================================================
-- Acelera ORDER BY fecha_creacion DESC
CREATE INDEX IF NOT EXISTS idx_leads_fecha_creacion 
ON public.leads(fecha_creacion DESC);

COMMENT ON INDEX idx_leads_fecha_creacion IS 
'Índice para ordenamiento rápido por fecha de creación.';

-- =========================================================================
-- VERIFICACIÓN: Ver todos los índices creados
-- =========================================================================
SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexdef LIKE '%cliente_id%' THEN '✅ CRÍTICO'
        WHEN indexdef LIKE '%profesional_asignado_id%' THEN '✅ IMPORTANTE'
        WHEN indexdef LIKE '%fecha_creacion%' THEN '✅ ÚTIL'
        ELSE '✅ OTRO'
    END as importancia
FROM pg_indexes
WHERE tablename = 'leads'
  AND schemaname = 'public'
ORDER BY 
    CASE 
        WHEN indexdef LIKE '%cliente_id%' THEN 1
        WHEN indexdef LIKE '%profesional_asignado_id%' THEN 2
        WHEN indexdef LIKE '%fecha_creacion%' THEN 3
        ELSE 4
    END;

COMMIT;

-- =========================================================================
-- RESULTADO ESPERADO
-- =========================================================================
-- Debes ver al menos estos 4 índices:
-- 1. idx_leads_cliente_id ✅
-- 2. idx_leads_profesional_asignado_id ✅
-- 3. idx_leads_estado_profesional ✅
-- 4. idx_leads_fecha_creacion ✅




