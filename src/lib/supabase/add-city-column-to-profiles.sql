-- =====================================================
-- AGREGAR COLUMNA 'city' A LA TABLA PROFILES
-- =====================================================

-- Verificar si la columna 'city' ya existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'city'
  ) THEN
    -- Agregar columna 'city' si no existe
    ALTER TABLE public.profiles 
    ADD COLUMN city TEXT DEFAULT 'Ciudad de México';
    
    RAISE NOTICE '✅ Columna "city" agregada exitosamente';
  ELSE
    RAISE NOTICE '⚠️ La columna "city" ya existe';
  END IF;
END $$;

-- Actualizar clientes existentes sin ciudad (usar ubicación como referencia)
UPDATE public.profiles
SET city = CASE
  WHEN ubicacion_lat BETWEEN 19.0 AND 19.9 AND ubicacion_lng BETWEEN -99.5 AND -98.5 THEN 'Ciudad de México'
  WHEN ubicacion_lat BETWEEN 25.0 AND 26.0 AND ubicacion_lng BETWEEN -100.5 AND -100.0 THEN 'Monterrey'
  WHEN ubicacion_lat BETWEEN 20.0 AND 21.0 AND ubicacion_lng BETWEEN -103.5 AND -103.0 THEN 'Guadalajara'
  ELSE 'Ciudad de México'
END
WHERE city IS NULL;

-- Verificar resultado
SELECT 
  'Total perfiles' as categoria,
  COUNT(*) as cantidad
FROM public.profiles

UNION ALL

SELECT 
  'Con ciudad' as categoria,
  COUNT(*) as cantidad
FROM public.profiles
WHERE city IS NOT NULL

UNION ALL

SELECT 
  'Sin ciudad' as categoria,
  COUNT(*) as cantidad
FROM public.profiles
WHERE city IS NULL;

-- Mostrar distribución por ciudad
SELECT 
  city,
  role,
  COUNT(*) as cantidad
FROM public.profiles
GROUP BY city, role
ORDER BY role, cantidad DESC;

