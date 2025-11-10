-- =====================================================
-- FIX: WhatsApp de Profesionales no se guarda
-- =====================================================
-- Este script diagnostica y corrige el problema de WhatsApp NULL
-- en la tabla profiles para profesionales
-- =====================================================

-- PASO 1: Verificar el estado actual del trigger
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'on_auth_user_created';

-- PASO 2: Verificar registros actuales con whatsapp NULL
SELECT 
  user_id,
  full_name,
  email,
  role,
  phone,
  whatsapp,
  profession,
  created_at
FROM public.profiles
WHERE role = 'profesional'
  AND whatsapp IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- PASO 3: Eliminar y recrear el trigger con mejor logging
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASO 4: Crear función mejorada con logging detallado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  extracted_phone TEXT;
  extracted_whatsapp TEXT;
  extracted_profession TEXT;
  extracted_role TEXT;
BEGIN
  -- Extraer y limpiar valores del metadata
  extracted_phone := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'whatsapp',
    ''
  )), '');
  
  extracted_whatsapp := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'phone',
    ''
  )), '');
  
  extracted_profession := NULLIF(TRIM(NEW.raw_user_meta_data->>'profession'), '');
  
  -- Determinar el rol basado en la presencia de profession o registration_type
  extracted_role := CASE
    WHEN extracted_profession IS NOT NULL AND extracted_profession <> '' THEN 'profesional'
    WHEN NEW.raw_user_meta_data->>'registration_type' = 'profesional' THEN 'profesional'
    WHEN NEW.raw_user_meta_data->>'registration_type' = 'professional' THEN 'profesional'
    WHEN NEW.raw_user_meta_data->>'role' = 'profesional' THEN 'profesional'
    ELSE 'client'
  END;

  -- Log para debugging (visible en Supabase Logs)
  RAISE LOG 'handle_new_user triggered for user_id: %, email: %', NEW.id, NEW.email;
  RAISE LOG 'Extracted values - phone: %, whatsapp: %, profession: %, role: %', 
    extracted_phone, extracted_whatsapp, extracted_profession, extracted_role;
  RAISE LOG 'Raw metadata: %', NEW.raw_user_meta_data;

  -- Insertar el perfil
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    profession,
    phone,
    whatsapp,
    membership_status,
    role,
    city,
    bio
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    NEW.email,
    extracted_profession,
    extracted_phone,
    extracted_whatsapp,
    'free',
    extracted_role,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'city'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'bio'), '')
  );

  RAISE LOG 'Profile created successfully for user_id: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'ERROR in handle_new_user for user_id %: % %', NEW.id, SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

-- PASO 5: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 6: Agregar comentarios
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función trigger mejorada con logging detallado. Maneja phone/whatsapp con fallbacks múltiples y detecta correctamente el rol de profesional.';

-- =====================================================
-- PASO 7: CORREGIR REGISTROS EXISTENTES
-- =====================================================
-- Este query intenta recuperar WhatsApp de auth.users.raw_user_meta_data
-- para usuarios profesionales que tienen whatsapp NULL

WITH user_metadata AS (
  SELECT 
    u.id,
    u.raw_user_meta_data->>'whatsapp' as meta_whatsapp,
    u.raw_user_meta_data->>'phone' as meta_phone,
    p.whatsapp as current_whatsapp,
    p.phone as current_phone
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.user_id
  WHERE p.role = 'profesional'
    AND p.whatsapp IS NULL
)
UPDATE public.profiles p
SET 
  whatsapp = COALESCE(
    um.meta_whatsapp,
    um.meta_phone,
    p.phone
  ),
  phone = COALESCE(
    p.phone,
    um.meta_phone,
    um.meta_whatsapp
  )
FROM user_metadata um
WHERE p.user_id = um.id
  AND (um.meta_whatsapp IS NOT NULL OR um.meta_phone IS NOT NULL);

-- PASO 8: Verificar la corrección
SELECT 
  'DESPUÉS DE LA CORRECCIÓN' as status,
  COUNT(*) FILTER (WHERE whatsapp IS NOT NULL) as con_whatsapp,
  COUNT(*) FILTER (WHERE whatsapp IS NULL) as sin_whatsapp,
  COUNT(*) as total
FROM public.profiles
WHERE role = 'profesional';

-- PASO 9: Mostrar profesionales corregidos
SELECT 
  user_id,
  full_name,
  email,
  phone,
  whatsapp,
  profession,
  created_at
FROM public.profiles
WHERE role = 'profesional'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Ejecutar para confirmar que el trigger está activo:
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_timing,
  t.action_statement,
  p.proname as function_name
FROM information_schema.triggers t
JOIN pg_proc p ON p.proname = 'handle_new_user'
WHERE t.trigger_name = 'on_auth_user_created';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Este script corrige TANTO el trigger como los datos existentes
-- 2. Los logs pueden verse en Supabase Dashboard → Logs → Database
-- 3. Si después de ejecutar esto siguen habiendo NULL, verificar:
--    - Que el formulario esté enviando 'phone' o 'whatsapp' en metadata
--    - Que el valor no sea una cadena vacía ''
--    - Los logs del trigger para ver qué valores llegan
-- 4. Para testing: crear un nuevo profesional y verificar su perfil
-- =====================================================

