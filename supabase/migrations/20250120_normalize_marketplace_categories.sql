-- =========================================================================
-- MÓDULO 1: Normalización de Categorías del Marketplace
-- =========================================================================
-- Este script crea la tabla marketplace_categories y migra los valores
-- inconsistentes de category_id a relaciones FK normalizadas
-- =========================================================================

-- Paso 1: Crear tabla de categorías normalizada
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT, -- Nombre del icono de FontAwesome
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Paso 2: Crear índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_slug ON public.marketplace_categories(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_name ON public.marketplace_categories(name);

-- Paso 3: Insertar categorías estándar basadas en los valores existentes
-- Mapeo de valores inconsistentes a slugs normalizados
INSERT INTO public.marketplace_categories (slug, name, icon, description) VALUES
    ('plomeria', 'Plomería', 'faWrench', 'Herramientas y suministros de plomería'),
    ('electricidad', 'Electricidad', 'faBolt', 'Herramientas y materiales eléctricos'),
    ('construccion', 'Construcción', 'faHammer', 'Herramientas y equipos de construcción'),
    ('mecanica', 'Mecánica', 'faTools', 'Herramientas mecánicas y automotrices'),
    ('pintura', 'Pintura', 'faPaintRoller', 'Materiales y herramientas de pintura'),
    ('jardineria', 'Jardinería', 'faTree', 'Herramientas y equipos de jardinería'),
    ('herramienta-electrica', 'Herramienta Eléctrica', 'faPlug', 'Herramientas eléctricas e inalámbricas'),
    ('herramienta-manual', 'Herramienta Manual', 'faWrench', 'Herramientas manuales'),
    ('varios', 'Varios', 'faBox', 'Otras categorías')
ON CONFLICT (slug) DO NOTHING;

-- Paso 4: Agregar columna temporal para migración
DO $$
BEGIN
    -- Agregar columna category_id_new si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_products' 
        AND column_name = 'category_id_new'
    ) THEN
        ALTER TABLE public.marketplace_products 
        ADD COLUMN category_id_new UUID REFERENCES public.marketplace_categories(id);
    END IF;
END $$;

-- Paso 5: Migrar valores existentes a la nueva estructura
-- Mapeo de valores antiguos a slugs nuevos
UPDATE public.marketplace_products mp
SET category_id_new = (
    SELECT c.id 
    FROM public.marketplace_categories c
    WHERE 
        -- Mapeo directo
        (LOWER(mp.category_id) = LOWER(c.slug))
        OR
        -- Mapeo de variaciones comunes
        (LOWER(mp.category_id) LIKE '%plomeria%' OR LOWER(mp.category_id) LIKE '%plomería%' AND c.slug = 'plomeria')
        OR
        (LOWER(mp.category_id) LIKE '%electricidad%' OR LOWER(mp.category_id) LIKE '%electric%' AND c.slug = 'electricidad')
        OR
        (LOWER(mp.category_id) LIKE '%construccion%' OR LOWER(mp.category_id) LIKE '%construcción%' AND c.slug = 'construccion')
        OR
        (LOWER(mp.category_id) LIKE '%mecanica%' OR LOWER(mp.category_id) LIKE '%mecánica%' AND c.slug = 'mecanica')
        OR
        (LOWER(mp.category_id) LIKE '%pintura%' AND c.slug = 'pintura')
        OR
        (LOWER(mp.category_id) LIKE '%jardineria%' OR LOWER(mp.category_id) LIKE '%jardinería%' AND c.slug = 'jardineria')
        OR
        (LOWER(mp.category_id) LIKE '%herramienta%electric%' AND c.slug = 'herramienta-electrica')
        OR
        (LOWER(mp.category_id) LIKE '%herramienta%manual%' AND c.slug = 'herramienta-manual')
    LIMIT 1
)
WHERE category_id_new IS NULL;

-- Si no se encontró categoría, asignar 'varios' por defecto
UPDATE public.marketplace_products mp
SET category_id_new = (SELECT id FROM public.marketplace_categories WHERE slug = 'varios')
WHERE category_id_new IS NULL;

-- Paso 6: Renombrar columnas (cambio de TEXT a UUID FK)
DO $$
BEGIN
    -- Eliminar columna antigua si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_products' 
        AND column_name = 'category_id'
    ) THEN
        -- Renombrar columna antigua
        ALTER TABLE public.marketplace_products RENAME COLUMN category_id TO category_id_old;
    END IF;
    
    -- Renombrar nueva columna
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_products' 
        AND column_name = 'category_id_new'
    ) THEN
        ALTER TABLE public.marketplace_products RENAME COLUMN category_id_new TO category_id;
    END IF;
END $$;

-- Paso 7: Hacer category_id NOT NULL después de la migración
DO $$
BEGIN
    ALTER TABLE public.marketplace_products 
    ALTER COLUMN category_id SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo hacer category_id NOT NULL. Verificar que todos los productos tengan categoría asignada.';
END $$;

-- Paso 8: Actualizar índices existentes
DROP INDEX IF EXISTS idx_marketplace_products_category;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products(category_id);

-- Paso 9: RLS para categorías (público puede leer)
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view categories" ON public.marketplace_categories;
CREATE POLICY "Public can view categories" 
ON public.marketplace_categories FOR SELECT 
USING (true);

-- Paso 10: Función para obtener el slug de categoría desde el ID
CREATE OR REPLACE FUNCTION get_category_slug(category_uuid UUID)
RETURNS TEXT AS $$
    SELECT slug FROM public.marketplace_categories WHERE id = category_uuid;
$$ LANGUAGE sql STABLE;

-- Verificación: Mostrar resumen de migración
DO $$
DECLARE
    total_products INTEGER;
    migrated_count INTEGER;
    unmapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products FROM public.marketplace_products;
    SELECT COUNT(*) INTO migrated_count FROM public.marketplace_products WHERE category_id IS NOT NULL;
    SELECT COUNT(*) INTO unmapped_count FROM public.marketplace_products WHERE category_id IS NULL;
    
    RAISE NOTICE '✅ Migración completada:';
    RAISE NOTICE '   Total productos: %', total_products;
    RAISE NOTICE '   Productos migrados: %', migrated_count;
    RAISE NOTICE '   Productos sin categoría: %', unmapped_count;
END $$;

