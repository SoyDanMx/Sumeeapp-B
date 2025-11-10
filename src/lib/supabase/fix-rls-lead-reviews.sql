-- =====================================================
-- FIX: Habilitar RLS en tabla lead_reviews
-- =====================================================
-- Este script soluciona el error de seguridad donde
-- lead_reviews está expuesta sin Row Level Security
-- =====================================================

-- PASO 1: Habilitar RLS en la tabla
ALTER TABLE public.lead_reviews ENABLE ROW LEVEL SECURITY;

-- PASO 2: Crear políticas de seguridad

-- Política 1: Los clientes pueden ver sus propias reseñas
CREATE POLICY "Clientes pueden ver sus propias reseñas"
ON public.lead_reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT l.cliente_id 
    FROM public.leads l 
    WHERE l.id = lead_reviews.lead_id
  )
);

-- Política 2: Los profesionales pueden ver reseñas de leads que aceptaron
CREATE POLICY "Profesionales pueden ver reseñas de sus leads"
ON public.lead_reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT l.profesional_asignado_id 
    FROM public.leads l 
    WHERE l.id = lead_reviews.lead_id
  )
);

-- Política 3: Solo los clientes pueden crear reseñas de sus propios leads
CREATE POLICY "Clientes pueden crear reseñas de sus leads"
ON public.lead_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT l.cliente_id 
    FROM public.leads l 
    WHERE l.id = lead_reviews.lead_id
  )
);

-- Política 4: Los clientes pueden actualizar sus propias reseñas
CREATE POLICY "Clientes pueden actualizar sus reseñas"
ON public.lead_reviews
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT l.cliente_id 
    FROM public.leads l 
    WHERE l.id = lead_reviews.lead_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT l.cliente_id 
    FROM public.leads l 
    WHERE l.id = lead_reviews.lead_id
  )
);

-- Política 5: OPCIONAL - Permitir a usuarios autenticados ver reseñas públicas
-- (Descomenta si quieres que las reseñas sean visibles para todos los usuarios logueados)
/*
CREATE POLICY "Reseñas son visibles para usuarios autenticados"
ON public.lead_reviews
FOR SELECT
TO authenticated
USING (true);
*/

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'lead_reviews';

-- Ver todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'lead_reviews';

-- =====================================================
-- TESTING
-- =====================================================

-- Test 1: Intentar insertar una reseña (debe funcionar solo si eres el cliente del lead)
/*
INSERT INTO public.lead_reviews (lead_id, rating, comment)
VALUES ('lead-id-aqui', 5, 'Excelente servicio');
*/

-- Test 2: Ver reseñas (solo verás las tuyas como cliente o las de tus leads como profesional)
/*
SELECT * FROM public.lead_reviews;
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Ahora lead_reviews está protegida con RLS
-- 2. Solo clientes y profesionales involucrados pueden ver reseñas
-- 3. Solo clientes pueden crear/editar sus reseñas
-- 4. Si necesitas que las reseñas sean públicas, descomenta la Política 5
-- 5. El error de Supabase Security Advisor desaparecerá después de ejecutar esto
-- =====================================================

