-- Delete all products from the marketplace
DELETE FROM public.marketplace_products;

-- Optional: Reset sequence if needed (though UUIDs are used mostly)
-- TRUNCATE public.marketplace_products; 
