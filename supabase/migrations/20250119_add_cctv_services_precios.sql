-- =========================================================================
-- MIGRACIÓN: Agregar Servicios de CCTV con Precios Fijos
-- =========================================================================
-- Fecha: 2025-01-19
-- Objetivo: Agregar servicios específicos de CCTV con precios fijos para la página de precios
-- =========================================================================

-- 1. AGREGAR SERVICIOS DE CCTV CON PRECIOS FIJOS
-- =========================================================================

-- Instalación de Cámara Individual
INSERT INTO public.service_catalog (
    discipline, 
    service_name, 
    price_type, 
    min_price, 
    unit, 
    includes_materials,
    description,
    is_active
)
SELECT 
    'cctv',
    'Instalar Cámara',
    'fixed',
    800.00,
    'servicio',
    false,
    'Instalación profesional de cámara CCTV individual. Incluye montaje, conexión de cables y configuración básica. Precio fijo garantizado. Solo mano de obra profesional - la cámara, cables y accesorios se compran aparte o se cotizan por separado.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.service_catalog 
    WHERE discipline = 'cctv' 
    AND service_name = 'Instalar Cámara'
);

-- Instalación de Canalizaciones con Cableado de Red
INSERT INTO public.service_catalog (
    discipline, 
    service_name, 
    price_type, 
    min_price, 
    unit, 
    includes_materials,
    description,
    is_active
)
SELECT 
    'cctv',
    'Instalar Canalizaciones de Cámara con Cableado de Red',
    'fixed',
    100.00,
    'metro lineal',
    false,
    'Instalación de canalizaciones para cámaras CCTV con cableado de red incluido. Precio por metro lineal. Incluye canalización, cable de red (categoría 5e o superior) y conexiones básicas. Precio fijo garantizado.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.service_catalog 
    WHERE discipline = 'cctv' 
    AND service_name = 'Instalar Canalizaciones de Cámara con Cableado de Red'
);

-- Instalación de Kit de 4 Cámaras
INSERT INTO public.service_catalog (
    discipline, 
    service_name, 
    price_type, 
    min_price, 
    unit, 
    includes_materials,
    description,
    is_active
)
SELECT 
    'cctv',
    'Instalar Kit de 4 Cámaras',
    'fixed',
    2000.00,
    'servicio',
    false,
    'Instalación completa de kit de 4 cámaras CCTV. Incluye montaje de las 4 cámaras, conexión de cableado contenido en el kit y configuración del sistema. Precio fijo garantizado. Solo mano de obra profesional - el kit de cámaras con su cableado incluido se compra aparte. No incluye canalizaciones adicionales.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.service_catalog 
    WHERE discipline = 'cctv' 
    AND service_name = 'Instalar Kit de 4 Cámaras'
);

-- 2. ACTUALIZAR SERVICIOS EXISTENTES DE CCTV SI EXISTEN
-- =========================================================================

-- Actualizar "Instalación de Cámara CCTV" si existe para que coincida con el nuevo servicio
UPDATE public.service_catalog
SET 
    service_name = 'Instalar Cámara',
    price_type = 'fixed',
    min_price = 800.00,
    description = 'Instalación profesional de cámara CCTV individual. Incluye montaje, conexión de cables y configuración básica. Precio fijo garantizado. Solo mano de obra profesional - la cámara, cables y accesorios se compran aparte o se cotizan por separado.'
WHERE discipline = 'cctv' 
  AND (service_name = 'Instalación de Cámara CCTV' OR service_name = 'Instalación de Cámara')
  AND service_name != 'Instalar Cámara';

-- Actualizar "Instalación de Sistema CCTV Completo (4 cámaras)" si existe
UPDATE public.service_catalog
SET 
    service_name = 'Instalar Kit de 4 Cámaras',
    price_type = 'fixed',
    min_price = 2000.00,
    description = 'Instalación completa de kit de 4 cámaras CCTV. Incluye montaje de las 4 cámaras, conexión de cableado contenido en el kit y configuración del sistema. Precio fijo garantizado. Solo mano de obra profesional - el kit de cámaras con su cableado incluido se compra aparte. No incluye canalizaciones adicionales.'
WHERE discipline = 'cctv' 
  AND (service_name LIKE '%4 cámaras%' OR service_name LIKE '%4 camaras%')
  AND service_name != 'Instalar Kit de 4 Cámaras';

