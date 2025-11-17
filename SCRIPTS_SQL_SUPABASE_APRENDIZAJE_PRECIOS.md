# 📋 SCRIPTS SQL PARA SUPABASE - Aprendizaje de Precios Históricos

## ⚠️ **IMPORTANTE: Ejecutar en orden**

Ejecuta estos scripts en el **SQL Editor** de Supabase, **uno por uno**, en el orden indicado.

## 🔧 **SI OBTIENES ERROR: "column city does not exist"**

Si ejecutaste el Script 2 y obtuviste el error `column "city" does not exist`, ejecuta este script de corrección V2 que usa SQL dinámico:

**SCRIPT DE CORRECCIÓN V2 (Ejecutar para corregir el error):**

Este script usa SQL dinámico para evitar errores de compilación cuando la columna `city` no existe.

```sql
-- =========================================================================
-- SCRIPT DE CORRECCIÓN V2: Arreglar función calculate_avg_prices
-- =========================================================================
-- Este script corrige la función calculate_avg_prices para que funcione
-- con o sin la columna 'city' en la tabla profiles.
-- Usa SQL dinámico para evitar errores de compilación.
-- =========================================================================

-- Eliminar la función existente (si existe)
DROP FUNCTION IF EXISTS public.calculate_avg_prices(INTEGER, BOOLEAN);

-- Recrear la función con la versión corregida que usa SQL dinámico
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
-- 1. Este script usa SQL dinámico (EXECUTE) para construir la query solo
--    cuando la columna 'city' existe, evitando errores de compilación.
-- 2. Si la columna 'city' no existe, work_zone será siempre NULL (datos globales).
-- 3. La función funciona correctamente con o sin la columna 'city'.
-- =========================================================================
```

**✅ Después de ejecutar este script de corrección V2, continúa con el Script 3.**

---

---

## 📝 **SCRIPT 0: Agregar Columna 'city' a profiles (Si no existe)**

**Ejecutar primero** - Asegura que la columna `city` existe en la tabla `profiles`.

```sql
-- =========================================================================
-- SCRIPT: Agregar Columna 'city' a profiles si no existe
-- =========================================================================
-- Este script agrega la columna 'city' a la tabla profiles si no existe.
-- Ejecutar ANTES de ejecutar create-calculate-avg-prices-function.sql
-- =========================================================================

-- Verificar si la columna 'city' ya existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'city'
  ) THEN
    -- Agregar columna 'city' si no existe
    ALTER TABLE public.profiles 
    ADD COLUMN city TEXT;
    
    -- Establecer valor por defecto para registros existentes
    UPDATE public.profiles 
    SET city = 'Ciudad de México' 
    WHERE city IS NULL;
    
    RAISE NOTICE '✅ Columna "city" agregada exitosamente a la tabla profiles';
  ELSE
    RAISE NOTICE 'ℹ️ La columna "city" ya existe en la tabla profiles';
  END IF;
END $$;

-- Verificar resultado
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'city';
```

**✅ Verificación esperada:** Deberías ver una fila con `column_name = 'city'`.

---

## 📝 **SCRIPT 1: Crear Tabla `pricing_model_data`**

**Ejecutar primero** - Crea la tabla que almacenará las estadísticas históricas.

```sql
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
```

**✅ Verificación esperada:** Deberías ver una tabla con las columnas de `pricing_model_data`.

---

## 📝 **SCRIPT 2: Crear Función RPC `calculate_avg_prices`**

**Ejecutar segundo** - Crea la función que calcula las estadísticas históricas.

```sql
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
BEGIN
    -- Limpiar datos antiguos (opcional: mantener solo última versión)
    -- DELETE FROM public.pricing_model_data WHERE version < (SELECT MAX(version) FROM public.pricing_model_data);
    
    -- Calcular estadísticas por disciplina y zona (si use_work_zone = true)
    FOR rec IN
        WITH completed_leads AS (
            SELECT 
                l.disciplina_ia,
                CASE 
                    WHEN use_work_zone THEN 
                        -- Intentar obtener city del perfil (puede ser NULL si la columna no existe)
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
```

**✅ Verificación esperada:** Deberías ver una fila con `routine_name = 'calculate_avg_prices'`.

---

## 📝 **SCRIPT 3: Ejecutar Cálculo Inicial**

**Ejecutar tercero** - Calcula las estadísticas iniciales basadas en leads completados existentes.

```sql
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
```

**✅ Verificación esperada:**
- **Primera consulta:** Muestra cuántos leads completados hay disponibles para el cálculo.
- **Segunda consulta:** Muestra la distribución por disciplina (útil para ver qué disciplinas tienen datos).
- **Tercera consulta:** Ejecuta el cálculo y muestra los resultados.
- **Cuarta consulta:** Muestra todos los registros calculados en `pricing_model_data`.
- **Quinta consulta:** Muestra estadísticas de resumen (total de registros, disciplinas, muestras, etc.).
- **Sexta consulta:** Indica si hay datos por zona o solo globales.

**⚠️ Notas importantes:**
- Si no hay suficientes leads completados (mínimo 5 por grupo), la tabla puede estar vacía (es normal al inicio).
- Si la columna `city` no existe en `profiles`, `work_zone` será `NULL` y solo se calcularán datos globales por disciplina.
- El sistema funciona sin datos históricos hasta que haya suficientes leads completados. No es un error si la tabla está vacía al inicio.

---

## 🚀 **PASOS SIGUIENTES**

1. ✅ **Desplegar Edge Function actualizada:**
   - Ve a **Supabase Dashboard** → **Edge Functions** → **classify-service**
   - Copia el contenido de `supabase/functions/classify-service/index.ts`
   - Pega y haz clic en **"Deploy"**

2. ✅ **Configurar Cron Job (Opcional):**
   - Ve a **Database** → **Cron Jobs** (o usa `pg_cron`)
   - Crea un job que ejecute: `SELECT * FROM public.calculate_avg_prices(5, true);`
   - Programa: `0 2 * * *` (diario a las 2 AM)

3. ✅ **Probar el sistema:**
   - Crea un nuevo lead desde el dashboard del cliente
   - Verifica que la Edge Function consulta datos históricos (revisa logs)
   - Verifica que el prompt incluye contexto histórico (si hay datos)

---

## ⚠️ **NOTAS IMPORTANTES**

- **Cold Start:** Al inicio no habrá datos históricos. El sistema funciona sin ellos.
- **Mínimo de muestras:** Requiere mínimo 5 leads completados por disciplina/zona.
- **Ejecución periódica:** Ejecuta `calculate_avg_prices()` periódicamente (cron job) para mantener datos actualizados.
- **Sin errores:** Si no hay suficientes leads, no es un error. El sistema funcionará con precios de mercado generales hasta que haya datos históricos.

---

**✅ Listo para ejecutar en Supabase SQL Editor**

