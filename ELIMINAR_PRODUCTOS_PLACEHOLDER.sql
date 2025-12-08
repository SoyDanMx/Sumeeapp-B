-- =========================================================================
-- SCRIPT: Eliminar productos con imagen placeholder del marketplace
-- =========================================================================
-- IMPORTANTE: Ejecuta primero VERIFICAR_PRODUCTOS_SIN_IMAGENES.sql
-- para ver cuántos productos se eliminarán
-- =========================================================================

-- OPCIÓN 1: SOFT DELETE (RECOMENDADO) - Cambia status a 'deleted'
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

-- Verificar cuántos se eliminaron
SELECT 
    COUNT(*) as productos_eliminados
FROM public.marketplace_products
WHERE 
    status = 'deleted'
    AND updated_at >= NOW() - INTERVAL '1 minute';

-- =========================================================================
-- OPCIÓN 2: HARD DELETE (ELIMINACIÓN PERMANENTE)
-- ⚠️ ADVERTENCIA: Esta acción NO se puede deshacer
-- Descomenta solo si estás seguro de eliminar permanentemente
-- =========================================================================
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

