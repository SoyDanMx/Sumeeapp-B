-- =====================================================
-- SCRIPT: Migración de Planes a Sumee Express & Pro
-- =====================================================
-- Este script actualiza el sistema de planes de 3 (gratis, basica, premium)
-- a 2 planes (express_free, pro_annual)
--
-- IMPORTANTE: Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Crear backup de datos actuales
CREATE TABLE IF NOT EXISTS profiles_backup_pre_migration AS 
SELECT * FROM public.profiles WHERE plan IS NOT NULL;

-- PASO 2: Agregar temporalmente los nuevos valores al enum existente
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'express_free';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'pro_annual';

-- PASO 3: Migrar datos existentes al nuevo esquema
-- Usuarios con plan 'gratis' o 'basica' → 'express_free'
-- Usuarios con plan 'premium' → 'pro_annual'
UPDATE public.profiles
SET plan = 'express_free'::plan_type
WHERE plan IN ('gratis', 'basica');

UPDATE public.profiles
SET plan = 'pro_annual'::plan_type
WHERE plan = 'premium';

-- PASO 4: Actualizar usuarios NULL a express_free (plan por defecto)
UPDATE public.profiles
SET plan = 'express_free'::plan_type
WHERE plan IS NULL AND role = 'client';

-- PASO 5: Recrear el enum con solo los nuevos valores
-- (Esto requiere eliminar temporalmente la columna plan)

-- 5.1: Crear columna temporal
ALTER TABLE public.profiles ADD COLUMN plan_temp VARCHAR(50);

-- 5.2: Copiar valores actuales
UPDATE public.profiles SET plan_temp = plan::text;

-- 5.3: Eliminar columna original
ALTER TABLE public.profiles DROP COLUMN plan;

-- 5.4: Recrear el enum con solo los nuevos valores
DROP TYPE IF EXISTS plan_type CASCADE;
CREATE TYPE plan_type AS ENUM ('express_free', 'pro_annual');

-- 5.5: Recrear columna con el nuevo enum
ALTER TABLE public.profiles ADD COLUMN plan plan_type DEFAULT 'express_free';

-- 5.6: Restaurar valores
UPDATE public.profiles 
SET plan = plan_temp::plan_type
WHERE plan_temp IS NOT NULL;

-- 5.7: Eliminar columna temporal
ALTER TABLE public.profiles DROP COLUMN plan_temp;

-- PASO 6: Actualizar RLS policies si existen referencias al plan
-- (Ejemplo: si tienes policies que verifican plan = 'premium')
-- Ejecuta este bloque SOLO si tienes policies específicas por plan

/*
DROP POLICY IF EXISTS "premium_users_can_..." ON public.some_table;
CREATE POLICY "pro_users_can_..." ON public.some_table
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.plan = 'pro_annual'
    )
  );
*/

-- PASO 7: Verificar migración
SELECT 
  plan,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'client' THEN 1 END) as clientes,
  COUNT(CASE WHEN role = 'profesional' THEN 1 END) as profesionales
FROM public.profiles
GROUP BY plan
ORDER BY plan;

-- PASO 8: (OPCIONAL) Eliminar backup después de verificar
-- Descomentar SOLO después de confirmar que todo funciona correctamente
-- DROP TABLE IF EXISTS profiles_backup_pre_migration;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Este script es IRREVERSIBLE una vez que se eliminan los valores antiguos del enum
-- 2. Mantén el backup (profiles_backup_pre_migration) por al menos 7 días
-- 3. Verifica que todos los usuarios se migraron correctamente antes de continuar
-- 4. Actualiza tu código frontend para usar 'express_free' y 'pro_annual'
-- 5. Actualiza cualquier función o trigger que referencie los planes antiguos
-- =====================================================

