-- =====================================================
-- SCRIPT: Migrar membership_status → plan (Express & Pro)
-- =====================================================
-- Este script crea la columna 'plan' basándose en membership_status
-- =====================================================

-- PASO 1: Ver estado actual de membership_status
SELECT 
  'ESTADO ACTUAL' as status,
  membership_status,
  role,
  COUNT(*) as total
FROM public.profiles
GROUP BY membership_status, role
ORDER BY membership_status, role;

-- PASO 2: Crear el enum plan_type (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
    CREATE TYPE plan_type AS ENUM ('express_free', 'pro_annual');
    RAISE NOTICE '✅ Enum plan_type creado exitosamente.';
  ELSE
    RAISE NOTICE '⚠️ Enum plan_type ya existe. Continuando...';
  END IF;
END $$;

-- PASO 3: Crear la columna 'plan' si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN plan plan_type DEFAULT 'express_free';
    
    RAISE NOTICE '✅ Columna "plan" creada con valor por defecto: express_free';
  ELSE
    RAISE NOTICE '⚠️ Columna "plan" ya existe. Continuando con migración...';
  END IF;
END $$;

-- PASO 4: Migrar datos de membership_status → plan
-- Mapeo de valores:
-- 'free' o NULL → 'express_free'
-- 'premium' → 'pro_annual'
-- 'basic' → 'express_free'

UPDATE public.profiles
SET plan = CASE
  -- Si membership_status es 'premium', asignar Pro
  WHEN membership_status = 'premium' THEN 'pro_annual'::plan_type
  
  -- Si membership_status es 'basic' o 'free', asignar Express
  WHEN membership_status IN ('basic', 'free') THEN 'express_free'::plan_type
  
  -- Si membership_status es NULL y es cliente, asignar Express
  WHEN membership_status IS NULL AND role = 'client' THEN 'express_free'::plan_type
  
  -- Por defecto, Express Free (incluye profesionales)
  ELSE 'express_free'::plan_type
END;

-- PASO 5: Verificar la migración
SELECT 
  'DESPUÉS DE MIGRACIÓN' as status,
  plan,
  membership_status,
  role,
  COUNT(*) as total
FROM public.profiles
GROUP BY plan, membership_status, role
ORDER BY plan, role;

-- PASO 6: Mostrar sample de usuarios migrados
SELECT 
  user_id,
  full_name,
  email,
  role,
  membership_status as old_membership,
  plan as new_plan,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 15;

-- PASO 7: Contar usuarios por plan
SELECT 
  plan,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'client' THEN 1 END) as clientes,
  COUNT(CASE WHEN role = 'profesional' THEN 1 END) as profesionales
FROM public.profiles
GROUP BY plan
ORDER BY plan;

-- =====================================================
-- PASO 8 (OPCIONAL): Actualizar membership_status para alinearlo
-- =====================================================
-- Descomenta estas líneas si quieres que membership_status
-- también refleje los nuevos valores

/*
UPDATE public.profiles
SET membership_status = CASE
  WHEN plan = 'express_free' THEN 'free'
  WHEN plan = 'pro_annual' THEN 'premium'
  ELSE membership_status
END;
*/

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Confirmar que NO hay usuarios con plan = NULL
SELECT COUNT(*) as usuarios_sin_plan
FROM public.profiles
WHERE plan IS NULL;

-- Debe retornar: 0

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Este script NO elimina la columna 'membership_status'
--    (la mantenemos por compatibilidad con código existente)
-- 2. Todos los nuevos usuarios tendrán plan='express_free' por defecto
-- 3. Para actualizar código existente, buscar referencias a
--    'membership_status' y reemplazar por 'plan'
-- 4. Si tienes lógica que verifica membership_status, considerar
--    ejecutar el PASO 8 (actualizar membership_status)
-- =====================================================

