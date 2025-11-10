-- =====================================================
-- DIAGNÓSTICO: Trigger handle_new_user
-- =====================================================

-- 1. Verificar si el trigger existe
SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  OR event_object_table = 'users';

-- 2. Verificar la función handle_new_user
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 3. Ver triggers en auth.users
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 4. Verificar últimos registros en auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'profession' as profession,
  raw_user_meta_data->>'registration_type' as registration_type
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar perfiles sin usuario correspondiente
SELECT 
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ No existe en auth.users'
    ELSE '✅ Existe en auth.users'
  END as status
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

