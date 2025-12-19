-- =========================================================================
-- SCRIPT DE VERIFICACIÓN: Precios de Plomería Actualizados
-- =========================================================================
-- Ejecuta este script para verificar si los precios están actualizados
-- =========================================================================

-- Verificar servicios principales de plomería
SELECT 
    service_name AS "Servicio",
    price_type AS "Tipo Precio",
    min_price AS "Precio Mínimo",
    max_price AS "Precio Máximo",
    unit AS "Unidad",
    includes_materials AS "Incluye Materiales",
    CASE 
        WHEN price_type = 'range' AND max_price IS NOT NULL THEN 
            CONCAT('$', min_price::text, ' - $', max_price::text, ' MXN')
        WHEN price_type = 'fixed' THEN 
            CONCAT('$', min_price::text, ' MXN')
        ELSE 
            CONCAT('Desde $', min_price::text, ' MXN')
    END AS "Rango de Precio"
FROM public.service_catalog
WHERE discipline = 'plomeria'
  AND is_active = true
  AND (
    service_name LIKE '%Fuga%' OR
    service_name LIKE '%Drenaje%' OR
    service_name LIKE '%Llave%' OR
    service_name LIKE '%Sanitario%' OR
    service_name LIKE '%Lavabo%' OR
    service_name LIKE '%Regadera%' OR
    service_name LIKE '%Calentador%' OR
    service_name LIKE '%Tinaco%' OR
    service_name LIKE '%Gas%' OR
    service_name LIKE '%Tubería%' OR
    service_name LIKE '%Cisterna%'
  )
ORDER BY min_price;

-- Verificar servicios nuevos de HomePRO
SELECT 
    '✅ SERVICIOS NUEVOS DE HOMEPRO' AS "Verificación",
    COUNT(*) AS "Cantidad"
FROM public.service_catalog
WHERE discipline = 'plomeria'
  AND is_active = true
  AND (
    service_name = 'Instalación y Mantenimiento de Línea de Gas' OR
    service_name = 'Reparación de Fugas en Llaves o Lavabos' OR
    service_name = 'Cambio de Tubería (por metro)' OR
    service_name = 'Lavado y Desinfección de Cisternas'
  );

-- Resumen de precios actualizados
SELECT 
    'RESUMEN DE PRECIOS' AS "Categoría",
    COUNT(*) AS "Total Servicios",
    COUNT(CASE WHEN price_type = 'range' THEN 1 END) AS "Con Rango",
    COUNT(CASE WHEN price_type = 'fixed' THEN 1 END) AS "Precio Fijo",
    COUNT(CASE WHEN price_type = 'starting_at' THEN 1 END) AS "Desde",
    MIN(min_price) AS "Precio Mínimo General",
    MAX(COALESCE(max_price, min_price)) AS "Precio Máximo General"
FROM public.service_catalog
WHERE discipline = 'plomeria'
  AND is_active = true;

