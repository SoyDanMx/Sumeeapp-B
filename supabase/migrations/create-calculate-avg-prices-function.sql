-- =========================================================================
-- MIGRACIÓN: Función RPC para Calcular Estadísticas Históricas de Precios
-- =========================================================================
-- Esta función calcula y actualiza el precio promedio, mediana, desviación
-- estándar y otros estadísticos de los leads completados, agrupados por
-- disciplina y zona geográfica.
-- =========================================================================

-- 1. CREAR FUNCIÓN calculate_avg_prices
-- =========================================================================

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
    sql_text TEXT;
BEGIN
    -- Verificar si la columna 'city' existe en la tabla profiles
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'city'
    ) INTO city_column_exists;
    
    -- Construir la query dinámicamente según si city existe o no
    IF use_work_zone AND city_column_exists THEN
        -- Query con city
        sql_text := '
        WITH completed_leads AS (
            SELECT 
                l.disciplina_ia,
                (SELECT city FROM public.profiles WHERE user_id = l.cliente_id LIMIT 1) as work_zone,
                l.agreed_price
            FROM public.leads l
            WHERE l.negotiation_status = ''acuerdo_confirmado''
                AND l.estado = ''completado''
                AND l.agreed_price IS NOT NULL
                AND l.agreed_price > 0
                AND l.agreed_price BETWEEN 100 AND 1000000
                AND l.disciplina_ia IS NOT NULL
                AND l.disciplina_ia != ''''
        ),
        stats_by_group AS (
            SELECT 
                completed_leads.disciplina_ia,
                completed_leads.work_zone,
                COUNT(*) as sample_count,
                AVG(completed_leads.agreed_price) as avg_price,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY completed_leads.agreed_price) as median_price,
                STDDEV(completed_leads.agreed_price) as std_dev,
                MIN(completed_leads.agreed_price) as min_price,
                MAX(completed_leads.agreed_price) as max_price
            FROM completed_leads
            GROUP BY completed_leads.disciplina_ia, completed_leads.work_zone
            HAVING COUNT(*) >= $1
        )
        SELECT * FROM stats_by_group';
    ELSE
        -- Query sin city (work_zone siempre NULL)
        sql_text := '
        WITH completed_leads AS (
            SELECT 
                l.disciplina_ia,
                NULL::TEXT as work_zone,
                l.agreed_price
            FROM public.leads l
            WHERE l.negotiation_status = ''acuerdo_confirmado''
                AND l.estado = ''completado''
                AND l.agreed_price IS NOT NULL
                AND l.agreed_price > 0
                AND l.agreed_price BETWEEN 100 AND 1000000
                AND l.disciplina_ia IS NOT NULL
                AND l.disciplina_ia != ''''
        ),
        stats_by_group AS (
            SELECT 
                completed_leads.disciplina_ia,
                completed_leads.work_zone,
                COUNT(*) as sample_count,
                AVG(completed_leads.agreed_price) as avg_price,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY completed_leads.agreed_price) as median_price,
                STDDEV(completed_leads.agreed_price) as std_dev,
                MIN(completed_leads.agreed_price) as min_price,
                MAX(completed_leads.agreed_price) as max_price
            FROM completed_leads
            GROUP BY completed_leads.disciplina_ia, completed_leads.work_zone
            HAVING COUNT(*) >= $1
        )
        SELECT * FROM stats_by_group';
    END IF;
    
    -- Ejecutar la query dinámica y procesar resultados
    FOR rec IN EXECUTE sql_text USING min_samples
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
                completed_leads_global.disciplina_ia,
                COUNT(*) as sample_count,
                AVG(completed_leads_global.agreed_price) as avg_price,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY completed_leads_global.agreed_price) as median_price,
                STDDEV(completed_leads_global.agreed_price) as std_dev,
                MIN(completed_leads_global.agreed_price) as min_price,
                MAX(completed_leads_global.agreed_price) as max_price
            FROM completed_leads_global
            GROUP BY completed_leads_global.disciplina_ia
            HAVING COUNT(*) >= min_samples
        )
        SELECT 
            stats_global.disciplina_ia,
            NULL::TEXT as work_zone,
            stats_global.sample_count,
            stats_global.avg_price,
            stats_global.median_price,
            stats_global.std_dev,
            stats_global.min_price,
            stats_global.max_price
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
        p.disciplina_ia,
        p.work_zone,
        p.avg_price,
        p.median_price,
        p.std_dev,
        p.min_price,
        p.max_price,
        p.sample_size,
        updated_count::INTEGER as records_updated
    FROM public.pricing_model_data p
    WHERE p.last_calculated_at >= NOW() - INTERVAL '1 minute'
    ORDER BY p.disciplina_ia, p.work_zone NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- 2. OTORGAR PERMISOS
-- =========================================================================

GRANT EXECUTE ON FUNCTION public.calculate_avg_prices(INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_avg_prices(INTEGER, BOOLEAN) TO service_role;

-- 3. COMENTARIOS
-- =========================================================================

COMMENT ON FUNCTION public.calculate_avg_prices IS 
'Calcula estadísticas históricas de precios acordados agrupadas por disciplina y zona.
Actualiza la tabla pricing_model_data con promedios, medianas, desviaciones estándar, etc.
Requiere mínimo de muestras (default: 5) para tener confianza en los datos.
Puede calcular por zona (use_work_zone=true) o solo por disciplina (use_work_zone=false).';

-- 4. VERIFICACIÓN
-- =========================================================================

-- Verificar que la función fue creada
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name = 'calculate_avg_prices';

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. La función filtra solo leads con negotiation_status = 'acuerdo_confirmado'
--    y estado = 'completado' para asegurar datos de calidad.
-- 2. Requiere mínimo de muestras (default: 5) para evitar estadísticas poco confiables.
-- 3. Calcula tanto datos por zona como globales (sin zona) para fallbacks.
-- 4. Usa ON CONFLICT para actualizar registros existentes.
-- 5. confidence_score se calcula basado en sample_size (máximo 1.0 con 50+ muestras).
-- 6. Ejecutar esta función periódicamente (cron job diario/semanal) para mantener
--    los datos actualizados.
-- =========================================================================

