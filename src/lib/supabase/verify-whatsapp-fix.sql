-- =====================================================
-- VERIFICACIÓN: Estado de WhatsApp de Profesionales
-- =====================================================

-- 1. Resumen estadístico
SELECT 
  'RESUMEN ACTUAL' as status,
  COUNT(*) as total_profesionales,
  COUNT(whatsapp) as con_whatsapp,
  COUNT(*) - COUNT(whatsapp) as sin_whatsapp,
  ROUND(100.0 * COUNT(whatsapp) / COUNT(*), 1) as porcentaje_con_whatsapp
FROM public.profiles
WHERE role = 'profesional';

-- 2. Desglose por estado
SELECT 
  CASE 
    WHEN whatsapp IS NOT NULL THEN '✅ Con WhatsApp'
    WHEN phone IS NOT NULL THEN '⚠️ Tiene phone pero no whatsapp'
    ELSE '❌ Sin WhatsApp ni phone'
  END as estado,
  COUNT(*) as cantidad
FROM public.profiles
WHERE role = 'profesional'
GROUP BY 
  CASE 
    WHEN whatsapp IS NOT NULL THEN '✅ Con WhatsApp'
    WHEN phone IS NOT NULL THEN '⚠️ Tiene phone pero no whatsapp'
    ELSE '❌ Sin WhatsApp ni phone'
  END
ORDER BY cantidad DESC;

-- 3. Muestra de profesionales CON WhatsApp (últimos 10)
SELECT 
  '✅ CON WHATSAPP' as status,
  user_id,
  full_name,
  email,
  phone,
  whatsapp,
  profession,
  created_at
FROM public.profiles
WHERE role = 'profesional'
  AND whatsapp IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Muestra de profesionales SIN WhatsApp (si hay)
SELECT 
  '❌ SIN WHATSAPP' as status,
  user_id,
  full_name,
  email,
  phone,
  whatsapp,
  profession,
  created_at
FROM public.profiles
WHERE role = 'profesional'
  AND whatsapp IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verificar que el trigger nuevo existe y está activo
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND trigger_schema = 'public';

-- 6. Ver metadata de auth.users para comparar (últimos 5 profesionales)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'whatsapp' as metadata_whatsapp,
  u.raw_user_meta_data->>'phone' as metadata_phone,
  p.whatsapp as profile_whatsapp,
  p.phone as profile_phone,
  p.full_name
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE p.role = 'profesional'
ORDER BY u.created_at DESC
LIMIT 5;

