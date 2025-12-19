-- =========================================================================
-- MIGRACIÓN: Renombrar servicios de IKEA a "Armado de muebles"
-- =========================================================================
-- Fecha: 2025-01-17
-- Objetivo: Eliminar referencias a marca IKEA y usar nombre genérico
-- =========================================================================

-- Actualizar nombre del servicio "Armar Mueble IKEA Estándar" a "Armado de muebles"
UPDATE public.service_catalog
SET service_name = 'Armado de muebles',
    description = 'Armado completo de mueble estándar (hasta 2m de altura). Incluye desempaque, armado completo y limpieza. No incluye muebles >2m ni modificaciones personalizadas.'
WHERE discipline = 'montaje-armado'
  AND service_name = 'Armar Mueble IKEA Estándar';

-- Actualizar nombre del servicio "Armar Mueble IKEA Grande" a "Armado de muebles grandes"
UPDATE public.service_catalog
SET service_name = 'Armado de muebles grandes',
    description = 'Armado de mueble grande (>2m) o con múltiples piezas. Incluye desempaque, armado completo y limpieza.'
WHERE discipline = 'montaje-armado'
  AND service_name = 'Armar Mueble IKEA Grande';

-- Actualizar descripción del servicio "Armar Mueble Genérico" para eliminar referencia a IKEA
UPDATE public.service_catalog
SET description = 'Armado de mueble genérico hasta 2m. Incluye desempaque, armado y limpieza.'
WHERE discipline = 'montaje-armado'
  AND service_name = 'Armar Mueble Genérico'
  AND description LIKE '%IKEA%';

-- Verificar cambios
SELECT 
    discipline,
    service_name,
    price_type,
    min_price,
    description
FROM public.service_catalog
WHERE discipline = 'montaje-armado'
  AND (service_name LIKE '%mueble%' OR service_name LIKE '%Mueble%')
ORDER BY min_price;

