-- =====================================================
-- CONFIGURACIÓN DEL BUCKET problem-photos PARA EL ASISTENTE IA
-- =====================================================

-- 1. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'problem-photos',
  'problem-photos',
  true,
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política RLS: Permitir subida de archivos a usuarios autenticados
CREATE POLICY IF NOT EXISTS "Users can upload problem photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'problem-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Política RLS: Permitir lectura pública de imágenes
CREATE POLICY IF NOT EXISTS "Public can view problem photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'problem-photos');

-- 4. Política RLS: Permitir eliminación solo al propietario
CREATE POLICY IF NOT EXISTS "Users can delete their own problem photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'problem-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verificar que el bucket se creó correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'problem-photos';

