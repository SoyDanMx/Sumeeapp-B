-- Script de verificación: Productos sin imágenes reales
-- Ejecuta este script primero para ver cuántos productos se eliminarán

-- Contar productos afectados
SELECT 
    COUNT(*) as total_productos_sin_imagen,
    COUNT(DISTINCT category_id) as categorias_afectadas
FROM public.marketplace_products
WHERE 
    status = 'active'
    AND (
        -- Caso 1: Array vacío o null
        images IS NULL 
        OR array_length(images, 1) IS NULL
        OR array_length(images, 1) = 0
        -- Caso 2: Solo contiene placeholder
        OR (
            array_length(images, 1) = 1 
            AND images[1] = '/images/marketplace/placeholder-tool.jpg'
        )
        -- Caso 3: Contiene placeholder en cualquier posición
        OR '/images/marketplace/placeholder-tool.jpg' = ANY(images)
    );

-- Ver detalles de productos afectados
SELECT 
    id,
    title,
    images,
    category_id,
    price,
    status,
    created_at,
    seller_id
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
LIMIT 50;

-- Verificar por categoría
SELECT 
    category_id,
    COUNT(*) as productos_sin_imagen
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
GROUP BY category_id
ORDER BY productos_sin_imagen DESC;

