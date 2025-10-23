-- =========================================================================
-- DESHABILITAR TODOS LOS TRIGGERS DEFINITIVAMENTE
-- =========================================================================
-- Este script deshabilita TODOS los triggers que puedan estar causando problemas
-- y prepara la base de datos para una solución sin triggers

-- 1. DESHABILITAR TODOS LOS TRIGGERS EN AUTH.USERS
-- =========================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 2. ELIMINAR TODAS LAS FUNCIONES RELACIONADAS
-- =========================================================================
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile();
DROP FUNCTION IF EXISTS public.handle_new_user_trigger();
DROP FUNCTION IF EXISTS public.on_auth_user_created();
DROP FUNCTION IF EXISTS public.create_profile_on_signup();

-- 3. VERIFICAR QUE NO QUEDEN TRIGGERS
-- =========================================================================
-- Ejecutar esta consulta para verificar que no queden triggers:
-- SELECT 
--     trigger_name,
--     event_manipulation,
--     action_timing,
--     action_statement
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'users' 
--   AND event_object_schema = 'auth';

-- Debería devolver 0 filas si todos los triggers fueron eliminados

-- 4. VERIFICAR QUE NO QUEDEN FUNCIONES
-- =========================================================================
-- Ejecutar esta consulta para verificar que no queden funciones:
-- SELECT 
--     routine_name,
--     routine_type
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
--   AND routine_name LIKE '%user%';

-- 5. COMENTARIOS
-- =========================================================================
-- Después de ejecutar este script, el registro de usuarios funcionará
-- sin triggers, y podremos manejar la creación de perfiles manualmente
-- en el frontend sin problemas de permisos.
