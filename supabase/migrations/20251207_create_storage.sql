-- Create storage bucket for marketplace if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace', 'marketplace', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'marketplace' );

-- Policy to allow everyone to view marketplace images
CREATE POLICY "Public can view marketplace images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'marketplace' );
