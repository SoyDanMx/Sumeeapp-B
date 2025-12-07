-- Create marketplace_products table
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    seller_id UUID REFERENCES public.profiles(user_id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price >= price),
    condition TEXT NOT NULL CHECK (condition IN ('nuevo', 'usado_excelente', 'usado_bueno', 'usado_regular', 'para_reparar')),
    category_id TEXT NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[],
    location_city TEXT,
    location_zone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'hidden', 'deleted')),
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0
);

-- RLS Policies
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- Everyone can read active products
CREATE POLICY "Public can view active products" 
ON public.marketplace_products FOR SELECT 
USING (status = 'active');

-- Authenticated users (Pros) can insert their own products
CREATE POLICY "Pros can insert their own products" 
ON public.marketplace_products FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update their own products" 
ON public.marketplace_products FOR UPDATE 
USING (auth.uid() = seller_id);

-- Sellers can delete (soft delete) their own products
CREATE POLICY "Sellers can delete their own products" 
ON public.marketplace_products FOR DELETE 
USING (auth.uid() = seller_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON public.marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller ON public.marketplace_products(seller_id);

-- Add Storage Bucket for Marketplace Images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketplace', 'marketplace', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access Marketplace Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace');

CREATE POLICY "Pros Upload Marketplace Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'marketplace' AND auth.role() = 'authenticated');
