-- =========================================================================
-- Optimización de Rendimiento para Categoría Sistemas
-- =========================================================================
-- Este script crea índices compuestos optimizados para mejorar el rendimiento
-- de las queries de categorías, especialmente para la categoría "sistemas"
-- que tiene 2,255 productos.
-- =========================================================================

-- Paso 1: Crear índice compuesto optimizado para queries por categoría y status
-- Este índice es crítico para queries como: WHERE category_id = X AND status = 'active'
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_status 
ON public.marketplace_products(category_id, status) 
WHERE status = 'active';

-- Paso 2: Crear índice compuesto para ordenamiento por fecha de creación
-- Útil para queries que ordenan por created_at DESC
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_status_created 
ON public.marketplace_products(category_id, status, created_at DESC) 
WHERE status = 'active';

-- Paso 3: Verificar que el índice de category_id existe y es eficiente
-- (Ya debería existir, pero lo verificamos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'marketplace_products' 
        AND indexname = 'idx_marketplace_products_category'
    ) THEN
        CREATE INDEX idx_marketplace_products_category 
        ON public.marketplace_products(category_id);
    END IF;
END $$;

-- Paso 4: Crear índice parcial para productos activos (más eficiente)
-- Este índice solo incluye productos activos, reduciendo el tamaño del índice
CREATE INDEX IF NOT EXISTS idx_marketplace_products_active_category 
ON public.marketplace_products(category_id) 
WHERE status = 'active';

-- Paso 5: Actualizar estadísticas para optimizar el planificador de consultas
ANALYZE public.marketplace_products;

-- Paso 6: Verificación - Mostrar índices creados
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'marketplace_products' 
AND indexname LIKE '%category%' OR indexname LIKE '%status%'
ORDER BY indexname;


