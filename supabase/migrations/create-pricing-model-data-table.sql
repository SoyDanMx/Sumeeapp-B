-- =========================================================================
-- MIGRACIÓN: Crear Tabla de Conocimiento Histórico de Precios
-- =========================================================================
-- Esta tabla almacena estadísticas históricas de precios acordados,
-- desacoplando el cálculo pesado de la predicción en tiempo real y
-- mejorando el rendimiento de la Edge Function.
-- =========================================================================

-- 1. CREAR TABLA pricing_model_data
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.pricing_model_data (
    id SERIAL PRIMARY KEY,
    disciplina_ia TEXT NOT NULL,
    work_zone TEXT,  -- NULL para datos globales por disciplina
    avg_price DECIMAL(10,2) NOT NULL CHECK (avg_price >= 0),
    median_price DECIMAL(10,2) CHECK (median_price >= 0),
    std_dev DECIMAL(10,2) CHECK (std_dev >= 0),
    min_price DECIMAL(10,2) CHECK (min_price >= 0),
    max_price DECIMAL(10,2) CHECK (max_price >= 0),
    sample_size INTEGER NOT NULL CHECK (sample_size > 0),
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    
    -- Constraint: max debe ser >= min
    CONSTRAINT check_price_range CHECK (max_price IS NULL OR min_price IS NULL OR max_price >= min_price),
    
    -- Constraint: avg debe estar entre min y max
    CONSTRAINT check_avg_in_range CHECK (
        (min_price IS NULL OR max_price IS NULL) OR 
        (avg_price >= min_price AND avg_price <= max_price)
    ),
    
    -- Constraint: unique por disciplina y zona
    CONSTRAINT unique_disciplina_zone UNIQUE (disciplina_ia, work_zone)
);

-- 2. AGREGAR ÍNDICES PARA OPTIMIZACIÓN
-- =========================================================================

-- Índice compuesto para búsquedas rápidas por disciplina y zona
CREATE INDEX IF NOT EXISTS idx_pricing_disciplina_zone 
    ON public.pricing_model_data(disciplina_ia, work_zone) 
    WHERE work_zone IS NOT NULL;

-- Índice para búsquedas globales (sin zona)
CREATE INDEX IF NOT EXISTS idx_pricing_disciplina_global 
    ON public.pricing_model_data(disciplina_ia) 
    WHERE work_zone IS NULL;

-- Índice para ordenar por última actualización
CREATE INDEX IF NOT EXISTS idx_pricing_last_calculated 
    ON public.pricing_model_data(last_calculated_at DESC);

-- 3. AGREGAR COMENTARIOS PARA DOCUMENTACIÓN
-- =========================================================================

COMMENT ON TABLE public.pricing_model_data IS 
    'Tabla de conocimiento histórico de precios. Almacena estadísticas calculadas de precios acordados para mejorar predicciones de IA.';

COMMENT ON COLUMN public.pricing_model_data.disciplina_ia IS 
    'Disciplina del servicio (ej: Electricidad, Plomería).';

COMMENT ON COLUMN public.pricing_model_data.work_zone IS 
    'Zona geográfica (ciudad, delegación o código postal). NULL para datos globales por disciplina.';

COMMENT ON COLUMN public.pricing_model_data.avg_price IS 
    'Precio promedio acordado para esta disciplina/zona.';

COMMENT ON COLUMN public.pricing_model_data.median_price IS 
    'Precio mediano (más robusto que promedio, menos sensible a outliers).';

COMMENT ON COLUMN public.pricing_model_data.std_dev IS 
    'Desviación estándar de los precios. Usado para definir rango min/max.';

COMMENT ON COLUMN public.pricing_model_data.min_price IS 
    'Precio mínimo histórico acordado.';

COMMENT ON COLUMN public.pricing_model_data.max_price IS 
    'Precio máximo histórico acordado.';

COMMENT ON COLUMN public.pricing_model_data.sample_size IS 
    'Número de leads usados para el cálculo. Mayor tamaño = mayor confianza.';

COMMENT ON COLUMN public.pricing_model_data.confidence_score IS 
    'Nivel de confianza del modelo (0-1). Basado en sample_size y antigüedad de datos.';

COMMENT ON COLUMN public.pricing_model_data.last_calculated_at IS 
    'Timestamp de la última vez que se calcularon estos datos.';

COMMENT ON COLUMN public.pricing_model_data.version IS 
    'Versión del modelo. Incrementa cuando hay cambios significativos en el cálculo.';

-- 4. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =========================================================================

CREATE OR REPLACE FUNCTION update_pricing_model_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe antes de crearlo (idempotente)
DROP TRIGGER IF EXISTS trigger_update_pricing_model_data_updated_at ON public.pricing_model_data;

CREATE TRIGGER trigger_update_pricing_model_data_updated_at
    BEFORE UPDATE ON public.pricing_model_data
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_model_data_updated_at();

-- 5. VERIFICACIÓN
-- =========================================================================

-- Verificar que la tabla fue creada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pricing_model_data'
ORDER BY ordinal_position;

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. work_zone puede ser NULL para datos globales por disciplina.
-- 2. sample_size debe ser >= 5 para tener confianza mínima.
-- 3. confidence_score se calcula basado en sample_size y antigüedad.
-- 4. La tabla se actualiza mediante función RPC calculate_avg_prices().
-- 5. Los índices optimizan consultas en tiempo real desde Edge Function.
-- =========================================================================

