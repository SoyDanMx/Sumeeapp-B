-- =========================================================================
-- SCRIPT PARA AGREGAR IMÁGENES HERO A SERVICIOS
-- =========================================================================
-- Este script añade soporte para imágenes hero generadas por IA
-- para transformar la experiencia visual de Sumee App

-- 1. AGREGAR COLUMNA hero_image_url A LA TABLA SERVICES
-- =========================================================================
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- 2. AGREGAR COLUMNA thumbnail_image_url PARA TARJETAS
-- =========================================================================
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS thumbnail_image_url TEXT;

-- 3. AGREGAR COLUMNA background_color PARA PERSONALIZACIÓN
-- =========================================================================
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#3B82F6';

-- 4. POBLAR IMÁGENES HERO PARA SERVICIOS PRINCIPALES
-- =========================================================================

-- Plomería
UPDATE public.services 
SET 
    hero_image_url = '/images/services/plomeria-hero.jpg',
    thumbnail_image_url = '/images/services/plomeria-thumb.jpg',
    background_color = '#0EA5E9'
WHERE slug = 'plomeria';

-- Electricidad
UPDATE public.services 
SET 
    hero_image_url = '/images/services/electricidad-hero.jpg',
    thumbnail_image_url = '/images/services/electricidad-thumb.jpg',
    background_color = '#F59E0B'
WHERE slug = 'electricidad';

-- Aire Acondicionado
UPDATE public.services 
SET 
    hero_image_url = '/images/services/aire-acondicionado-hero.jpg',
    thumbnail_image_url = '/images/services/aire-acondicionado-thumb.jpg',
    background_color = '#10B981'
WHERE slug = 'aire-acondicionado';

-- Carpintería
UPDATE public.services 
SET 
    hero_image_url = '/images/services/carpinteria-hero.jpg',
    thumbnail_image_url = '/images/services/carpinteria-thumb.jpg',
    background_color = '#8B4513'
WHERE slug = 'carpinteria';

-- Pintura
UPDATE public.services 
SET 
    hero_image_url = '/images/services/pintura-hero.jpg',
    thumbnail_image_url = '/images/services/pintura-thumb.jpg',
    background_color = '#EC4899'
WHERE slug = 'pintura';

-- Limpieza
UPDATE public.services 
SET 
    hero_image_url = '/images/services/limpieza-hero.jpg',
    thumbnail_image_url = '/images/services/limpieza-thumb.jpg',
    background_color = '#06B6D4'
WHERE slug = 'limpieza';

-- Jardinería
UPDATE public.services 
SET 
    hero_image_url = '/images/services/jardineria-hero.jpg',
    thumbnail_image_url = '/images/services/jardineria-thumb.jpg',
    background_color = '#22C55E'
WHERE slug = 'jardineria';

-- CCTV
UPDATE public.services 
SET 
    hero_image_url = '/images/services/cctv-hero.jpg',
    thumbnail_image_url = '/images/services/cctv-thumb.jpg',
    background_color = '#6366F1'
WHERE slug = 'cctv';

-- WiFi
UPDATE public.services 
SET 
    hero_image_url = '/images/services/wifi-hero.jpg',
    thumbnail_image_url = '/images/services/wifi-thumb.jpg',
    background_color = '#8B5CF6'
WHERE slug = 'wifi';

-- Fumigación
UPDATE public.services 
SET 
    hero_image_url = '/images/services/fumigacion-hero.jpg',
    thumbnail_image_url = '/images/services/fumigacion-thumb.jpg',
    background_color = '#84CC16'
WHERE slug = 'fumigacion';

-- Tablaroca
UPDATE public.services 
SET 
    hero_image_url = '/images/services/tablaroca-hero.jpg',
    thumbnail_image_url = '/images/services/tablaroca-thumb.jpg',
    background_color = '#F97316'
WHERE slug = 'tablaroca';

-- Construcción
UPDATE public.services 
SET 
    hero_image_url = '/images/services/construccion-hero.jpg',
    thumbnail_image_url = '/images/services/construccion-thumb.jpg',
    background_color = '#DC2626'
WHERE slug = 'construccion';

-- Arquitectos
UPDATE public.services 
SET 
    hero_image_url = '/images/services/arquitectos-hero.jpg',
    thumbnail_image_url = '/images/services/arquitectos-thumb.jpg',
    background_color = '#7C3AED'
WHERE slug = 'arquitectos';

-- 5. VERIFICAR ESTRUCTURA ACTUALIZADA
-- =========================================================================
SELECT 
    slug,
    name,
    hero_image_url,
    thumbnail_image_url,
    background_color
FROM public.services 
WHERE hero_image_url IS NOT NULL
ORDER BY name;

-- 6. COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================
COMMENT ON COLUMN public.services.hero_image_url IS 'URL de imagen hero principal para páginas de servicio';
COMMENT ON COLUMN public.services.thumbnail_image_url IS 'URL de imagen thumbnail para tarjetas de servicio';
COMMENT ON COLUMN public.services.background_color IS 'Color de fondo personalizado para cada servicio';

-- =========================================================================
-- INSTRUCCIONES DE USO
-- =========================================================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Subir las imágenes generadas por IA a /public/images/services/
-- 3. Verificar que las URLs coincidan con los archivos subidos
-- 4. Probar la visualización en las páginas de servicio
-- =========================================================================
