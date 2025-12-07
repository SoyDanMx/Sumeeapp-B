-- Add contact_phone column to marketplace_products
ALTER TABLE public.marketplace_products 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Verify it was added
COMMENT ON COLUMN public.marketplace_products.contact_phone IS 'WhatsApp number for contacting the seller about this product';
