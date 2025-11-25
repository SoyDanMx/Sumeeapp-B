-- =========================================================================
-- MIGRACIÓN: Actualizar Precios de Servicios Específicos
-- =========================================================================
-- Fecha: 2025-11-23
-- Objetivo: Corregir precios de servicios según requerimientos
-- =========================================================================

-- Actualizar precios de servicios de Electricidad

-- 1. Instalación de Contacto: Desde $150 -> Desde $350
UPDATE public.service_catalog
SET min_price = 350.00,
    updated_at = NOW()
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Contacto';

-- 2. Instalación de Apagador: Desde $200 -> Desde $350
UPDATE public.service_catalog
SET min_price = 350.00,
    updated_at = NOW()
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Apagador';

-- 3. Instalación de Lámpara: Desde $350 -> Desde $500
UPDATE public.service_catalog
SET min_price = 500.00,
    updated_at = NOW()
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Lámpara';

-- 4. Instalación de Mufa: Desde $2,900 -> Desde $1,200
UPDATE public.service_catalog
SET min_price = 1200.00,
    updated_at = NOW()
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Mufa';

-- Verificar los cambios
SELECT 
    service_name,
    min_price,
    price_type,
    updated_at
FROM public.service_catalog
WHERE discipline = 'electricidad'
  AND service_name IN (
    'Instalación de Contacto',
    'Instalación de Apagador',
    'Instalación de Lámpara',
    'Instalación de Mufa'
  )
ORDER BY min_price;

