-- =========================================================================
-- TRIGGER "TONTO" PARA DEBUGGING
-- =========================================================================
-- Este script reemplaza la función handle_new_user por una versión extremadamente simple
-- que solo inserta los campos absolutamente mínimos requeridos, sin ninguna lógica condicional.

-- Step 1: Drop the existing trigger to remove the dependency.
-- =========================================================================
-- Esto elimina el bloqueo que impide actualizar la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Replace the function with a "dumb" version for debugging.
-- =========================================================================
-- Esta versión elimina toda la lógica y solo inserta los datos esenciales
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email,
    membership_status,
    role
  )
  VALUES (
    NEW.id,
    'Test User', -- Hardcoded value
    NEW.email,
    'free',      -- Hardcoded value
    'client'     -- Hardcoded value
  );
  RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger to point to the new "dumb" function.
-- =========================================================================
-- Vuelve a establecer el vínculo entre la creación de usuarios y nuestra función "tonta"
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- VERIFICACIÓN DEL TRIGGER TONTO
-- =========================================================================
-- Ejecutar estas consultas para verificar que el trigger "tonto" esté activo:

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

-- =========================================================================
-- INSTRUCCIONES DE TESTING
-- =========================================================================
-- Después de ejecutar este script, realizar una prueba de cero:
-- 1. Eliminar cualquier usuario de prueba de Authentication
-- 2. Ir a la página /join-as-pro
-- 3. Registrarse con un email y contraseña nuevos
-- 4. No importa lo que pongas en los campos de "Nombre" o "Profesión", serán ignorados
-- 5. Observar el resultado:

-- CASO A: El registro tiene éxito. No ves el error "Database error saving new user".
-- DIAGNÓSTICO: ¡Buenas noticias! Esto confirma que no hay un problema de permisos fundamental.
-- El error está en nuestra lógica anterior, específicamente en cómo accedemos a NEW.raw_user_meta_data.

-- CASO B: El registro VUELVE A FALLAR con el mismo error.
-- DIAGNÓSTICO: Esto es muy raro e indicaría un problema de permisos grave en tu proyecto de Supabase.
-- La solución más rápida sería contactar al soporte de Supabase o revisar los permisos del rol postgres.

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función "tonta" para debugging. Inserta valores hardcodeados para aislar el problema. Si funciona, el problema está en la lógica. Si falla, el problema está en los permisos fundamentales.';
