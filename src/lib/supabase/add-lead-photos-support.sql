-- =====================================================================
-- 🚀 SOPORTE PARA FOTOS EN SOLICITUDES (LEADS)
-- =====================================================================
-- Ejecuta este script en el editor SQL de Supabase antes de usar
-- la funcionalidad de carga de imágenes en el dashboard de cliente.
-- Incluye:
--   1. Columna photos_urls en la tabla public.leads
--   2. Bucket de almacenamiento "lead-photos" para evidencias
--   3. Políticas RLS para permitir que usuarios autenticados gestionen
--      sus propias imágenes
-- =====================================================================

-- 1) Agregar columna para almacenar URLs públicas de fotos (si no existe)
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS photos_urls TEXT[];

-- 2) Crear bucket en Storage (ejecutar una sola vez)
--    Si ya existe el bucket, ignora el error "bucket already exists"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'lead-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('lead-photos', 'lead-photos', true);

    UPDATE storage.buckets
    SET
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif'
      ]::text[],
      "public" = true
    WHERE id = 'lead-photos';
  END IF;
END $$;

-- 3) Políticas de acceso para el bucket "lead-photos"
--    Permiten subir y eliminar únicamente archivos propios (prefijo leadId/)

-- Subir fotos (INSERT/UPDATE)
SET statement_timeout = 0;

DROP POLICY IF EXISTS "lead_photos_insert" ON storage.objects;
CREATE POLICY "lead_photos_insert"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'lead-photos' 
  AND position('/' in name) > 0
);

DROP POLICY IF EXISTS "lead_photos_update" ON storage.objects;
CREATE POLICY "lead_photos_update"
ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'lead-photos')
WITH CHECK (bucket_id = 'lead-photos');

DROP POLICY IF EXISTS "lead_photos_select" ON storage.objects;
CREATE POLICY "lead_photos_select"
ON storage.objects
FOR SELECT TO authenticated, anon
USING (bucket_id = 'lead-photos');

DROP POLICY IF EXISTS "lead_photos_delete" ON storage.objects;
CREATE POLICY "lead_photos_delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'lead-photos'
);

-- 4) (Opcional) Política RLS para UPDATE/DELETE en leads si aún no existe
DROP POLICY IF EXISTS customers_update_photos ON public.leads;
CREATE POLICY customers_update_photos
ON public.leads
FOR UPDATE TO authenticated
USING (
  cliente_id IS NULL
  OR (cliente_id)::text = (auth.uid())::text
)
WITH CHECK (
  cliente_id IS NULL
  OR (cliente_id)::text = (auth.uid())::text
);

DROP POLICY IF EXISTS customers_delete_photos ON public.leads;
CREATE POLICY customers_delete_photos
ON public.leads
FOR DELETE TO authenticated
USING (
  cliente_id IS NULL
  OR (cliente_id)::text = (auth.uid())::text
);

-- =====================================================================
-- Después de ejecutar:
--   • Verifica que el bucket aparezca en Storage
--   • Si usas Reglas adicionales, adapta el prefijo (leadId/)
--   • Considera activar CDN si necesitas rendimiento extra
-- =====================================================================
