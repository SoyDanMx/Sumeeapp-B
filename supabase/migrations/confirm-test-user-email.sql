-- =========================================================================
-- CONFIRMAR EMAIL DEL USUARIO DE PRUEBA (cliente@sumeeapp.com)
-- =========================================================================
-- NOTA: Este script NO puede modificar auth.users directamente desde SQL público
-- Se debe usar el Admin API de Supabase o el Dashboard
--
-- OPCIÓN 1: Usar el Dashboard de Supabase (MÁS FÁCIL)
-- 1. Ve a Authentication > Users
-- 2. Busca: cliente@sumeeapp.com
-- 3. Haz clic en el usuario
-- 4. Haz clic en "Confirm email" o establece "Email confirmed" a true
--
-- OPCIÓN 2: Usar el Admin API (requiere service role key)
-- POST /api/admin/confirm-user-email
-- Body: { "email": "cliente@sumeeapp.com" }
--
-- OPCIÓN 3: Usar el endpoint de confirmación de prueba
-- POST /api/confirm-test-email
-- Body: { "email": "cliente@sumeeapp.com" }
-- =========================================================================

-- Verificar el estado actual del usuario
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'cliente@sumeeapp.com';

-- Verificar el perfil asociado
SELECT 
    id,
    user_id,
    full_name,
    email,
    role,
    status,
    plan,
    created_at
FROM public.profiles
WHERE email = 'cliente@sumeeapp.com'
   OR user_id = (SELECT id FROM auth.users WHERE email = 'cliente@sumeeapp.com' LIMIT 1);

-- =========================================================================
-- NOTA IMPORTANTE:
-- =========================================================================
-- Para confirmar el email, debes usar una de las opciones mencionadas arriba.
-- No se puede hacer UPDATE directo en auth.users desde SQL público por seguridad.
-- =========================================================================

