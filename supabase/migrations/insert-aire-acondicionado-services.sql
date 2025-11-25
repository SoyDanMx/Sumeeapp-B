-- =========================================================================
-- MIGRACIÓN: Insertar Servicios de Aire Acondicionado
-- =========================================================================
-- Fecha: 2025-11-23
-- Objetivo: Poblar catálogo de servicios de aire acondicionado con precios de mano de obra
-- Referencia: https://climassierramadre.com/instalacion-de-aire-acondicionado/
-- =========================================================================

-- Limpiar entradas previas de aire acondicionado para evitar duplicados
DELETE FROM public.service_catalog WHERE discipline = 'aire-acondicionado';

-- Insertar servicios de Aire Acondicionado
INSERT INTO public.service_catalog 
(discipline, service_name, price_type, min_price, max_price, unit, includes_materials, description)
VALUES 
-- 1. MINISPLITS (Sistemas Split)
('aire-acondicionado', 'Instalación de Minisplit 1 Tonelada', 'range', 1500, 4000, 'equipo', false, 'Instalación completa de minisplit 1 tonelada. Incluye perforaciones, conexiones eléctricas y de refrigerante. No incluye el equipo ni materiales adicionales.'),
('aire-acondicionado', 'Instalación de Minisplit 2 Toneladas', 'range', 3500, 5500, 'equipo', false, 'Instalación completa de minisplit 2 toneladas. Incluye perforaciones, conexiones eléctricas y de refrigerante. No incluye el equipo ni materiales adicionales.'),
('aire-acondicionado', 'Instalación de Minisplit 3 Toneladas', 'range', 5500, 8000, 'equipo', false, 'Instalación completa de minisplit 3 toneladas. Incluye perforaciones, conexiones eléctricas y de refrigerante. No incluye el equipo ni materiales adicionales.'),

-- 2. EQUIPOS CENTRALES (Sistemas más complejos)
('aire-acondicionado', 'Instalación de Equipo Central 3 Toneladas', 'range', 15000, 25000, 'equipo', false, 'Instalación de sistema centralizado de 3 toneladas. Incluye conexiones, ductos básicos y configuración. No incluye el equipo ni materiales adicionales.'),
('aire-acondicionado', 'Instalación de Sistema de Ductos Completo', 'range', 30000, 50000, 'sistema', false, 'Instalación completa de sistema de ductos para aire acondicionado central. Incluye diseño, instalación de ductos y conexiones. No incluye el equipo ni materiales adicionales.'),

-- 3. MANTENIMIENTO Y REPARACIONES
('aire-acondicionado', 'Mantenimiento Preventivo (Limpieza)', 'fixed', 800, NULL, 'equipo', true, 'Limpieza de filtros, serpentines y drenaje. Incluye revisión general y materiales de limpieza. Precio por equipo.'),
('aire-acondicionado', 'Recarga de Gas Refrigerante', 'starting_at', 1200, NULL, 'servicio', false, 'Recarga de gas refrigerante (R-410A o R-22 según el equipo). Incluye detección de fugas básica. El gas se cobra aparte.'),
('aire-acondicionado', 'Reparación de Fuga de Refrigerante', 'starting_at', 1500, NULL, 'punto', false, 'Localización y reparación de fuga de refrigerante. Incluye soldadura o reparación de conexiones. Materiales aparte.'),
('aire-acondicionado', 'Cambio de Capacitor', 'fixed', 600, NULL, 'pieza', false, 'Sustitución de capacitor dañado. Incluye diagnóstico y instalación. No incluye el capacitor.'),
('aire-acondicionado', 'Limpieza Profunda de Unidad Exterior', 'fixed', 1000, NULL, 'equipo', true, 'Limpieza profunda de serpentines, ventilador y drenaje de unidad exterior. Incluye materiales de limpieza.'),

-- 4. SERVICIOS ESPECIALIZADOS
('aire-acondicionado', 'Adecuación Eléctrica para Minisplit', 'starting_at', 2000, NULL, 'servicio', false, 'Instalación de línea eléctrica dedicada (110V o 220V) desde centro de carga hasta el equipo. Incluye breaker y cableado básico. Materiales aparte.'),
('aire-acondicionado', 'Instalación de Base/Soporte para Unidad Exterior', 'fixed', 800, NULL, 'pieza', false, 'Instalación de base de concreto o soporte metálico para unidad exterior. Incluye anclajes. Materiales aparte.'),
('aire-acondicionado', 'Reparación de Tablero Electrónico', 'starting_at', 2500, NULL, 'servicio', false, 'Diagnóstico y reparación de tablero electrónico del equipo. Incluye soldadura de componentes. Repuestos aparte.');

-- Verificar los datos insertados
SELECT 
    service_name,
    min_price,
    max_price,
    price_type,
    unit,
    includes_materials,
    description
FROM public.service_catalog
WHERE discipline = 'aire-acondicionado'
ORDER BY min_price;

