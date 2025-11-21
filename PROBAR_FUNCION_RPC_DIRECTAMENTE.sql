-- =========================================================================
-- PROBAR LA FUNCIÓN RPC DIRECTAMENTE
-- =========================================================================
-- Este script prueba la función RPC directamente para ver si funciona
-- =========================================================================

-- Probar la función RPC directamente con tu User UID
SELECT create_lead_simple(
  'Test Cliente RPC',
  '5512345678',
  'Prueba directa de función RPC',
  'electricidad',
  19.4326,
  -99.1332,
  'CDMX Test',
  'f03f1982-5004-4268-a4b4-a52649f8ec15'::uuid,
  'Nuevo',
  NULL,
  NULL
) as lead_id_creado;

-- Verificar que el lead fue creado
SELECT 
  id,
  nombre_cliente,
  whatsapp,
  servicio,
  estado,
  cliente_id,
  fecha_creacion
FROM public.leads
WHERE nombre_cliente = 'Test Cliente RPC'
ORDER BY fecha_creacion DESC
LIMIT 1;

