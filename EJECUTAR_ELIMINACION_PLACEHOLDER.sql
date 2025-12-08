-- =========================================================================
-- SCRIPT DIRECTO: Eliminar productos con placeholder
-- =========================================================================
-- Ejecuta este script en Supabase SQL Editor
-- =========================================================================

-- PASO 1: Ver cuántos productos se eliminarán (EJECUTA PRIMERO)
SELECT 
    COUNT(*) as productos_a_eliminar,
    COUNT(DISTINCT category_id) as categorias_afectadas
FROM public.marketplace_products
WHERE 
    status = 'active'
    AND (
        images IS NULL 
        OR array_length(images, 1) IS NULL
        OR array_length(images, 1) = 0
        OR (
            array_length(images, 1) = 1 
            AND images[1] = '/images/marketplace/placeholder-tool.jpg'
        )
        OR '/images/marketplace/placeholder-tool.jpg' = ANY(images)
    );

-- PASO 2: Ver detalles de productos que se eliminarán (OPCIONAL)
SELECT 
    id,
    title,
    images,
    category_id,
    price,
    created_at
FROM public.marketplace_products
WHERE 
    status = 'active'
    AND (
        images IS NULL 
        OR array_length(images, 1) IS NULL
        OR array_length(images, 1) = 0
        OR (
            array_length(images, 1) = 1 
            AND images[1] = '/images/marketplace/placeholder-tool.jpg'
        )
        OR '/images/marketplace/placeholder-tool.jpg' = ANY(images)
    )
ORDER BY created_at DESC
LIMIT 20;

-- PASO 3: ELIMINAR (Soft Delete - Cambia status a 'deleted')
-- ⚠️ Descomenta y ejecuta solo después de revisar los resultados anteriores
UPDATE public.marketplace_products
SET 
    status = 'deleted',
    updated_at = NOW()
WHERE 
    status = 'active'
    AND (
        images IS NULL 
        OR array_length(images, 1) IS NULL
        OR array_length(images, 1) = 0
        OR (
            array_length(images, 1) = 1 
            AND images[1] = '/images/marketplace/placeholder-tool.jpg'
        )
        OR '/images/marketplace/placeholder-tool.jpg' = ANY(images)
    );

-- PASO 4: Verificar eliminación
SELECT 
    COUNT(*) as productos_eliminados
FROM public.marketplace_products
WHERE 
    status = 'deleted'
    AND updated_at >= NOW() - INTERVAL '5 minutes';

