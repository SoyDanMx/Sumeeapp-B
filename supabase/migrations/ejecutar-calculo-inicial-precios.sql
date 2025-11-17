-- =========================================================================
-- SCRIPT: Ejecutar Cálculo Inicial de Precios Históricos
-- =========================================================================
-- Este script ejecuta la función calculate_avg_prices() para calcular
-- las estadísticas iniciales basadas en leads completados existentes.
-- Ejecutar después de crear la tabla y la función.
-- =========================================================================

-- Verificar que tenemos leads completados antes de calcular
SELECT 
    'Leads completados disponibles' as categoria,
    COUNT(*) as cantidad
FROM public.leads
WHERE negotiation_status = 'acuerdo_confirmado'
    AND estado = 'completado'
    AND agreed_price IS NOT NULL
    AND agreed_price > 0
    AND agreed_price BETWEEN 100 AND 1000000
    AND disciplina_ia IS NOT NULL
    AND disciplina_ia != '';

-- Verificar distribución por disciplina
SELECT 
    disciplina_ia,
    COUNT(*) as leads_count,
    AVG(agreed_price) as avg_price_actual,
    MIN(agreed_price) as min_price_actual,
    MAX(agreed_price) as max_price_actual
FROM public.leads
WHERE negotiation_status = 'acuerdo_confirmado'
    AND estado = 'completado'
    AND agreed_price IS NOT NULL
    AND agreed_price > 0
    AND agreed_price BETWEEN 100 AND 1000000
    AND disciplina_ia IS NOT NULL
    AND disciplina_ia != ''
GROUP BY disciplina_ia
ORDER BY leads_count DESC;

-- Ejecutar cálculo inicial
-- Parámetros:
--   min_samples: 5 (mínimo de 5 leads para tener confianza)
--   use_work_zone: true (agrupar por disciplina y zona)
-- NOTA: Si la columna 'city' no existe en profiles, work_zone será NULL (datos globales)
SELECT * FROM public.calculate_avg_prices(5, true);

-- Verificar resultados calculados
SELECT 
    disciplina_ia,
    work_zone,
    avg_price,
    median_price,
    std_dev,
    min_price,
    max_price,
    sample_size,
    confidence_score,
    last_calculated_at
FROM public.pricing_model_data
ORDER BY disciplina_ia, work_zone NULLS LAST;

-- Estadísticas de resumen
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT disciplina_ia) as total_disciplinas,
    SUM(sample_size) as total_samples,
    AVG(confidence_score) as avg_confidence,
    MIN(last_calculated_at) as primera_calculacion,
    MAX(last_calculated_at) as ultima_calculacion
FROM public.pricing_model_data;

-- Verificar si hay datos por zona o solo globales
SELECT 
    CASE 
        WHEN work_zone IS NULL THEN 'Datos globales (sin zona)'
        ELSE 'Datos por zona'
    END as tipo_dato,
    COUNT(*) as cantidad_registros
FROM public.pricing_model_data
GROUP BY 
    CASE 
        WHEN work_zone IS NULL THEN 'Datos globales (sin zona)'
        ELSE 'Datos por zona'
    END;

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. Si no hay suficientes leads completados (mínimo 5 por grupo),
--    algunos registros pueden no aparecer. Esto es NORMAL al inicio.
-- 2. Si la columna 'city' no existe en profiles, work_zone será NULL
--    y solo se calcularán datos globales por disciplina (sin zona).
-- 3. Ejecutar este script periódicamente (cron job diario/semanal) para
--    mantener datos actualizados.
-- 4. Los datos se actualizan incrementalmente (ON CONFLICT UPDATE).
-- 5. El sistema funciona sin datos históricos hasta que haya suficientes
--    leads completados. No es un error si la tabla está vacía al inicio.
-- =========================================================================

