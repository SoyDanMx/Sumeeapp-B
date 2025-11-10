-- =====================================================
-- DIAGNÓSTICO: Profesionales con/sin Ubicación
-- =====================================================

-- 1. Contar profesionales totales vs con ubicación
SELECT 
  COUNT(*) as total_profesionales,
  COUNT(ubicacion_lat) as con_ubicacion,
  COUNT(*) - COUNT(ubicacion_lat) as sin_ubicacion,
  ROUND(COUNT(ubicacion_lat)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_con_ubicacion
FROM profiles
WHERE role = 'profesional';

-- 2. Ver profesionales sin ubicación (para análisis)
SELECT 
  user_id,
  full_name,
  email,
  profession,
  whatsapp,
  phone,
  ubicacion_lat,
  ubicacion_lng,
  created_at
FROM profiles
WHERE role = 'profesional'
  AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL)
ORDER BY created_at DESC;

-- 3. Ver qué datos tienen disponibles
SELECT 
  COUNT(*) as total,
  COUNT(phone) as con_telefono,
  COUNT(whatsapp) as con_whatsapp,
  COUNT(ciudad) as con_ciudad,
  COUNT(direccion) as con_direccion,
  COUNT(ubicacion_lat) as con_coordenadas
FROM profiles
WHERE role = 'profesional';

-- 4. Verificar estructura de metadata
SELECT 
  user_id,
  full_name,
  raw_user_meta_data
FROM auth.users
WHERE id IN (
  SELECT user_id 
  FROM profiles 
  WHERE role = 'profesional' 
  LIMIT 5
);

