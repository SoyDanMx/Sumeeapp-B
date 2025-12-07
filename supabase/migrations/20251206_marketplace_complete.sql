-- ALL-IN-ONE Marketplace Setup Script
-- FIXED: Added explicit LANGUAGE plpgsql to DO blocks to prevent syntax errors.

-- ==========================================
-- STEP 1: SCHEMA AND TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    seller_id UUID NOT NULL, -- We will add FK constraint separately to be safe or if user_id is unique
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

-- Add Foreign Key if it doesn't exist (Idempotent way)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'marketplace_products_seller_id_fkey') THEN
        -- Try to reference users table first (most standard) or profiles if you prefer
        -- Assuming profiles.user_id is the link.
        -- Note: If profiles.user_id is NOT unique, this might fail. 
        -- Safer to reference auth.users if we just need the ID validity.
        -- But for the frontend join, we need the relationship.
        ALTER TABLE public.marketplace_products 
        ADD CONSTRAINT marketplace_products_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES public.profiles(user_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add FK to profiles(user_id). Ensure profiles.user_id is UNIQUE. Proceeding without strict FK for now.';
END $$ LANGUAGE plpgsql;

-- RLS Policies
DO $$
BEGIN
    -- Enable RLS
    ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

    -- Create Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_products' AND policyname = 'Public can view active products') THEN
        CREATE POLICY "Public can view active products" ON public.marketplace_products FOR SELECT USING (status = 'active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_products' AND policyname = 'Pros can insert their own products') THEN
        CREATE POLICY "Pros can insert their own products" ON public.marketplace_products FOR INSERT WITH CHECK (auth.uid() = seller_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_products' AND policyname = 'Sellers can update their own products') THEN
        CREATE POLICY "Sellers can update their own products" ON public.marketplace_products FOR UPDATE USING (auth.uid() = seller_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_products' AND policyname = 'Sellers can delete their own products') THEN
        CREATE POLICY "Sellers can delete their own products" ON public.marketplace_products FOR DELETE USING (auth.uid() = seller_id);
    END IF;
END $$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON public.marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller ON public.marketplace_products(seller_id);

-- Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketplace', 'marketplace', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access Marketplace Images') THEN
        CREATE POLICY "Public Access Marketplace Images" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Pros Upload Marketplace Images') THEN
        CREATE POLICY "Pros Upload Marketplace Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace' AND auth.role() = 'authenticated');
    END IF;
END $$ LANGUAGE plpgsql;


-- ==========================================
-- STEP 2: SEED DATA (SUMEE SUPPLY)
-- ==========================================

DO $$
DECLARE
    sumee_supply_id UUID;
    has_products BOOLEAN;
BEGIN
    -- 1. Get or Create "Sumee Supply" User ID
    SELECT user_id INTO sumee_supply_id FROM public.profiles LIMIT 1;
    
    IF sumee_supply_id IS NULL THEN
        RAISE NOTICE 'No users found in public.profiles. Skipping seed data insertion.';
        RETURN;
    END IF;

    -- 2. Insert Products if they don't exist for this seller
    SELECT EXISTS(SELECT 1 FROM public.marketplace_products WHERE seller_id = sumee_supply_id LIMIT 1) INTO has_products;

    IF NOT has_products THEN
        RAISE NOTICE 'Seeding Truper products for seller %', sumee_supply_id;
    
        -- HERRAMIENTAS ELÉCTRICAS
        INSERT INTO public.marketplace_products (seller_id, title, description, price, original_price, condition, category_id, images, location_city, location_zone) VALUES
        (sumee_supply_id, 'Rotomartillo Industrial 1/2" 900W - Truper 19324', 'Rotomartillo profesional de 900W. Uso rudo. Velocidad variable y reversible. \nModelo: ROTO-1/2N7\nIncluye: Mango auxiliar y varilla de profundidad.', 1755.00, 2100.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/a53/rotomartillo-profesional-1-2-650-w-603.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Esmeriladora Angular 4-1/2" 1100W - Truper PRO', 'Esmeriladora angular profesional 1100W. Mango auxiliar ajustable a 3 posiciones.\nIdeal para trabajos de herrería y corte de metal.', 1115.00, 1350.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/58c/esmeriladora-angular-4-1-2-profesional-800-w-83d.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Taladro Inalámbrico 3/8" 12V - Truper', 'Taladro atornillador inalámbrico. Batería de Ion-Litio de 12V. \nCompacto y ligero. Luz LED para áreas oscuras.\nIncluye: Cargador y punta de cruz.', 1585.00, 1850.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/f47/taladro-atornillador-inalambrico-3-8-profesional-12-v-f14.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Sierra Circular 7-1/4" 1500W - Truper', 'Sierra circular profesional. Potente motor de 1500W. Capacidad de biselado hasta 45°.\nZapata de metal y guía paralela.', 1990.00, 2400.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/6c7/sierra-circular-7-1-4-profesional-1-500-w-e23.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Compresor de Aire 50 Litros 3HP - Truper', 'Compresor lubricado de 50 litros. Motor de 3 HP. Vertical 127V. \nLibre de aceite. Doble salida de aire.\nIdeal para pintura y herramientas neumáticas.', 4290.00, 4900.00, 'nuevo', 'pintura', ARRAY['https://www.truper.com/media/product/b3c/compresor-de-aire-50-l-3-1-2-hp-potencia-maxima-127-v-6f5.jpg'], 'CDMX', 'Entrega Inmediata'),

        -- HERRAMIENTAS MANUALES
        (sumee_supply_id, 'Juego de Herramientas 83 Pzas - Pretul', 'Set completo de 83 piezas para mecánico. Dados, llaves, desarmadores y pinzas. \nEstuche de tela resistente. Excelente para reparaciones básicas.', 455.00, 550.00, 'nuevo', 'mecanica', ARRAY['https://www.truper.com/media/product/e85/juego-de-herramientas-para-mecanico-85-piezas-pretul-a0e.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Caja Herramientas 19"x25" 3 en 1 con Ruedas - Truper', 'Caja desmontable 3 en 1. Ruedas grandes de uso rudo. \nCompartimentos en tapa. Hecha en polipropileno de alto impacto.', 805.00, 950.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/88f/caja-para-herramienta-19-plastica-broches-metalicos-truper-ef2.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Juego de Desarmadores 10 Piezas - Truper Comfort Grip', 'Juego de desarmadores planos y de cruz. Puntas magnetizadas. \nMangos Comfort Grip para mayor comodidad y torque.\nVarillas de acero al cromo vanadio.', 320.00, 410.00, 'nuevo', 'mecanica', ARRAY['https://www.truper.com/media/product/2e2/juego-de-6-desarmadores-mango-comfort-grip-truper-ec9.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Pinzas de Presión 10" Mordaza Curva - Truper', 'Pinzas de presión industrial. Acero al cromo molibdeno. \nMordazas curvas con cortador de alambre. Máxima sujeción.', 185.00, 240.00, 'nuevo', 'mecanica', ARRAY['https://www.truper.com/media/product/a53/pinza-de-presion-10-mordaza-curva-mango-de-vinil-truper-d4f.jpg'], 'CDMX', 'Entrega Inmediata'),

        -- JARDINERÍA
        (sumee_supply_id, 'Desbrozadora a Gasolina 26cc Curva - Truper', 'Desbrozadora con motor de 2 tiempos de 26cc. Eje curvo para mayor comodidad. \nSistema de arranque fácil. Ideal para pasto y hierba.', 3100.00, 3600.00, 'nuevo', 'jardineria', ARRAY['https://www.truper.com/media/product/58c/desbrozadora-a-gasolina-26-cc-mango-d-eje-curvo-truper-ff5.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Manguera Reforzada 20 Metros 1/2" - Truper', 'Manguera de 3 capas con refuerzo de tejido. Conexiones de latón. \nResistente a la intemperie y alta presión.', 290.00, 380.00, 'nuevo', 'jardineria', ARRAY['https://www.truper.com/media/product/a2b/manguera-reforzada-3-capas-1-2-20-m-conexiones-plasticas-truper-98d.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Tijera para Podar 8" - Truper', 'Tijera de poda tipo bypass. Cuchilla de acero SK5 de alta durabilidad. \nMango de aluminio con recubrimiento antiderrapante.', 165.00, 210.00, 'nuevo', 'jardineria', ARRAY['https://www.truper.com/media/product/274/tijera-para-podar-8-cuerpo-de-aluminio-truper-93d.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Pala Cuadrada Puño "Y" - Truper', 'Pala cuadrada clásica. Cabeza de acero al carbono. \nMango de madera de fresno y puño tipo "Y" para mejor agarre.', 195.00, 250.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/6e5/pala-cuadrada-puno-y-mango-largo-truper-ced.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Carretilla 5.5 ft³ Llanta Neumática - Truper', 'Carretilla de lámina con capacidad de 5.5 pies cúbicos. \nLlanta neumática reforzada de 16". Bastidor tubular resistente.', 1250.00, 1600.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/8ac/carretilla-5-5-ft3-llanta-neumatica-reforzada-truper-873.jpg'], 'CDMX', 'Entrega Inmediata'),

        -- PLOMERÍA Y ELECTRICIDAD
        (sumee_supply_id, 'Bomba Periférica 1/2 HP - Truper', 'Bomba de agua eléctrica 1/2 HP. Impulsor de latón. \nAltura máxima 40m. Flujo 40 L/min. Silenciosa.', 790.00, 950.00, 'nuevo', 'plomeria', ARRAY['https://www.truper.com/media/product/8ac/bomba-periferica-1-2-hp-truper-873.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Juego de Llaves Allen 13 Pzas - Truper', 'Llaves hexagonales tipo Allen. Organizador abatible. \nAcero al cromo vanadio. Medidas estándar 0.050" a 3/8".', 110.00, 150.00, 'nuevo', 'mecanica', ARRAY['https://www.truper.com/media/product/58c/juego-de-13-llaves-allen-std-tipo-navaja-truper-ff5.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Multímetro Digital Escolar - Truper', 'Multímetro básico para estudiantes y técnicos. \nMedición de voltaje, corriente y resistencia. Pantalla LCD clara.', 180.00, 250.00, 'nuevo', 'electricidad', ARRAY['https://www.truper.com/media/product/a53/multimetro-digital-basico-truper-d4f.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Escalera de Tijera Aluminio 3 Peldaños - Truper', 'Escalera doméstica de aluminio. Ligera y resistente. \n3 peldaños con superficie antiderrapante. Capacidad 150 kg.', 850.00, 1100.00, 'nuevo', 'construccion', ARRAY['https://www.truper.com/media/product/6e5/escalera-de-tijera-tipo-iii-3-peldanos-truper-ced.jpg'], 'CDMX', 'Entrega Inmediata'),
        (sumee_supply_id, 'Pistola de Calor 1500W - Truper', 'Pistola de aire caliente con temperatura variable 300°C - 500°C. \nPara quitar pintura, descongelar tuberías y aplicar termoencogible.', 650.00, 820.00, 'nuevo', 'electricidad', ARRAY['https://www.truper.com/media/product/a53/pistola-de-calor-basica-truper-d4f.jpg'], 'CDMX', 'Entrega Inmediata');
    ELSE
        RAISE NOTICE 'Products already exist for seller %. Skipping seed.', sumee_supply_id;
    END IF;
END $$ LANGUAGE plpgsql;
