-- =========================================================================
-- VERIFICAR ESTADO DEL USUARIO Y PERFIL
-- =========================================================================
-- Este script verifica el estado del usuario y perfil para diagnóstico
-- IMPORTANTE: No se puede modificar auth.users directamente desde SQL público
-- Se requiere usar el Admin API de Supabase para confirmar el email

-- 1. VERIFICAR EL PERFIL EN PUBLIC.PROFILES
-- =========================================================================
SELECT 
    id,
    user_id,
    full_name,
    email,
    role,
    status,
    created_at,
    updated_at
FROM public.profiles
WHERE user_id = 'e9580eaf-0681-4417-9be2-3cd2efefb733'
   OR email = 'escuderoleonel57@gmail.com';

-- 2. INFORMACIÓN SOBRE LA CONFIRMACIÓN DEL EMAIL
-- =========================================================================
-- NOTA: La tabla auth.users NO es accesible directamente desde SQL público
-- Para confirmar el email, debes usar:
-- 1. El Admin API de Supabase (requiere SUPABASE_SERVICE_ROLE_KEY)
-- 2. O el Dashboard de Supabase (Authentication > Users > Confirmar email)

-- 3. VERIFICAR SI EXISTE UN TRIGGER O FUNCIÓN QUE PUEDA AYUDAR
-- =========================================================================
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';

-- 4. COMENTARIOS IMPORTANTES
-- =========================================================================
-- Para confirmar el email del usuario manualmente, puedes:
-- 
-- OPCIÓN 1: Usar el Dashboard de Supabase
-- 1. Ve a Authentication > Users
-- 2. Busca el usuario por email: escuderoleonel57@gmail.com
-- 3. Haz clic en el usuario
-- 4. Haz clic en "Confirm email" o establece "Email confirmed" a true
-- 
-- OPCIÓN 2: Usar el Admin API (requiere service role key)
-- Puedes usar el endpoint: POST /api/admin/confirm-user-email
-- Con el body: { "email": "escuderoleonel57@gmail.com" }
-- 
-- OPCIÓN 3: Usar SQL con permisos de administrador (solo si tienes acceso)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW()
-- WHERE id = 'e9580eaf-0681-4417-9be2-3cd2efefb733';
