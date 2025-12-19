-- =========================================================================
-- MIGRACIÓN: Actualizar Precios de Plomería según Mercado Real CDMX
-- =========================================================================
-- Fecha: 2025-01-18
-- Objetivo: Actualizar precios de servicios de plomería basados en análisis
--           de HomePRO y mercado actual de CDMX (2025)
-- Fuente: https://homepro.com.mx/blog/costos-proyectos-plomeria-cdmx
-- =========================================================================

-- 1. ACTUALIZAR REPARACIÓN DE FUGAS
-- HomePRO: $500 - $3,500 MXN
-- Web Search: $1,909 - $2,864 MXN (promedio)
-- Actualizar a rango competitivo: $500 - $2,000 MXN
-- Nombre exacto usado en config: "Reparación de Fuga de Agua"
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 500.00,
  max_price = 2000.00,
  description = 'Reparación de fugas en tuberías. Precio varía según ubicación, complejidad y tipo de material (cobre, PVC, termofusión). Incluye mano de obra. Materiales aparte.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Fuga%' OR service_name LIKE '%fuga%');

-- Si no existe, crear el servicio con nombre exacto usado en config
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Reparación de Fuga de Agua',
  'range',
  500.00,
  2000.00,
  'servicio',
  false,
  'Reparación de fugas en tuberías. Precio varía según ubicación, complejidad y tipo de material (cobre, PVC, termofusión). Incluye mano de obra. Materiales aparte.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Reparación de Fuga de Agua'
);

-- 2. ACTUALIZAR DESAZOLVE/DESTAPE DE DRENAJE
-- HomePRO: $300 - $1,000 MXN
-- Web Search: $2,029 - $3,043 MXN (con máquina)
-- Actualizar a rango: $800 - $2,500 MXN (más realista para servicio con máquina)
-- Nombre exacto usado en config: "Desazolve de Drenaje"
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 800.00,
  max_price = 2500.00,
  description = 'Desazolve de drenajes con máquina eléctrica K-50. Incluye desazolve de WC, lavabo o coladera. Sin romper pisos. Precio varía según complejidad y ubicación.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Destape%' OR service_name LIKE '%Desazolve%' OR service_name LIKE '%destape%' OR service_name LIKE '%desazolve%' OR service_name LIKE '%Drenaje%' OR service_name LIKE '%drenaje%');

-- Si no existe, crear el servicio con nombre exacto usado en config
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Desazolve de Drenaje',
  'range',
  800.00,
  2500.00,
  'servicio',
  false,
  'Desazolve de drenajes con máquina eléctrica K-50. Incluye desazolve de WC, lavabo o coladera. Sin romper pisos. Precio varía según complejidad y ubicación.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Desazolve de Drenaje'
);

-- 3. ACTUALIZAR CAMBIO DE LLAVES Y GRIFOS
-- HomePRO: $600 - $2,000 MXN
-- Actualizar a rango: $600 - $2,000 MXN
-- Nombre exacto usado en config: "Reparación de Llave" (pero también puede ser cambio)
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 600.00,
  max_price = 2000.00,
  description = 'Instalación, reparación o cambio de llaves y grifos. Incluye retiro de anterior (si aplica), instalación de nueva con conexiones. Precio varía según tipo (mezcladora, monomando, etc.). Materiales aparte.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Llave%' OR service_name LIKE '%Grifo%' OR service_name LIKE '%Mezcladora%' OR service_name LIKE '%llave%' OR service_name LIKE '%grifo%' OR service_name LIKE '%mezcladora%');

-- Si no existe, crear el servicio con nombre exacto usado en config
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Reparación de Llave',
  'range',
  600.00,
  2000.00,
  'pieza',
  false,
  'Reparación, instalación o cambio de llaves y grifos. Incluye retiro de anterior (si aplica), instalación de nueva con conexiones. Precio varía según tipo (mezcladora, monomando, etc.). Materiales aparte.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Reparación de Llave'
);

-- 4. ACTUALIZAR INSTALACIÓN DE SANITARIOS (WC)
-- HomePRO: $1,500 - $3,500 MXN
-- Actualizar a rango: $1,500 - $3,500 MXN
-- Nombre exacto usado en config: "Instalación de Sanitario"
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 1500.00,
  max_price = 3500.00,
  description = 'Instalación completa de sanitario (WC). Incluye desmontaje de anterior (si aplica), instalación con brida/cuello de cera, conexiones y sellado. No incluye el sanitario.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%WC%' OR service_name LIKE '%Sanitario%' OR service_name LIKE '%wc%' OR service_name LIKE '%sanitario%' OR service_name LIKE '%Taza%' OR service_name LIKE '%taza%');

-- Si no existe, crear el servicio con nombre exacto usado en config
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Instalación de Sanitario',
  'range',
  1500.00,
  3500.00,
  'pieza',
  false,
  'Instalación completa de sanitario (WC). Incluye desmontaje de anterior (si aplica), instalación con brida/cuello de cera, conexiones y sellado. No incluye el sanitario.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Instalación de Sanitario'
);

-- 5. ACTUALIZAR INSTALACIÓN DE LAVABOS Y FREGADEROS
-- HomePRO: $1,200 - $2,800 MXN
-- Actualizar a rango: $1,200 - $2,800 MXN
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 1200.00,
  max_price = 2800.00,
  description = 'Instalación completa de lavabo o fregadero. Incluye conexiones de agua y drenaje, instalación de mezcladora. Precio varía según tipo y complejidad. Materiales aparte.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Lavabo%' OR service_name LIKE '%Fregadero%' OR service_name LIKE '%lavabo%' OR service_name LIKE '%fregadero%');

-- Si no existe, crear el servicio
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Instalación de Lavabo o Fregadero',
  'range',
  1200.00,
  2800.00,
  'pieza',
  false,
  'Instalación completa de lavabo o fregadero. Incluye conexiones de agua y drenaje, instalación de mezcladora. Precio varía según tipo y complejidad. Materiales aparte.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Instalación de Lavabo o Fregadero'
);

-- 6. ACTUALIZAR INSTALACIÓN DE REGADERAS Y TINAS
-- HomePRO: $3,000 - $7,000 MXN
-- Actualizar a rango: $3,000 - $7,000 MXN
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 3000.00,
  max_price = 7000.00,
  description = 'Instalación de regadera o tina. Incluye conexiones de agua caliente y fría, drenaje, y ajustes necesarios. Precio varía según tipo y complejidad de la instalación. Materiales aparte.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Regadera%' OR service_name LIKE '%Tina%' OR service_name LIKE '%regadera%' OR service_name LIKE '%tina%');

-- Si no existe, crear el servicio
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Instalación de Regadera o Tina',
  'range',
  3000.00,
  7000.00,
  'pieza',
  false,
  'Instalación de regadera o tina. Incluye conexiones de agua caliente y fría, drenaje, y ajustes necesarios. Precio varía según tipo y complejidad de la instalación. Materiales aparte.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Instalación de Regadera o Tina'
);

-- 7. ACTUALIZAR INSTALACIÓN DE CALENTADORES
-- HomePRO: $3,000 - $8,000 MXN
-- Actualizar a rango: $3,000 - $8,000 MXN
-- Nombre exacto usado en config: "Instalación de Calentador"
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 3000.00,
  max_price = 8000.00,
  description = 'Instalación de calentador de agua (paso o depósito). Incluye conexión segura de gas y agua, purgado, y pruebas de funcionamiento. No incluye el calentador ni kit de instalación.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Calentador%' OR service_name LIKE '%Boiler%' OR service_name LIKE '%calentador%' OR service_name LIKE '%boiler%');

-- Si no existe, crear el servicio con nombre exacto usado en config
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Instalación de Calentador',
  'range',
  3000.00,
  8000.00,
  'equipo',
  false,
  'Instalación de calentador de agua (paso o depósito). Incluye conexión segura de gas y agua, purgado, y pruebas de funcionamiento. No incluye el calentador ni kit de instalación.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Instalación de Calentador'
);

-- 8. ACTUALIZAR INSTALACIÓN DE TINACOS
-- HomePRO: $1,000 - $2,500 MXN (450-750L: $1,000-$1,800, 1,100-1,200L: $1,800-$2,500)
-- Actualizar a rango: $1,000 - $2,500 MXN
-- Nombre exacto usado en config: "Instalación de Tinaco"
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 1000.00,
  max_price = 2500.00,
  description = 'Instalación de tinaco en azotea. Incluye subida (hasta 2 pisos), instalación hidráulica con jarro de aire y válvula check. Precio varía según capacidad (450-750L: $1,000-$1,800, 1,100-1,200L: $1,800-$2,500). No incluye base de albañilería ni el tinaco.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Tinaco%' OR service_name LIKE '%tinaco%');

-- Si no existe, crear el servicio con nombre exacto usado en config
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
SELECT 
  'plomeria',
  'Instalación de Tinaco',
  'range',
  1000.00,
  2500.00,
  'servicio',
  false,
  'Instalación de tinaco en azotea. Incluye subida (hasta 2 pisos), instalación hidráulica con jarro de aire y válvula check. Precio varía según capacidad (450-750L: $1,000-$1,800, 1,100-1,200L: $1,800-$2,500). No incluye base de albañilería ni el tinaco.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_catalog 
  WHERE discipline = 'plomeria' 
  AND service_name = 'Instalación de Tinaco'
);

-- 9. ACTUALIZAR INSTALACIÓN DE BOMBAS DE AGUA
-- Web Search: $8,960 MXN (promedio)
-- Actualizar a rango: $5,000 - $12,000 MXN
UPDATE public.service_catalog
SET 
  price_type = 'range',
  min_price = 5000.00,
  max_price = 12000.00,
  description = 'Instalación de bomba de agua (periférica o centrífuga). Incluye sustitución de equipo dañado, instalación con tuercas unión para fácil mantenimiento, y conexiones eléctricas básicas. No incluye la bomba.'
WHERE discipline = 'plomeria'
  AND (service_name LIKE '%Bomba%' OR service_name LIKE '%Presurizador%' OR service_name LIKE '%bomba%' OR service_name LIKE '%presurizador%');

-- 10. VERIFICACIÓN FINAL
-- Mostrar todos los servicios actualizados
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
ORDER BY min_price;

-- =========================================================================
-- RESUMEN DE CAMBIOS
-- =========================================================================
-- ✅ Reparación de Fugas: $500 - $2,000 MXN (antes: $550 starting_at)
-- ✅ Destape de Drenaje: $800 - $2,500 MXN (antes: $950 starting_at)
-- ✅ Cambio de Llaves/Grifos: $600 - $2,000 MXN (antes: $450 fixed)
-- ✅ Instalación de Sanitarios: $1,500 - $3,500 MXN (antes: $800 fixed)
-- ✅ Instalación de Lavabos: $1,200 - $2,800 MXN (antes: $450 fixed)
-- ✅ Instalación de Regaderas/Tinas: $3,000 - $7,000 MXN (antes: $650 starting_at)
-- ✅ Instalación de Calentadores: $3,000 - $8,000 MXN (antes: $1,100 starting_at)
-- ✅ Instalación de Tinacos: $1,000 - $2,500 MXN (antes: $2,200 starting_at)
-- ✅ Instalación de Bombas: $5,000 - $12,000 MXN (nuevo rango)
-- =========================================================================

