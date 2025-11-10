-- =====================================================
-- FIX: Actualizar ubicación de profesional en Nicolás Romero
-- =====================================================

-- Nicolás Romero, Estado de México coordenadas reales:
-- Lat: 19.6358, Lng: -99.3097

-- Actualizar el profesional específico
UPDATE profiles
SET 
  ubicacion_lat = 19.6358,
  ubicacion_lng = -99.3097,
  updated_at = NOW()
WHERE email = 'inquisidor132835@gmail.com';

-- Verificar la actualización
SELECT 
  full_name,
  email,
  profession,
  whatsapp,
  ubicacion_lat,
  ubicacion_lng,
  created_at,
  updated_at
FROM profiles
WHERE email = 'inquisidor132835@gmail.com';

