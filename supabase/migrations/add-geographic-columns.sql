-- =====================================================================
-- Agregar columnas geográficas mejoradas a la tabla profiles
-- =====================================================================
-- Este script agrega sub_city_zone y postal_code para geocodificación inversa
-- y mejora la integridad de datos geográficos

-- Agregar columna sub_city_zone (delegación, alcaldía o zona específica)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sub_city_zone TEXT;

-- Agregar columna postal_code (código postal)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Agregar índices para mejorar las consultas geográficas
CREATE INDEX IF NOT EXISTS idx_profiles_sub_city_zone 
ON public.profiles(sub_city_zone) 
WHERE sub_city_zone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_postal_code 
ON public.profiles(postal_code) 
WHERE postal_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_city_sub_city 
ON public.profiles(city, sub_city_zone) 
WHERE city IS NOT NULL AND sub_city_zone IS NOT NULL;

-- Agregar CHECK CONSTRAINT para validar coordenadas (si están presentes)
-- Nota: PostgreSQL no permite CHECK constraints condicionales complejas que verifiquen
-- el role en tiempo de ejecución, pero podemos validar que las coordenadas sean válidas
-- si están presentes (lat entre -90 y 90, lng entre -180 y 180)

-- Agregar constraint para validar rango de coordenadas (si están presentes)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS check_ubicacion_coords_valid;

ALTER TABLE public.profiles
ADD CONSTRAINT check_ubicacion_coords_valid 
CHECK (
  (ubicacion_lat IS NULL AND ubicacion_lng IS NULL) OR
  (
    ubicacion_lat IS NOT NULL AND 
    ubicacion_lng IS NOT NULL AND
    ubicacion_lat BETWEEN -90 AND 90 AND
    ubicacion_lng BETWEEN -180 AND 180
  )
);

-- Comentarios para documentación
COMMENT ON COLUMN public.profiles.sub_city_zone IS 'Delegación, alcaldía o zona específica (ej: Coyoacán, Benito Juárez)';
COMMENT ON COLUMN public.profiles.postal_code IS 'Código postal del usuario, crítico para matching preciso';

-- =====================================================================
-- Verificación
-- =====================================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('sub_city_zone', 'postal_code')
ORDER BY column_name;

