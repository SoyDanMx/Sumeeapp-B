-- =========================================================================
-- MIGRACIÓN: Insertar Servicios de Plomería
-- =========================================================================
-- Fecha: 2025-11-23
-- Objetivo: Poblar catálogo de servicios de plomería con precios de mano de obra
-- =========================================================================

-- Limpiar entradas previas de plomería para evitar duplicados
DELETE FROM public.service_catalog WHERE discipline = 'plomeria';

-- Insertar servicios de Plomería
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, unit, includes_materials, description)
VALUES 
-- 1. EQUIPOS MAYORES (Tinacos y Calentadores)
('plomeria', 'Instalación de Tinaco (Azotea)', 'starting_at', 2200, 'servicio', false, 'Subida (hasta 2 pisos) e instalación hidráulica con jarro de aire y válvula check. No incluye base de albañilería ni el tinaco.'),
('plomeria', 'Lavado y Desinfección de Tinaco', 'fixed', 850, 'servicio', true, 'Vaciado, tallado profundo y pastilla de cloro. Precio por unidad hasta 1,100L.'),
('plomeria', 'Instalación de Boiler (Paso/Depósito)', 'starting_at', 1100, 'equipo', false, 'Conexión segura de gas y agua. Incluye purgado. No incluye el boiler ni kit de instalación.'),
('plomeria', 'Instalación de Calentador Solar', 'starting_at', 3500, 'equipo', false, 'Armado de estructura, interconexión a tinaco y bajada de agua caliente. Requiere base plana.'),

-- 2. BOMBAS Y PRESIÓN (Datos técnicos)
('plomeria', 'Cambio de Bomba de Agua (Periférica/Centrífuga)', 'starting_at', 950, 'servicio', false, 'Sustitución de equipo dañado. Instalación con tuercas unión para fácil mantenimiento.'),
('plomeria', 'Instalación de Presurizador (Bajo Tinaco)', 'starting_at', 1200, 'equipo', false, 'Bomba compacta para aumentar presión en regaderas. Instalación eléctrica básica incluida.'),
('plomeria', 'Automatización (Electroniveles)', 'starting_at', 950, 'kit', false, 'Instalación de electrodos en cisterna y tinaco para llenado automático. Evita que la bomba trabaje en seco.'),

-- 3. BAÑOS Y GRIFERÍA (Estética y Calidad)
('plomeria', 'Cambio de WC (Taza de Baño)', 'fixed', 800, 'pieza', false, 'Desmontaje, instalación con brida/cuello de cera y sellado antihongos. No incluye el WC.'),
('plomeria', 'Instalación de Mezcladora (Lavabo/Fregadero)', 'fixed', 450, 'pieza', false, 'Retiro de anterior y colocación de nueva con mangueras coflex. Cero goteos.'),
('plomeria', 'Instalación de Regadera/Monomando', 'starting_at', 650, 'pieza', false, 'Cambio de brazo y cebolla o monomando externo.'),

-- 4. REPARACIONES (Urgencias)
('plomeria', 'Destape de Drenaje (Con Máquina)', 'starting_at', 950, 'servicio', false, 'Desazolve de WC, lavabo o coladera usando equipo eléctrico K-50. Sin romper pisos.'),
('plomeria', 'Reparación de Fuga Visible (Tubo)', 'starting_at', 550, 'punto', false, 'Reparación en cobre o termofusión (Tuboplus). Incluye soldadura/fusión. Materiales aparte.'),
('plomeria', 'Cambio de Herrajes de WC (Sapo/Válvula)', 'fixed', 450, 'tanque', false, 'Solución a fugas silenciosas o tanque que no llena. No incluye el kit de herrajes.');

-- Verificar los datos insertados
SELECT 
    service_name,
    min_price,
    price_type,
    unit,
    includes_materials,
    description
FROM public.service_catalog
WHERE discipline = 'plomeria'
ORDER BY min_price;

