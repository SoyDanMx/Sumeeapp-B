-- =========================================================================
-- MIGRACIÓN: Agregar Servicios de Plomería basados en HomePRO
-- =========================================================================
-- Fecha: 2025-01-18
-- Objetivo: Agregar servicios nuevos de plomería identificados en HomePRO
-- Fuente: https://homepro.com.mx/
-- =========================================================================

-- 1. INSTALACIÓN Y MANTENIMIENTO DE LÍNEA DE GAS
-- HomePRO: $588 - $883 MXN (residencial), $1,176 - $1,766 MXN (comercial)
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Instalación y Mantenimiento de Línea de Gas',
  'range',
  588.00,
  883.00,
  'servicio',
  false,
  'Instalación y mantenimiento de líneas de gas para estufas, calentadores y otros equipos. Incluye conexión segura, pruebas de hermeticidad y certificación. No incluye materiales ni el equipo.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Instalación y Mantenimiento de Línea de Gas'
);

-- 2. REPARACIÓN DE FUGAS EN LLAVES O LAVABOS
-- HomePRO: $1,150 - $1,725 MXN (residencial), $2,300 - $3,450 MXN (comercial)
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Reparación de Fugas en Llaves o Lavabos',
  'range',
  1150.00,
  1725.00,
  'pieza',
  false,
  'Reparación específica de fugas en grifería (llaves, mezcladoras, monomandos). Incluye diagnóstico, reparación o cambio de empaques, y pruebas de funcionamiento. Materiales aparte.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Reparación de Fugas en Llaves o Lavabos'
);

-- 3. CAMBIO DE TUBERÍA (POR METRO)
-- HomePRO: $300 - $700 MXN (residencial), $600 - $1,200 MXN (comercial)
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Cambio de Tubería (por metro)',
  'range',
  300.00,
  700.00,
  'metro',
  false,
  'Cambio de tubería por metro lineal. Incluye retiro de tubería antigua, instalación de nueva (cobre, PVC o termofusión según el caso), conexiones y pruebas. Precio por metro. Materiales aparte.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Cambio de Tubería (por metro)'
);

-- 4. LAVADO Y DESINFECCIÓN DE CISTERNAS
-- HomePRO: $1,500 - $3,500 MXN (2-4 horas, según tamaño)
-- Actualizar servicio existente de tinacos y agregar cisternas
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 1500.00,
  max_price = 3500.00,
  description = 'Lavado y desinfección completa de cisternas y tinacos. Incluye vaciado, tallado profundo, desinfección con cloro, y llenado. Tiempo estimado: 2-4 horas según tamaño. Precio varía según capacidad (hasta 1,100L: $1,500-$2,500, mayores: $2,500-$3,500).'
WHERE discipline = 'plomeria'
  AND service_name = 'Lavado y Desinfección de Tinaco';

-- Agregar servicio específico para cisternas
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Lavado y Desinfección de Cisternas',
  'range',
  2000.00,
  3500.00,
  'servicio',
  true,
  'Lavado y desinfección completa de cisternas. Incluye vaciado, tallado profundo, desinfección con cloro, y llenado. Tiempo estimado: 3-4 horas. Precio varía según capacidad y accesibilidad. Incluye materiales de desinfección.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Lavado y Desinfección de Cisternas'
);

-- 5. ACTUALIZAR INSTALACIÓN DE TINACOS (Considerar precio de HomePRO)
-- HomePRO: $2,225 - $3,338 MXN (residencial)
-- Actual: $1,000 - $2,500 MXN
-- Actualizar mínimo a $1,500 para ser más competitivo
UPDATE public.service_catalog
SET 
  min_price = 1500.00,
  max_price = 3500.00,
  description = 'Instalación de tinaco en azotea. Incluye subida (hasta 2 pisos), instalación hidráulica con jarro de aire y válvula check. Precio varía según capacidad (450-750L: $1,500-$2,200, 1,100-1,200L: $2,200-$3,500). No incluye base de albañilería ni el tinaco.'
WHERE discipline = 'plomeria'
  AND service_name LIKE '%Tinaco%'
  AND service_name LIKE '%Instalación%';

-- 6. VERIFICACIÓN FINAL
SELECT 
    service_name,
    price_type,
    min_price,
    max_price,
    unit,
    includes_materials,
    description
FROM public.service_catalog
WHERE discipline = 'plomeria'
  AND (
    service_name LIKE '%Gas%' OR
    service_name LIKE '%Llave%' OR
    service_name LIKE '%Tubería%' OR
    service_name LIKE '%Cisterna%' OR
    service_name LIKE '%Tinaco%'
  )
ORDER BY min_price;

-- =========================================================================
-- RESUMEN DE SERVICIOS AGREGADOS/ACTUALIZADOS
-- =========================================================================
-- ✅ Instalación y Mantenimiento de Línea de Gas: $588 - $883 MXN
-- ✅ Reparación de Fugas en Llaves o Lavabos: $1,150 - $1,725 MXN
-- ✅ Cambio de Tubería (por metro): $300 - $700 MXN
-- ✅ Lavado y Desinfección de Cisternas: $2,000 - $3,500 MXN
-- ✅ Actualizado: Lavado de Tinacos: $1,500 - $3,500 MXN
-- ✅ Actualizado: Instalación de Tinacos: $1,500 - $3,500 MXN
-- =========================================================================

