-- =========================================================================
-- DESHABILITAR TRIGGER PROBLEMÁTICO
-- =========================================================================
-- Este script deshabilita el trigger que está causando el error

-- Deshabilitar el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar la función (opcional, pero recomendado)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =========================================================================
-- VERIFICAR QUE EL TRIGGER ESTÉ DESHABILITADO
-- =========================================================================
-- Ejecutar esta consulta para verificar que el trigger ya no existe:
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Debería devolver 0 filas si el trigger fue eliminado correctamente

-- =========================================================================
-- COMENTARIOS
-- =========================================================================
-- Después de ejecutar este script, el registro de usuarios funcionará
-- sin el trigger, y podremos manejar la creación de perfiles manualmente
-- en el frontend.
