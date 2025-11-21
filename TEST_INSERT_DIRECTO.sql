-- =========================================================================
-- TEST: Insertar Lead Directamente (para verificar RLS)
-- =========================================================================
-- Este script intenta insertar un lead directamente para verificar
-- si el problema es de RLS o de otra cosa
-- IMPORTANTE: Ejecuta esto mientras estás autenticado en Supabase
-- =========================================================================

-- Primero, verificar tu usuario actual
SELECT 
  'Usuario Actual' as tipo,
  auth.uid() as current_user_id,
  auth.uid()::text as current_user_id_text;

-- Intentar insertar un lead de prueba
-- NOTA: Reemplaza 'TU_USER_ID_AQUI' con tu auth.uid() de arriba
INSERT INTO public.leads (
  nombre_cliente,
  whatsapp,
  descripcion_proyecto,
  servicio,
  ubicacion_lat,
  ubicacion_lng,
  cliente_id,
  estado
) VALUES (
  'Test Cliente',
  '5215512345678',
  'Descripción de prueba para verificar RLS',
  'plomeria',
  19.4326,
  -99.1332,
  auth.uid(),  -- Usar tu propio user_id
  'Nuevo'
)
RETURNING id, nombre_cliente, cliente_id, estado;

-- Si el INSERT funciona, eliminar el lead de prueba
-- DELETE FROM public.leads WHERE nombre_cliente = 'Test Cliente';



