-- =====================================================
-- Optimización de Índices para Productos con Precio > 0
-- =====================================================
-- Fecha: 2025-01-22
-- Descripción: Crea índices parciales optimizados para consultas que excluyen productos con precio 0
-- =====================================================

-- 1. Índice parcial para productos activos con precio > 0 (optimiza consultas principales)
-- Este índice es especialmente útil para las consultas del marketplace que filtran por status='active' y price > 0
CREATE INDEX IF NOT EXISTS idx_marketplace_products_active_price_gt_zero 
ON public.marketplace_products (category_id, price, created_at DESC)
WHERE status = 'active' AND price > 0;

-- 2. Índice parcial para búsquedas de texto en productos con precio > 0
-- Optimiza las búsquedas en SmartSearch y MaterialSelector
CREATE INDEX IF NOT EXISTS idx_marketplace_products_title_description_price_gt_zero_trgm
ON public.marketplace_products 
USING gin (
  ((title || ' ' || COALESCE(description, ''))) gin_trgm_ops
)
WHERE status = 'active' AND price > 0;

-- 3. Índice parcial para filtros de precio en productos activos
-- Optimiza las consultas con rangos de precio (minPrice, maxPrice)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_price_range_active_gt_zero
ON public.marketplace_products (price)
WHERE status = 'active' AND price > 0;

-- 4. Índice parcial para categoría y precio (optimiza consultas por categoría)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_price_active_gt_zero
ON public.marketplace_products (category_id, price, views_count DESC, likes_count DESC)
WHERE status = 'active' AND price > 0;

-- 5. Índice parcial para condición y precio (optimiza filtros de condición)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_condition_price_active_gt_zero
ON public.marketplace_products (condition, price)
WHERE status = 'active' AND price > 0;

-- 6. Índice parcial para external_code y sku en productos con precio > 0
-- Optimiza búsquedas por SKU o código externo
CREATE INDEX IF NOT EXISTS idx_marketplace_products_external_code_sku_price_gt_zero
ON public.marketplace_products (external_code, sku)
WHERE status = 'active' AND price > 0 AND (external_code IS NOT NULL OR sku IS NOT NULL);

-- =====================================================
-- Comentarios de Documentación
-- =====================================================

COMMENT ON INDEX idx_marketplace_products_active_price_gt_zero IS 
'Índice parcial optimizado para consultas principales del marketplace que excluyen productos con precio 0';

COMMENT ON INDEX idx_marketplace_products_title_description_price_gt_zero_trgm IS 
'Índice GIN para búsquedas de texto completo en productos con precio > 0';

COMMENT ON INDEX idx_marketplace_products_price_range_active_gt_zero IS 
'Índice para filtros de rango de precio en productos activos con precio > 0';

COMMENT ON INDEX idx_marketplace_products_category_price_active_gt_zero IS 
'Índice compuesto para consultas por categoría con ordenamiento por popularidad en productos con precio > 0';

COMMENT ON INDEX idx_marketplace_products_condition_price_active_gt_zero IS 
'Índice para filtros de condición en productos activos con precio > 0';

COMMENT ON INDEX idx_marketplace_products_external_code_sku_price_gt_zero IS 
'Índice para búsquedas por SKU o código externo en productos con precio > 0';

-- =====================================================
-- Verificación de Índices Creados
-- =====================================================

-- Para verificar que los índices se crearon correctamente, ejecuta:
-- SELECT 
--     indexname, 
--     indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'marketplace_products' 
--     AND indexname LIKE '%price_gt_zero%' 
--     OR indexname LIKE '%gt_zero%'
-- ORDER BY indexname;

