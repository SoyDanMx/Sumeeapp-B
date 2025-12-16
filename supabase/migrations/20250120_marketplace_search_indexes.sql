-- =========================================================================
-- MÓDULO 1: Índices de Búsqueda para Marketplace
-- =========================================================================
-- Este script activa la extensión pg_trgm y crea índices para búsquedas
-- difusas rápidas en title y description
-- =========================================================================

-- Paso 1: Activar extensión pg_trgm para búsquedas difusas (trigramas)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Paso 2: Crear índices GIN para búsquedas de texto completo en title
-- GIN es más eficiente para búsquedas ILIKE con pg_trgm
CREATE INDEX IF NOT EXISTS idx_marketplace_products_title_trgm 
ON public.marketplace_products 
USING GIN (title gin_trgm_ops);

-- Paso 3: Crear índices GIN para búsquedas de texto completo en description
CREATE INDEX IF NOT EXISTS idx_marketplace_products_description_trgm 
ON public.marketplace_products 
USING GIN (description gin_trgm_ops);

-- Paso 4: Crear índice compuesto para búsquedas combinadas (title + description)
-- Esto mejora las búsquedas que buscan en ambos campos
CREATE INDEX IF NOT EXISTS idx_marketplace_products_title_description_trgm 
ON public.marketplace_products 
USING GIN ((title || ' ' || COALESCE(description, '')) gin_trgm_ops);

-- Paso 5: Crear función helper para búsqueda optimizada
-- Esta función usa los índices GIN para búsquedas rápidas
CREATE OR REPLACE FUNCTION search_marketplace_products(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price NUMERIC,
    category_id UUID,
    images TEXT[],
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.id,
        mp.title,
        mp.description,
        mp.price,
        mp.category_id,
        mp.images,
        GREATEST(
            similarity(mp.title, search_query),
            similarity(COALESCE(mp.description, ''), search_query)
        ) as similarity_score
    FROM public.marketplace_products mp
    WHERE 
        mp.status = 'active'
        AND (
            mp.title ILIKE '%' || search_query || '%'
            OR mp.description ILIKE '%' || search_query || '%'
            OR mp.title % search_query  -- Operador de similitud de pg_trgm
            OR mp.description % search_query
        )
    ORDER BY 
        similarity_score DESC,
        mp.views_count DESC,
        mp.created_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- Paso 6: Crear índice adicional para búsquedas por precio (útil para filtros)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_price_range 
ON public.marketplace_products(price) 
WHERE status = 'active';

-- Paso 7: Crear índice compuesto para búsquedas por categoría y precio
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_price 
ON public.marketplace_products(category_id, price) 
WHERE status = 'active';

-- Paso 8: Crear índice para búsquedas por condición
CREATE INDEX IF NOT EXISTS idx_marketplace_products_condition 
ON public.marketplace_products(condition) 
WHERE status = 'active';

-- Paso 9: Crear índice para power_type (si existe la columna)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_products' 
        AND column_name = 'power_type'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_marketplace_products_power_type 
        ON public.marketplace_products(power_type) 
        WHERE status = 'active' AND power_type IS NOT NULL;
    END IF;
END $$;

-- Paso 10: Actualizar estadísticas para optimizar el planificador de consultas
ANALYZE public.marketplace_products;

-- Verificación: Mostrar índices creados
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'marketplace_products'
    AND indexname LIKE '%trgm%';
    
    RAISE NOTICE '✅ Índices de búsqueda creados:';
    RAISE NOTICE '   Índices pg_trgm: %', index_count;
    RAISE NOTICE '   Extensión pg_trgm activada: %', 
        (SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'));
END $$;

