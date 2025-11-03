-- =========================================================================
-- CREAR BUCKETS DE STORAGE PARA PROFESIONALES
-- =========================================================================
-- Este script crea los buckets necesarios en Supabase Storage para:
-- 1. Avatares de profesionales
-- 2. Portfolio de proyectos
-- 3. Certificaciones
-- 4. Antecedentes no penales

-- =========================================================================
-- NOTA: Este script debe ejecutarse en el SQL Editor de Supabase
-- Los buckets se crean con políticas RLS para que solo el propietario pueda
-- subir/leer sus propios archivos
-- =========================================================================

-- =========================================================================
-- 1. BUCKET PARA AVATARES
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-avatars',
  'professional-avatars',
  true, -- Público para que los clientes puedan ver las fotos
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Política RLS: Solo el propietario puede subir su avatar
DROP POLICY IF EXISTS "Professionals can upload their own avatar" ON storage.objects;
CREATE POLICY "Professionals can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política RLS: Cualquiera puede leer avatares (públicos)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'professional-avatars');

-- Política RLS: Solo el propietario puede actualizar/eliminar su avatar
DROP POLICY IF EXISTS "Professionals can update their own avatar" ON storage.objects;
CREATE POLICY "Professionals can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Professionals can delete their own avatar" ON storage.objects;
CREATE POLICY "Professionals can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================================
-- 2. BUCKET PARA PORTFOLIO
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-portfolio',
  'professional-portfolio',
  true, -- Público para que los clientes puedan ver el portfolio
  10485760, -- 10MB límite por imagen
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Política RLS: Solo el propietario puede subir su portfolio
DROP POLICY IF EXISTS "Professionals can upload their own portfolio" ON storage.objects;
CREATE POLICY "Professionals can upload their own portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-portfolio' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política RLS: Cualquiera puede leer portfolio (público)
DROP POLICY IF EXISTS "Anyone can view portfolio" ON storage.objects;
CREATE POLICY "Anyone can view portfolio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'professional-portfolio');

-- Política RLS: Solo el propietario puede actualizar/eliminar su portfolio
DROP POLICY IF EXISTS "Professionals can update their own portfolio" ON storage.objects;
CREATE POLICY "Professionals can update their own portfolio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-portfolio' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Professionals can delete their own portfolio" ON storage.objects;
CREATE POLICY "Professionals can delete their own portfolio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-portfolio' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================================
-- 3. BUCKET PARA CERTIFICACIONES
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-certificates',
  'professional-certificates',
  true, -- Público para que los clientes puedan ver las certificaciones
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Política RLS: Solo el propietario puede subir sus certificaciones
DROP POLICY IF EXISTS "Professionals can upload their own certificates" ON storage.objects;
CREATE POLICY "Professionals can upload their own certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-certificates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política RLS: Cualquiera puede leer certificaciones (públicas)
DROP POLICY IF EXISTS "Anyone can view certificates" ON storage.objects;
CREATE POLICY "Anyone can view certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'professional-certificates');

-- Política RLS: Solo el propietario puede actualizar/eliminar sus certificaciones
DROP POLICY IF EXISTS "Professionals can update their own certificates" ON storage.objects;
CREATE POLICY "Professionals can update their own certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-certificates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Professionals can delete their own certificates" ON storage.objects;
CREATE POLICY "Professionals can delete their own certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-certificates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================================
-- 4. BUCKET PARA ANTECEDENTES NO PENALES
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-background-checks',
  'professional-background-checks',
  true, -- Público para que los clientes puedan ver la constancia
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Política RLS: Solo el propietario puede subir sus antecedentes
DROP POLICY IF EXISTS "Professionals can upload their own background check" ON storage.objects;
CREATE POLICY "Professionals can upload their own background check"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-background-checks' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política RLS: Cualquiera puede leer antecedentes (públicos)
DROP POLICY IF EXISTS "Anyone can view background checks" ON storage.objects;
CREATE POLICY "Anyone can view background checks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'professional-background-checks');

-- Política RLS: Solo el propietario puede actualizar/eliminar sus antecedentes
DROP POLICY IF EXISTS "Professionals can update their own background check" ON storage.objects;
CREATE POLICY "Professionals can update their own background check"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-background-checks' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Professionals can delete their own background check" ON storage.objects;
CREATE POLICY "Professionals can delete their own background check"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-background-checks' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================================
-- VERIFICACIÓN
-- =========================================================================
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN (
  'professional-avatars',
  'professional-portfolio',
  'professional-certificates',
  'professional-background-checks'
);

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. Los buckets son públicos para que los clientes puedan ver los documentos
-- 2. Los archivos se organizan por user_id: {user_id}/filename.ext
-- 3. Las políticas RLS aseguran que solo el propietario puede subir/actualizar/eliminar
-- 4. Los límites de tamaño están configurados para evitar abusos

