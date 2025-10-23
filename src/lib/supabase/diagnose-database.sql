-- =========================================================================
-- SCRIPT DE DIAGNÓSTICO PARA VERIFICAR EL ESTADO DE LA BASE DE DATOS
-- =========================================================================
-- Ejecutar estas consultas en el SQL Editor de Supabase para diagnosticar problemas

-- =========================================================================
-- 1. VERIFICAR QUE LAS TABLAS EXISTAN
-- =========================================================================

-- Verificar tabla profiles
SELECT 
    'profiles' as tabla,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar tabla profesionales
SELECT 
    'profesionales' as tabla,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profesionales' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =========================================================================
-- 2. VERIFICAR QUE EL TRIGGER EXISTA
-- =========================================================================

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- =========================================================================
-- 3. VERIFICAR QUE LA FUNCIÓN EXISTA
-- =========================================================================

SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
  AND routine_schema = 'public';

-- =========================================================================
-- 4. VERIFICAR POLÍTICAS RLS
-- =========================================================================

-- Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'profesionales') 
  AND schemaname = 'public';

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'profesionales') 
  AND schemaname = 'public';

-- =========================================================================
-- 5. VERIFICAR PERMISOS
-- =========================================================================

-- Verificar permisos en la tabla profiles
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles' 
  AND table_schema = 'public';

-- Verificar permisos en la tabla profesionales
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profesionales' 
  AND table_schema = 'public';

-- =========================================================================
-- 6. VERIFICAR ÍNDICES
-- =========================================================================

SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('profiles', 'profesionales') 
  AND schemaname = 'public';

-- =========================================================================
-- 7. VERIFICAR DATOS EXISTENTES
-- =========================================================================

-- Contar registros en profiles
SELECT 
    'profiles' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN role = 'profesional' THEN 1 END) as profesionales,
    COUNT(CASE WHEN role = 'client' THEN 1 END) as clientes
FROM public.profiles;

-- Contar registros en profesionales
SELECT 
    'profesionales' as tabla,
    COUNT(*) as total_registros
FROM public.profesionales;

-- =========================================================================
-- 8. VERIFICAR LOGS RECIENTES
-- =========================================================================

-- Verificar logs recientes (si está habilitado)
SELECT 
    log_time,
    log_level,
    message
FROM pg_log 
WHERE message LIKE '%handle_new_user%' 
  AND log_time > NOW() - INTERVAL '1 hour'
ORDER BY log_time DESC
LIMIT 10;

-- =========================================================================
-- 9. TEST DE INSERCIÓN MANUAL
-- =========================================================================

-- IMPORTANTE: Solo ejecutar si quieres probar manualmente
-- Reemplazar 'test-user-id' con un UUID real

/*
-- Test de inserción en profiles
INSERT INTO public.profiles (
    user_id,
    role,
    full_name,
    email,
    created_at,
    updated_at
) VALUES (
    'test-user-id'::uuid,
    'client',
    'Test User',
    'test@example.com',
    NOW(),
    NOW()
);

-- Test de inserción en profesionales
INSERT INTO public.profesionales (
    user_id,
    profession,
    whatsapp,
    descripcion_perfil,
    specialties,
    experience_years,
    disponibilidad,
    created_at,
    updated_at
) VALUES (
    'test-user-id'::uuid,
    'Electricista',
    '+52 55 1234 5678',
    'Profesional de prueba',
    ARRAY['Electricista'],
    2,
    'disponible',
    NOW(),
    NOW()
);
*/

-- =========================================================================
-- 10. LIMPIAR DATOS DE TEST (OPCIONAL)
-- =========================================================================

-- IMPORTANTE: Solo ejecutar si quieres limpiar datos de test
/*
DELETE FROM public.profesionales WHERE user_id = 'test-user-id'::uuid;
DELETE FROM public.profiles WHERE user_id = 'test-user-id'::uuid;
*/
