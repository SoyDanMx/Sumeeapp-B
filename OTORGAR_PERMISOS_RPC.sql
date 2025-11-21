-- =========================================================================
-- OTORGAR PERMISOS DE EJECUCIÓN A LA FUNCIÓN RPC
-- =========================================================================
-- Las funciones RPC necesitan permisos explícitos para ser ejecutadas
-- =========================================================================

-- Otorgar permisos de ejecución a usuarios autenticados y anónimos
GRANT EXECUTE ON FUNCTION public.create_lead_simple TO anon, authenticated;

-- Verificar que los permisos fueron otorgados
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead_simple';

-- Verificar permisos de ejecución
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE object_schema = 'public'
  AND object_name = 'create_lead_simple';

-- =========================================================================
-- NOTA: Si la función aún no funciona, puede ser que:
-- 1. La función tenga un error de sintaxis
-- 2. Haya un problema con los tipos de datos de los parámetros
-- 3. La función esté siendo bloqueada por algún trigger o constraint
-- =========================================================================

