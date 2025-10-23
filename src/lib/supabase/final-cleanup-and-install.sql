-- ========= SCRIPT DE LIMPIEZA Y REINSTALACIÓN DE TRIGGER DE PERFIL =========
-- Este script elimina todos los triggers y funciones duplicadas y reinstala el correcto

-- PASO 1: Eliminar AMBOS triggers existentes en la tabla auth.users para evitar conflictos.
-- =========================================================================
-- Usamos los nombres exactos que conocemos de los errores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_after_user_insert ON auth.users;

-- PASO 2: Ahora que los triggers han sido eliminados, podemos borrar las funciones asociadas sin errores.
-- =========================================================================
-- Eliminamos todas las funciones relacionadas para empezar limpio
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user;
DROP FUNCTION IF EXISTS public.create_profile_after_user_insert;

-- PASO 3: Crear nuestra ÚNICA función, correcta y robusta.
-- =========================================================================
-- Esta función maneja la creación de perfiles con lógica robusta
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

-- PASO 4: Crear nuestro ÚNICO trigger, vinculándolo a nuestra función correcta.
-- =========================================================================
-- Este es el único trigger que necesitamos
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- VERIFICACIÓN FINAL
-- =========================================================================
-- Ejecutar estas consultas para verificar que todo esté correcto:

-- 1. Verificar que solo existe un trigger
-- SELECT trigger_name, event_manipulation, action_statement 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'on_auth_user_created';

-- 2. Verificar que solo existe una función
-- SELECT 
--     routine_name, 
--     security_type, 
--     routine_definition
-- FROM information_schema.routines 
-- WHERE routine_name = 'handle_new_user' 
--   AND routine_schema = 'public';

-- 3. Verificar que no queden funciones duplicadas
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
--   AND routine_name LIKE '%profile%';

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función única y definitiva para manejar nuevos usuarios. Crea perfiles automáticamente con lógica robusta y manejo de errores.';

-- =========================================================================
-- INSTRUCCIONES DE USO
-- =========================================================================
-- 1. Ejecutar este script completo en el SQL Editor de Supabase
-- 2. Verificar que no hay errores en la ejecución
-- 3. Probar el registro de un nuevo usuario
-- 4. El error "Database error saving new user" debería estar solucionado
-- 5. Solo debería existir un trigger: on_auth_user_created
-- 6. Solo debería existir una función: handle_new_user
