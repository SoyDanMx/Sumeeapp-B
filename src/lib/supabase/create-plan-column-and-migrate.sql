-- =====================================================
-- SCRIPT: Crear columna 'plan' y migrar a Express & Pro
-- =====================================================
-- Este script maneja el caso donde la columna 'plan' NO existe
-- =====================================================

-- PASO 1: Verificar si la columna existe (informativo)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'plan'
  ) THEN
    RAISE NOTICE 'La columna "plan" NO existe. Se creará ahora.';
  ELSE
    RAISE NOTICE 'La columna "plan" ya existe. Se procederá con la migración.';
  END IF;
END $$;

-- PASO 2: Crear el enum plan_type (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
    CREATE TYPE plan_type AS ENUM ('express_free', 'pro_annual');
    RAISE NOTICE 'Enum plan_type creado exitosamente.';
  ELSE
    RAISE NOTICE 'Enum plan_type ya existe.';
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
    
    RAISE NOTICE 'Columna "plan" creada con valor por defecto: express_free';
  END IF;
END $$;

-- PASO 4: Asignar planes basados en la lógica de negocio
-- Si tienes una columna 'membership_status' o similar, ajusta aquí
UPDATE public.profiles
SET plan = 'express_free'
WHERE plan IS NULL AND role = 'client';

-- Si tienes usuarios premium identificados de otra forma, ajusta aquí
-- Por ejemplo, si existe una columna 'membership_status' = 'premium':
-- UPDATE public.profiles
-- SET plan = 'pro_annual'
-- WHERE membership_status = 'premium';

-- PASO 5: Verificar la distribución de planes
SELECT 
  plan,
  role,
  COUNT(*) as total
FROM public.profiles
GROUP BY plan, role
ORDER BY plan, role;

-- PASO 6: Mostrar sample de usuarios con su plan
SELECT 
  user_id,
  full_name,
  email,
  role,
  plan,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Este script es seguro de ejecutar múltiples veces (usa IF NOT EXISTS)
-- 2. Todos los usuarios quedarán con 'express_free' por defecto
-- 3. Si necesitas identificar usuarios Pro existentes, modifica el PASO 4
-- 4. La columna se crea con DEFAULT 'express_free', así que nuevos
--    usuarios tendrán este plan automáticamente
-- =====================================================

