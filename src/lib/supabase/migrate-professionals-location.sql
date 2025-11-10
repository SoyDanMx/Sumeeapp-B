-- =====================================================
-- MIGRACIÓN: Agregar Ubicación a Profesionales Existentes
-- =====================================================

-- PASO 1: Ver profesionales sin ubicación
SELECT 
  user_id,
  full_name,
  email,
  profession,
  city,
  ubicacion_lat,
  ubicacion_lng,
  created_at
FROM profiles
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
ORDER BY created_at DESC;

-- PASO 2: Actualizar ubicaciones basadas en ciudad
-- Nota: Estas son coordenadas aproximadas del centro de cada ciudad

-- Ciudad de México (Centro: Zócalo)
UPDATE profiles
SET 
  ubicacion_lat = 19.4326,
  ubicacion_lng = -99.1332,
  updated_at = NOW()
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
  AND (city = 'Ciudad de México' OR city ILIKE '%cdmx%' OR city ILIKE '%mexico city%' OR city IS NULL);

-- Monterrey (Centro)
UPDATE profiles
SET 
  ubicacion_lat = 25.6866,
  ubicacion_lng = -100.3161,
  updated_at = NOW()
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
  AND city ILIKE '%monterrey%';

-- Guadalajara (Centro)
UPDATE profiles
SET 
  ubicacion_lat = 20.6597,
  ubicacion_lng = -103.3496,
  updated_at = NOW()
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
  AND city ILIKE '%guadalajara%';

-- Puebla (Centro)
UPDATE profiles
SET 
  ubicacion_lat = 19.0414,
  ubicacion_lng = -98.2063,
  updated_at = NOW()
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
  AND city ILIKE '%puebla%';

-- Tijuana (Centro)
UPDATE profiles
SET 
  ubicacion_lat = 32.5149,
  ubicacion_lng = -117.0382,
  updated_at = NOW()
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
  AND city ILIKE '%tijuana%';

-- Cancún (Centro)
UPDATE profiles
SET 
  ubicacion_lat = 21.1619,
  ubicacion_lng = -86.8515,
  updated_at = NOW()
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
  AND city ILIKE '%cancun%';

-- PASO 3: Verificar resultados
SELECT 
  'Total profesionales' as categoria,
  COUNT(*) as cantidad
FROM profiles
WHERE role = 'profesional'

UNION ALL

SELECT 
  'Con ubicación' as categoria,
  COUNT(*) as cantidad
FROM profiles
WHERE role = 'profesional'
  AND ubicacion_lat IS NOT NULL 
  AND ubicacion_lng IS NOT NULL

UNION ALL

SELECT 
  'Sin ubicación' as categoria,
  COUNT(*) as cantidad
FROM profiles
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL);

-- PASO 4: Listar profesionales actualizados
SELECT 
  full_name,
  email,
  city,
  ROUND(ubicacion_lat::numeric, 4) as lat,
  ROUND(ubicacion_lng::numeric, 4) as lng,
  CASE 
    WHEN ubicacion_lat IS NOT NULL THEN '✅'
    ELSE '❌'
  END as status
FROM profiles
WHERE role = 'profesional'
ORDER BY 
  CASE WHEN ubicacion_lat IS NOT NULL THEN 0 ELSE 1 END,
  created_at DESC;

