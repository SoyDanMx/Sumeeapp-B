-- 1. Drop existing table (and dependent data) to start fresh
DROP TABLE IF EXISTS public.marketplace_products CASCADE;

-- 2. Create the table with a more flexible schema
CREATE TABLE public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Make seller_id nullable to allow easy manual entry (Admin items) without needing a specific user ID
    seller_id UUID REFERENCES public.profiles(user_id),
    
    title TEXT NOT NULL,
    description TEXT,
    
    -- Simple numeric fields without complex cross-field checks
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC, -- Removed the >= price check to allow full flexibility
    
    -- Contact info for manual entry
    contact_phone TEXT,
    
    condition TEXT DEFAULT 'nuevo',
    category_id TEXT DEFAULT 'varios',
    
    -- Images array to store URLs (manual or uploaded)
    images TEXT[] DEFAULT '{}'::TEXT[],
    
    location_city TEXT DEFAULT 'CDMX',
    location_zone TEXT,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'hidden', 'deleted')),
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0
);

-- 3. Enable RLS
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Allow public to view active products
CREATE POLICY "Public can view active products" 
ON public.marketplace_products FOR SELECT 
USING (status = 'active');

-- Allow authenticated users to insert (linked to their ID)
CREATE POLICY "Users can insert their own products" 
ON public.marketplace_products FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Allow users to update their own products
CREATE POLICY "Users can update their own products" 
ON public.marketplace_products FOR UPDATE 
USING (auth.uid() = seller_id);

-- Allow users to delete their own products
CREATE POLICY "Users can delete their own products" 
ON public.marketplace_products FOR DELETE 
USING (auth.uid() = seller_id);

-- IMPORTANT: Allow "Service Role" or Admin full access (Supabase Table Editor uses this implicitly often, but good to be explicit if needed?)
-- Usually mostly automatic, but let's ensure indices exist.

-- 5. Indexes
CREATE INDEX idx_marketplace_products_status ON public.marketplace_products(status);
CREATE INDEX idx_marketplace_products_category ON public.marketplace_products(category_id);
CREATE INDEX idx_marketplace_products_price ON public.marketplace_products(price);

-- 6. Ensure Storage Bucket Exists (Safe to run multiple times)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketplace', 'marketplace', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies (Re-apply in case they were lost or not created)
DROP POLICY IF EXISTS "Public Access Marketplace Images" ON storage.objects;
CREATE POLICY "Public Access Marketplace Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace');

DROP POLICY IF EXISTS "Authenticated Upload Marketplace Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Marketplace Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'marketplace' AND auth.role() = 'authenticated');
