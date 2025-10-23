-- =========================================================================
-- SOLUCIÓN DEFINITIVA: SECURITY DEFINER
-- =========================================================================
-- Este script corrige el problema de permisos recreando la función con SECURITY DEFINER

-- Step 1: Drop the existing trigger first to remove the dependency.
-- =========================================================================
-- Esto elimina el bloqueo que impide actualizar la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Now that the trigger is gone, we can safely update the function.
-- =========================================================================
-- CREATE OR REPLACE will either create the function or replace the existing one.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- <<< This is the critical security setting
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    profession,
    membership_status,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'profession',
    'free',
    CASE
      WHEN NEW.raw_user_meta_data->>'profession' IS NOT NULL AND TRIM(NEW.raw_user_meta_data->>'profession') <> ''
      THEN 'profesional'
      ELSE 'client'
    END
  );
  RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger to point to our newly updated function.
-- =========================================================================
-- Vuelve a establecer el vínculo entre la creación de usuarios y nuestra función mejorada
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- VERIFICACIÓN FINAL
-- =========================================================================
-- Ejecutar estas consultas para verificar que todo esté correcto:

-- 1. Verificar que el trigger existe y está activo
-- SELECT trigger_name, event_manipulation, action_statement 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'on_auth_user_created';

-- 2. Verificar que la función existe con SECURITY DEFINER
-- SELECT 
--     routine_name, 
--     security_type, 
--     routine_definition
-- FROM information_schema.routines 
-- WHERE routine_name = 'handle_new_user' 
--   AND routine_schema = 'public';

-- 3. Verificar que la tabla profiles tiene los DEFAULTS correctos
-- SELECT 
--     column_name, 
--     data_type, 
--     is_nullable, 
--     column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
--   AND table_schema = 'public' 
--   AND column_name = 'membership_status';

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función definitiva para manejar nuevos usuarios con SECURITY DEFINER. Maneja todos los casos edge y tiene permisos completos para insertar en public.profiles.';

-- =========================================================================
-- INSTRUCCIONES DE USO
-- =========================================================================
-- 1. Ejecutar este script completo en el SQL Editor de Supabase
-- 2. Verificar que no hay errores en la ejecución
-- 3. Probar el registro de un nuevo usuario
-- 4. El error "Database error saving new user" debería estar solucionado
