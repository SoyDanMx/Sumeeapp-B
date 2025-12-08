-- =========================================================================
-- MIGRACIÓN: Eliminar productos sin imágenes reales del marketplace
-- =========================================================================
-- Fecha: 2025-01-21
-- Objetivo: Eliminar productos que solo tienen imagen placeholder genérica
-- =========================================================================

-- PASO 1: Verificar productos afectados (solo para referencia, no ejecuta cambios)
-- Descomentar para ver qué productos se eliminarán:
/*
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
    )
ORDER BY created_at DESC;
*/

-- PASO 2: Soft Delete - Cambiar status a 'deleted' (RECOMENDADO)
-- Esto preserva los datos por si se necesitan en el futuro
UPDATE public.marketplace_products
SET 
    status = 'deleted',
    updated_at = NOW()
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
        -- Caso 3: Contiene placeholder en cualquier posición del array
        OR '/images/marketplace/placeholder-tool.jpg' = ANY(images)
    );

-- PASO 3: Verificar resultado (opcional, descomentar para ver)
/*
SELECT 
    COUNT(*) as productos_eliminados,
    COUNT(DISTINCT category_id) as categorias_afectadas
FROM public.marketplace_products
WHERE status = 'deleted'
    AND updated_at >= NOW() - INTERVAL '1 minute';
*/

-- NOTA: Si prefieres HARD DELETE (eliminación permanente), usa esto en lugar del UPDATE:
/*
DELETE FROM public.marketplace_products
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
*/

