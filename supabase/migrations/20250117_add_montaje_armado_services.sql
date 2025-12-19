-- =========================================================================
-- MIGRACIÓN: Agregar Servicios de Montaje y Armado con Precios Fijos
-- =========================================================================
-- Fecha: 2025-01-17
-- Objetivo: Agregar servicios de montaje/armado con precios fijos según mercado CDMX
-- Basado en análisis de benchmarking con TaskRabbit
-- =========================================================================

-- 1. AGREGAR SERVICIOS DE MONTAGE Y ARMADO
-- =========================================================================

-- Servicios de Montaje (Montaje de TV, Estantes, Arte, etc.)
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
    -- Montaje de TV
    ('montaje-armado', 'Montar TV en Pared', 'fixed', 800.00, 'servicio', false, 
     'Montaje profesional de TV hasta 65 pulgadas en pared estándar. Incluye anclajes, nivelación y cable management básico. No incluye TV >65" ni paredes especiales (concreto reforzado, drywall sin estructura).'),
    
    ('montaje-armado', 'Montar TV Grande (66"-85")', 'fixed', 1200.00, 'servicio', false,
     'Montaje de TV grande de 66" a 85" pulgadas. Incluye anclajes reforzados, nivelación profesional y cable management avanzado.'),
    
    -- Armado de Muebles
    ('montaje-armado', 'Armar Mueble IKEA Estándar', 'fixed', 600.00, 'servicio', false,
     'Armado completo de mueble IKEA estándar (hasta 2m de altura). Incluye desempaque, armado completo y limpieza. No incluye muebles >2m ni modificaciones personalizadas.'),
    
    ('montaje-armado', 'Armar Mueble IKEA Grande', 'fixed', 900.00, 'servicio', false,
     'Armado de mueble IKEA grande (>2m) o con múltiples piezas. Incluye desempaque, armado completo y limpieza.'),
    
    ('montaje-armado', 'Armar Cuna/Bebé', 'fixed', 700.00, 'servicio', false,
     'Armado completo de cuna, cambiador o mueble para bebé. Incluye verificación de seguridad y ajustes finales.'),
    
    ('montaje-armado', 'Armar Mueble Genérico', 'fixed', 650.00, 'servicio', false,
     'Armado de mueble genérico (no IKEA) hasta 2m. Incluye desempaque, armado y limpieza.'),
    
    -- Montaje de Estantes y Almacenamiento
    ('montaje-armado', 'Montar Estantes en Pared', 'fixed', 500.00, 'servicio', false,
     'Montaje de hasta 3 estantes en pared estándar. Incluye nivelación, anclajes y ajustes. No incluye estantes >20kg ni paredes especiales.'),
    
    ('montaje-armado', 'Montar Rack de TV/Mueble', 'fixed', 550.00, 'servicio', false,
     'Montaje de rack o mueble para TV. Incluye ensamblaje y montaje en pared si aplica.'),
    
    -- Montaje de Arte y Decoración
    ('montaje-armado', 'Colgar Cuadros/Arte (Hasta 3)', 'fixed', 400.00, 'servicio', false,
     'Colgado profesional de hasta 3 cuadros o piezas de arte. Incluye nivelación, anclajes y distribución equilibrada.'),
    
    ('montaje-armado', 'Colgar Cuadros/Arte (4-6 piezas)', 'fixed', 600.00, 'servicio', false,
     'Colgado profesional de 4 a 6 cuadros o piezas de arte con distribución equilibrada y nivelación perfecta.'),
    
    -- Instalación de Cortinas
    ('montaje-armado', 'Instalar Cortinas (Hasta 3 ventanas)', 'fixed', 600.00, 'servicio', false,
     'Instalación de cortinas con riel o varilla en hasta 3 ventanas. Incluye montaje de soportes y colocación de cortinas.'),
    
    ('montaje-armado', 'Instalar Cortinas (4+ ventanas)', 'fixed', 900.00, 'servicio', false,
     'Instalación de cortinas con riel o varilla en 4 o más ventanas. Incluye montaje completo y distribución uniforme.'),
    
    -- Servicios Especializados de Montaje
    ('montaje-armado', 'Montar Espejo Grande', 'fixed', 500.00, 'servicio', false,
     'Montaje seguro de espejo grande (>1m²) en pared. Incluye anclajes reforzados y nivelación profesional.'),
    
    ('montaje-armado', 'Instalar Lámpara Colgante', 'fixed', 450.00, 'servicio', false,
     'Instalación de lámpara colgante o de techo. Incluye conexión eléctrica básica y montaje seguro.'),
    
    ('montaje-armado', 'Montar Ventilador de Techo', 'fixed', 800.00, 'servicio', false,
     'Montaje completo de ventilador de techo. Incluye instalación eléctrica, soporte reforzado y balanceo.'),
    
    -- Servicios Combinados
    ('montaje-armado', 'Paquete Montaje Completo (TV + Estantes)', 'fixed', 1200.00, 'servicio', false,
     'Paquete completo: Montaje de TV + hasta 3 estantes. Ahorra $100 vs servicios individuales.');

-- 2. ACTUALIZAR SERVICIOS EXISTENTES CON PRECIOS FIJOS DONDE APLIQUE
-- =========================================================================

-- Actualizar servicios de Electricidad con precios fijos para servicios simples
UPDATE public.service_catalog
SET price_type = 'fixed',
    min_price = 350.00,
    description = 'Instalación de apagador sencillo o doble. Precio fijo garantizado.'
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Apagador';

UPDATE public.service_catalog
SET price_type = 'fixed',
    min_price = 350.00,
    description = 'Instalación de contacto eléctrico simple. Precio fijo garantizado.'
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Contacto';

UPDATE public.service_catalog
SET price_type = 'fixed',
    min_price = 500.00,
    description = 'Instalación de lámpara colgante o empotrada. Precio fijo garantizado.'
WHERE discipline = 'electricidad'
  AND service_name = 'Instalación de Lámpara';

-- Actualizar servicios de Plomería con precios fijos para servicios simples
UPDATE public.service_catalog
SET price_type = 'fixed',
    min_price = 400.00,
    description = 'Reparación de fuga de llave simple. Precio fijo garantizado.'
WHERE discipline = 'plomeria'
  AND service_name = 'Reparación de Fuga de Agua'
  AND min_price = 500.00;

UPDATE public.service_catalog
SET price_type = 'fixed',
    min_price = 350.00,
    description = 'Instalación de llave de paso o mezcladora. Precio fijo garantizado.'
WHERE discipline = 'plomeria'
  AND service_name = 'Instalación de Llave de Agua';

UPDATE public.service_catalog
SET price_type = 'fixed',
    min_price = 450.00,
    description = 'Cambio de válvula de escusado estándar. Precio fijo garantizado.'
WHERE discipline = 'plomeria'
  AND service_name = 'Cambio de Válvula de Escusado';

-- Actualizar servicios de Limpieza con precios fijos
UPDATE public.service_catalog
SET price_type = 'fixed',
    min_price = 800.00,
    unit = 'servicio',
    includes_materials = true,
    description = 'Limpieza residencial básica hasta 80m². Incluye materiales básicos. Precio fijo garantizado.'
WHERE discipline = 'limpieza'
  AND service_name LIKE '%Limpieza%';

-- Si no existe servicio de limpieza, crearlo
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
    'limpieza',
    'Limpieza Residencial Básica',
    'fixed',
    800.00,
    'servicio',
    true,
    'Limpieza residencial básica hasta 80m² (3 horas). Incluye materiales básicos. Precio fijo garantizado.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.service_catalog 
    WHERE discipline = 'limpieza' 
    AND service_name = 'Limpieza Residencial Básica'
);

-- 3. VERIFICACIÓN
-- =========================================================================

-- Verificar servicios agregados
SELECT 
    discipline,
    service_name,
    price_type,
    min_price,
    unit,
    includes_materials,
    description
FROM public.service_catalog
WHERE discipline = 'montaje-armado'
ORDER BY min_price;

-- Contar servicios por disciplina
SELECT 
    discipline,
    COUNT(*) as total_servicios,
    COUNT(CASE WHEN price_type = 'fixed' THEN 1 END) as servicios_precio_fijo,
    COUNT(CASE WHEN is_active = true THEN 1 END) as servicios_activos
FROM public.service_catalog
GROUP BY discipline
ORDER BY discipline;

