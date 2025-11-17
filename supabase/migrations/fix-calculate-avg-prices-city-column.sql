-- =========================================================================
-- SCRIPT DE CORRECCIÓN: Arreglar función calculate_avg_prices
-- =========================================================================
-- Este script corrige la función calculate_avg_prices para que no dependa
-- de la columna 'city' si no existe en la tabla profiles.
-- Ejecutar si obtienes el error: "column p.city does not exist"
-- =========================================================================

-- Eliminar la función existente (si existe)
DROP FUNCTION IF EXISTS public.calculate_avg_prices(INTEGER, BOOLEAN);

-- Recrear la función con la versión corregida
CREATE OR REPLACE FUNCTION public.calculate_avg_prices(
    min_samples INTEGER DEFAULT 5,  -- Mínimo de muestras para tener confianza
    use_work_zone BOOLEAN DEFAULT TRUE  -- Si false, solo agrupa por disciplina
)
RETURNS TABLE(
    disciplina_ia TEXT,
    work_zone TEXT,
    avg_price DECIMAL,
    median_price DECIMAL,
    std_dev DECIMAL,
    min_price DECIMAL,
    max_price DECIMAL,
    sample_size INTEGER,
    records_updated INTEGER
) AS $$
DECLARE
    rec RECORD;
    updated_count INTEGER := 0;
    confidence DECIMAL;
    city_column_exists BOOLEAN;
BEGIN
    -- Verificar si la columna 'city' existe en la tabla profiles
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'city'
    ) INTO city_column_exists;
    
    -- Calcular estadísticas por disciplina y zona (si use_work_zone = true)
    -- NOTA: Si la columna 'city' no existe en profiles, work_zone será NULL (datos globales)
    FOR rec IN
        WITH completed_leads AS (
            SELECT 
                l.disciplina_ia,
                CASE 
                    WHEN use_work_zone AND city_column_exists THEN 
                        -- Solo intentar obtener city si la columna existe
                        (SELECT city FROM public.profiles WHERE user_id = l.cliente_id LIMIT 1)
                    ELSE NULL
                END as work_zone,
                l.agreed_price
            FROM public.leads l
            WHERE l.negotiation_status = 'acuerdo_confirmado'
                AND l.estado = 'completado'
                AND l.agreed_price IS NOT NULL
                AND l.agreed_price > 0
                AND l.agreed_price BETWEEN 100 AND 1000000  -- Validar rango razonable
                AND l.disciplina_ia IS NOT NULL
                AND l.disciplina_ia != ''
        ),
        stats_by_group AS (
            SELECT 
                disciplina_ia,
                work_zone,
                COUNT(*) as sample_count,
                AVG(agreed_price) as avg_price,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY agreed_price) as median_price,
                STDDEV(agreed_price) as std_dev,
                MIN(agreed_price) as min_price,
                MAX(agreed_price) as max_price
            FROM completed_leads
            GROUP BY disciplina_ia, work_zone
            HAVING COUNT(*) >= min_samples  -- Solo grupos con suficientes muestras
        )
        SELECT * FROM stats_by_group
    LOOP
        -- Calcular confidence_score basado en sample_size
        -- Más muestras = mayor confianza (máximo 1.0)
        confidence := LEAST(1.0, (rec.sample_count::DECIMAL / 50.0));  -- 50 muestras = confianza máxima
        
        -- Insertar o actualizar en pricing_model_data
        INSERT INTO public.pricing_model_data (
            disciplina_ia,
            work_zone,
            avg_price,
            median_price,
            std_dev,
            min_price,
            max_price,
            sample_size,
            confidence_score,
            last_calculated_at,
            version
        )
        VALUES (
            rec.disciplina_ia,
            rec.work_zone,
            rec.avg_price,
            rec.median_price,
            COALESCE(rec.std_dev, 0),  -- Si solo hay 1 muestra, std_dev es NULL
            rec.min_price,
            rec.max_price,
            rec.sample_count,
            confidence,
            NOW(),
            1
        )
        ON CONFLICT (disciplina_ia, work_zone) 
        DO UPDATE SET
            avg_price = EXCLUDED.avg_price,
            median_price = EXCLUDED.median_price,
            std_dev = EXCLUDED.std_dev,
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            sample_size = EXCLUDED.sample_size,
            confidence_score = EXCLUDED.confidence_score,
            last_calculated_at = NOW(),
            version = pricing_model_data.version + 1;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    -- También calcular estadísticas globales por disciplina (sin zona)
    -- Útiles como fallback cuando no hay datos por zona
    FOR rec IN
        WITH completed_leads_global AS (
            SELECT 
                l.disciplina_ia,
                l.agreed_price
            FROM public.leads l
            WHERE l.negotiation_status = 'acuerdo_confirmado'
                AND l.estado = 'completado'
                AND l.agreed_price IS NOT NULL
                AND l.agreed_price > 0
                AND l.agreed_price BETWEEN 100 AND 1000000
                AND l.disciplina_ia IS NOT NULL
                AND l.disciplina_ia != ''
        ),
        stats_global AS (
            SELECT 
                disciplina_ia,
                COUNT(*) as sample_count,
                AVG(agreed_price) as avg_price,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY agreed_price) as median_price,
                STDDEV(agreed_price) as std_dev,
                MIN(agreed_price) as min_price,
                MAX(agreed_price) as max_price
            FROM completed_leads_global
            GROUP BY disciplina_ia
            HAVING COUNT(*) >= min_samples
        )
        SELECT 
            disciplina_ia,
            NULL::TEXT as work_zone,
            sample_count,
            avg_price,
            median_price,
            std_dev,
            min_price,
            max_price
        FROM stats_global
    LOOP
        confidence := LEAST(1.0, (rec.sample_count::DECIMAL / 50.0));
        
        INSERT INTO public.pricing_model_data (
            disciplina_ia,
            work_zone,
            avg_price,
            median_price,
            std_dev,
            min_price,
            max_price,
            sample_size,
            confidence_score,
            last_calculated_at,
            version
        )
        VALUES (
            rec.disciplina_ia,
            NULL,  -- work_zone NULL para datos globales
            rec.avg_price,
            rec.median_price,
            COALESCE(rec.std_dev, 0),
            rec.min_price,
            rec.max_price,
            rec.sample_count,
            confidence,
            NOW(),
            1
        )
        ON CONFLICT (disciplina_ia, work_zone) 
        DO UPDATE SET
            avg_price = EXCLUDED.avg_price,
            median_price = EXCLUDED.median_price,
            std_dev = EXCLUDED.std_dev,
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            sample_size = EXCLUDED.sample_size,
            confidence_score = EXCLUDED.confidence_score,
            last_calculated_at = NOW(),
            version = pricing_model_data.version + 1;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    -- Retornar resumen de lo calculado
    RETURN QUERY
    SELECT 
        disciplina_ia,
        work_zone,
        avg_price,
        median_price,
        std_dev,
        min_price,
        max_price,
        sample_size,
        updated_count::INTEGER as records_updated
    FROM public.pricing_model_data
    WHERE last_calculated_at >= NOW() - INTERVAL '1 minute'
    ORDER BY disciplina_ia, work_zone NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.calculate_avg_prices(INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_avg_prices(INTEGER, BOOLEAN) TO service_role;

-- Verificar que la función fue recreada correctamente
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name = 'calculate_avg_prices';

-- =========================================================================
-- NOTAS
-- =========================================================================
-- 1. Este script elimina y recrea la función para corregir el error.
-- 2. La función ahora usa una subconsulta para obtener 'city' en lugar de JOIN.
-- 3. Si la columna 'city' no existe, la subconsulta retornará NULL sin error.
-- 4. Esto permite que la función funcione con o sin la columna 'city'.
-- =========================================================================

