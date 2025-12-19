-- =========================================================================
-- MIGRACIÓN: Actualizar Servicios - Especificar "Sin Materiales" y Agregar CCTV
-- =========================================================================
-- Fecha: 2025-01-17
-- Objetivo: 
-- 1. Especificar claramente "Solo Mano de Obra" en servicios sin materiales
-- 2. Agregar instalación de cámara CCTV con precio fijo $800
-- 3. Mejorar descripciones para claridad
-- =========================================================================

-- 1. ACTUALIZAR SERVICIOS PARA ESPECIFICAR "SIN MATERIALES"
-- =========================================================================

-- Instalación de Contacto - Especificar Solo Mano de Obra
UPDATE public.service_catalog
SET 
    description = 'Instalación de contacto eléctrico simple. Precio fijo garantizado. Solo mano de obra profesional - los materiales (contacto, cable, caja) se compran aparte o se cotizan por separado.',
    includes_materials = false
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Contacto';

-- Instalación de Apagador - Especificar Solo Mano de Obra
UPDATE public.service_catalog
SET 
    description = 'Instalación de apagador sencillo o doble. Precio fijo garantizado. Solo mano de obra profesional - los materiales (apagador, cable, caja) se compran aparte o se cotizan por separado.',
    includes_materials = false
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Apagador';

-- Reparación de Fuga - Especificar Solo Mano de Obra
UPDATE public.service_catalog
SET 
    description = 'Reparación de fuga de llave simple. Precio fijo garantizado. Solo mano de obra profesional - los materiales (empaques, llave nueva si es necesario) se compran aparte o se cotizan por separado.',
    includes_materials = false,
    min_price = 400.00,
    price_type = 'fixed'
WHERE discipline = 'plomeria'
  AND service_name = 'Reparación de Fuga de Agua';

-- Si no existe el servicio con precio fijo, crearlo
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
    'plomeria',
    'Reparación de Fuga Simple',
    'fixed',
    400.00,
    'servicio',
    false,
    'Reparación de fuga de llave simple. Precio fijo garantizado. Solo mano de obra profesional - los materiales (empaques, llave nueva si es necesario) se compran aparte o se cotizan por separado.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.service_catalog 
    WHERE discipline = 'plomeria' 
    AND service_name = 'Reparación de Fuga Simple'
);

-- 2. AGREGAR SERVICIO DE INSTALACIÓN DE CÁMARA CCTV
-- =========================================================================

INSERT INTO public.service_catalog (
    discipline, 
    service_name, 
    price_type, 
    min_price, 
    unit, 
    includes_materials,
    description,
    is_active
) VALUES
    ('cctv', 'Instalación de Cámara CCTV', 'fixed', 800.00, 'servicio', false,
     'Instalación profesional de cámara CCTV estándar. Incluye montaje, conexión de cables y configuración básica. Precio fijo garantizado. Solo mano de obra profesional - la cámara, cables, DVR/NVR y accesorios se compran aparte o se cotizan por separado.'),
    
    ('cctv', 'Instalación de Sistema CCTV Completo (4 cámaras)', 'fixed', 2800.00, 'servicio', false,
     'Instalación completa de sistema CCTV con 4 cámaras. Incluye montaje de todas las cámaras, tendido de cables, instalación de DVR/NVR y configuración del sistema. Precio fijo garantizado. Solo mano de obra profesional - las cámaras, DVR/NVR, cables y accesorios se compran aparte o se cotizan por separado.');

-- 3. ACTUALIZAR DESCRIPCIONES DE SERVICIOS DE MONTAGE PARA CLARIDAD
-- =========================================================================

-- Actualizar descripciones para especificar que no incluyen materiales cuando aplica
UPDATE public.service_catalog
SET description = description || ' Solo mano de obra profesional - los materiales se compran aparte o se cotizan por separado.'
WHERE discipline = 'montaje-armado'
  AND includes_materials = false
  AND description NOT LIKE '%Solo mano de obra%';

-- 4. AGREGAR NOTA GENERAL EN DESCRIPCIONES DE SERVICIOS SIN MATERIALES
-- =========================================================================

-- Función helper para actualizar descripciones existentes que no especifican materiales
UPDATE public.service_catalog
SET description = CASE 
    WHEN description NOT LIKE '%materiales%' AND description NOT LIKE '%mano de obra%' THEN
        description || ' Solo mano de obra profesional - los materiales se compran aparte o se cotizan por separado.'
    ELSE description
END
WHERE includes_materials = false
  AND discipline IN ('electricidad', 'plomeria', 'cctv', 'montaje-armado');

-- 5. VERIFICACIÓN
-- =========================================================================

-- Verificar servicios actualizados
SELECT 
    discipline,
    service_name,
    price_type,
    min_price,
    includes_materials,
    CASE 
        WHEN includes_materials THEN 'Incluye materiales'
        ELSE 'Solo mano de obra'
    END as tipo_precio,
    LEFT(description, 100) as descripcion_corta
FROM public.service_catalog
WHERE discipline IN ('electricidad', 'plomeria', 'cctv', 'montaje-armado')
  AND (service_name LIKE '%Contacto%' 
       OR service_name LIKE '%Apagador%'
       OR service_name LIKE '%Fuga%'
       OR service_name LIKE '%CCTV%')
ORDER BY discipline, min_price;

-- Contar servicios por tipo
SELECT 
    discipline,
    COUNT(*) as total,
    COUNT(CASE WHEN price_type = 'fixed' THEN 1 END) as precio_fijo,
    COUNT(CASE WHEN includes_materials = false THEN 1 END) as sin_materiales,
    COUNT(CASE WHEN includes_materials = true THEN 1 END) as con_materiales
FROM public.service_catalog
WHERE is_active = true
GROUP BY discipline
ORDER BY discipline;

