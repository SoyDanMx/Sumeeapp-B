-- =========================================================================
-- Agregar campo external_code a marketplace_products para códigos externos
-- =========================================================================
-- Fecha: 2025-01-21
-- Objetivo: Permitir almacenar códigos de productos de Syscom, Ingram, etc.
-- =========================================================================

-- Agregar columna external_code si no existe
ALTER TABLE public.marketplace_products 
ADD COLUMN IF NOT EXISTS external_code TEXT;

-- Agregar columna sku si no existe (código interno del producto)
ALTER TABLE public.marketplace_products 
ADD COLUMN IF NOT EXISTS sku TEXT;

-- Crear índice para búsquedas rápidas por código externo
CREATE INDEX IF NOT EXISTS idx_marketplace_products_external_code 
ON public.marketplace_products(external_code) 
WHERE external_code IS NOT NULL;

-- Crear índice para búsquedas rápidas por SKU
CREATE INDEX IF NOT EXISTS idx_marketplace_products_sku 
ON public.marketplace_products(sku) 
WHERE sku IS NOT NULL;

-- Agregar comentarios para documentación
COMMENT ON COLUMN public.marketplace_products.external_code IS 'Código externo del producto (ej: código Syscom, Ingram, etc.)';
COMMENT ON COLUMN public.marketplace_products.sku IS 'SKU o código interno del producto (ej: modelo del fabricante)';

