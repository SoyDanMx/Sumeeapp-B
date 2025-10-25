-- Migración para añadir columna slug y actualizar URLs limpias
-- Ejecutar en Supabase SQL Editor

-- Añadir columna slug si no existe
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS slug text;

-- Hacer la columna slug NOT NULL y UNIQUE
ALTER TABLE public.services 
ALTER COLUMN slug SET NOT NULL;

-- Crear índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_unique ON public.services(slug);

-- Actualizar slugs con URLs limpias y optimizadas para SEO
UPDATE public.services SET slug = 'plomeria' WHERE name = 'Plomería';
UPDATE public.services SET slug = 'electricidad' WHERE name = 'Electricidad';
UPDATE public.services SET slug = 'aire-acondicionado' WHERE name = 'Aire Acondicionado';
UPDATE public.services SET slug = 'cctv' WHERE name = 'CCTV y Seguridad';
UPDATE public.services SET slug = 'wifi' WHERE name = 'Redes y WiFi';
UPDATE public.services SET slug = 'audio' WHERE name = 'Sistemas de Audio';
UPDATE public.services SET slug = 'cerrajeria' WHERE name = 'Cerrajería';
UPDATE public.services SET slug = 'gas' WHERE name = 'Gas';
UPDATE public.services SET slug = 'fumigacion' WHERE name = 'Fumigación';
UPDATE public.services SET slug = 'cisternas' WHERE name = 'Lavado de Cisternas';
UPDATE public.services SET slug = 'alfombras' WHERE name = 'Limpieza de Alfombras';
UPDATE public.services SET slug = 'albanileria' WHERE name = 'Albañilería';
UPDATE public.services SET slug = 'arquitectos' WHERE name = 'Arquitectos & Ingenieros';
UPDATE public.services SET slug = 'azulejos' WHERE name = 'Azulejos y Pisos';
UPDATE public.services SET slug = 'tablaroca' WHERE name = 'Tablaroca';
UPDATE public.services SET slug = 'carpinteria' WHERE name = 'Carpintería';
UPDATE public.services SET slug = 'impermeabilizacion' WHERE name = 'Impermeabilización';
UPDATE public.services SET slug = 'jardineria' WHERE name = 'Jardinería';
UPDATE public.services SET slug = 'limpieza' WHERE name = 'Limpieza';
UPDATE public.services SET slug = 'pintura' WHERE name = 'Pintura';

-- Verificar que todos los slugs se actualizaron correctamente
SELECT name, slug, is_popular, category 
FROM public.services 
ORDER BY is_popular DESC, name;
