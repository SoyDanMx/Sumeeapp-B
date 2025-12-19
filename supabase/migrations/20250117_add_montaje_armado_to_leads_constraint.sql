-- =========================================================================
-- MIGRACIÓN: Actualizar Constraint de leads.servicio para incluir nuevas disciplinas
-- =========================================================================
-- Fecha: 2025-01-17
-- Objetivo: Agregar "montaje-armado", "aire-acondicionado", "cctv", "wifi", 
--           "fumigacion", "cerrajeria", "tablaroca", "construccion" al constraint
-- =========================================================================

-- Actualizar constraint para servicio
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_servicio_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_servicio_check 
  CHECK (servicio IN (
    -- Disciplinas originales
    'plomeria',
    'electricidad',
    'carpinteria',
    'pintura',
    'limpieza',
    'jardineria',
    'albanileria',
    'remodelacion',
    'impermeabilizacion',
    'gas',
    'calentadores',
    'bombas_agua',
    'seguridad',
    'climatizacion',
    'electrodomesticos',
    -- 🆕 Nuevas disciplinas agregadas
    'montaje-armado',
    'aire-acondicionado',
    'cctv',
    'wifi',
    'fumigacion',
    'cerrajeria',
    'tablaroca',
    'construccion'
  ));

-- Verificar que el constraint se aplicó correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Constraint leads_servicio_check actualizado con nuevas disciplinas';
  RAISE NOTICE 'Disciplinas permitidas: plomeria, electricidad, carpinteria, pintura, limpieza, jardineria, albanileria, remodelacion, impermeabilizacion, gas, calentadores, bombas_agua, seguridad, climatizacion, electrodomesticos, montaje-armado, aire-acondicionado, cctv, wifi, fumigacion, cerrajeria, tablaroca, construccion';
END $$;

