-- =========================================================================
-- SCRIPT DE CORRECCIÓN: Arreglar trigger de pricing_model_data
-- =========================================================================
-- Este script corrige el error "trigger already exists" haciendo el
-- script idempotente. Ejecutar si obtienes el error al ejecutar Script 1.
-- =========================================================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_update_pricing_model_data_updated_at ON public.pricing_model_data;

-- Recrear el trigger
CREATE TRIGGER trigger_update_pricing_model_data_updated_at
    BEFORE UPDATE ON public.pricing_model_data
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_model_data_updated_at();

-- Verificar que el trigger fue creado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name = 'trigger_update_pricing_model_data_updated_at';

-- =========================================================================
-- NOTAS
-- =========================================================================
-- 1. Este script es idempotente y se puede ejecutar múltiples veces.
-- 2. Si el trigger ya existe, se elimina y se recrea.
-- 3. Ejecutar este script si obtienes el error "trigger already exists".
-- =========================================================================

