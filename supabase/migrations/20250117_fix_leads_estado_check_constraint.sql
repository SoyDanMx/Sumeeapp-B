-- =========================================================================
-- FIX: Actualizar constraint leads_estado_check para incluir 'aceptado'
-- =========================================================================
-- El constraint actual no incluye 'aceptado' que es usado por accept_lead RPC
-- =========================================================================

-- Eliminar constraint existente
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_estado_check;

-- Agregar constraint actualizado con 'aceptado' y 'Aceptado'
ALTER TABLE public.leads
  ADD CONSTRAINT leads_estado_check 
  CHECK (estado IN (
    'Nuevo', 'nuevo',
    'Aceptado', 'aceptado',
    'Asignado', 'asignado',
    'Contactado', 'contactado',
    'En Progreso', 'en_progreso',
    'en_camino',
    'Completado', 'completado',
    'Cancelado', 'cancelado'
  ));

-- =========================================================================
-- Verificación
-- =========================================================================
-- Para verificar que el constraint se aplicó correctamente:
-- SELECT 
--     conname AS constraint_name,
--     pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conname = 'leads_estado_check';
-- =========================================================================


