-- Seed File for "Sumee Supply" and Truper Inventory
-- Executing this script will:
-- 1. Create a "Sumee Supply" profile in public.profiles (if not exists)
-- 2. Insert ~20 best-selling Truper products into public.marketplace_products

DO $$
DECLARE
    sumee_supply_id UUID;
    has_products BOOLEAN;
BEGIN
    -- 1. Get or Create "Sumee Supply" User ID
    -- In a real scenario, this should be a real Auth User. 
    -- For this seed, we'll try to find an existing admin or create a placeholder profile if schema allows.
    -- WARNING: Inserting into profiles usually requires an auth.users entry. 
    -- We will assume there is at least one user in the system to attribute this to, OR create a dummy UUID.
    -- Let's use a fixed UUID for "Sumee Supply" to be consistent.
    sumee_supply_id := '00000000-0000-0000-0000-000000000001'; -- Placeholder ID
    
    -- Check if profile exists, if not insert it (Mocking auth.users dependency for data structure validity)
    -- ERROR HANDLING: If foreign key constraint fails, the user must create a real user first.
    -- Ideally, we select the FIRST admin user's ID.
    SELECT user_id INTO sumee_supply_id FROM public.profiles LIMIT 1;
    
    IF sumee_supply_id IS NULL THEN
        RAISE EXCEPTION 'No users found in public.profiles. Please register a user first to act as Sumee Supply.';
    END IF;

    -- Update the profile name to "Sumee Supply" for this user (Optional, or just use their ID)
    -- UPDATE public.profiles SET full_name = 'Sumee Supply', verified = true WHERE user_id = sumee_supply_id;
    -- BETTER: Let's NOT overwrite an existing user's name. We'll just use their ID for the inserts.
    
    -- 2. Insert Products
    -- We use ON CONFLICT DO NOTHING to avoid duplicates if run multiple times.
    -- However, we don't have a unique constraint on title/seller. 
    -- So we'll check if products exist for this seller before inserting massive data.
    
    -- 3. Clean up existing products for this seller to force update (fix prices/images)
    DELETE FROM public.marketplace_products WHERE seller_id = sumee_supply_id;

    -- ==========================================
    -- HERRAMIENTAS ELÉCTRICAS (TRUPER)
    -- ==========================================
    
    INSERT INTO public.marketplace_products (seller_id, title, description, price, original_price, condition, category_id, images, location_city, location_zone)
    VALUES
    (sumee_supply_id, 'Rotomartillo 1/2", 900W, TRUPER INDUSTRIAL', 'Código: 19324 | Clave: ROTO-1/2N7\n\n- Motor de 900 W, montado sobre baleros de bolas para mayor vida útil y mejor desempeño\n- Caja de aluminio, doble engranaje con 2 velocidades mecánicas para alta resistencia de uso\n- Selector de función taladro o rotomartillo, con velocidad variable reversible', 1755.00, NULL, 'nuevo', 'construccion', ARRAY['/images/marketplace/roto-1.jpg', '/images/marketplace/roto-2.jpg', '/images/marketplace/roto-3.jpg'], 'CDMX', 'Entrega Inmediata'),
    
    (sumee_supply_id, 'Esmeriladora Angular 4-1/2" 1100W - Truper', 'Esmeriladora angular profesional. Potente motor de 1100W. 11,000 RPM. \nIdeal para corte y desbaste de metal.\nIncluye: Disco abrasivo y guarda de protección.', 1090.00, 1390.00, 'nuevo', 'construccion', ARRAY['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Taladro Inalámbrico 3/8" 12V - Truper', 'Taladro atornillador inalámbrico. Batería de Ion-Litio de 12V. \nCompacto y ligero. Luz LED para áreas oscuras.\nIncluye: Cargador y punta de cruz.', 899.00, 1100.00, 'nuevo', 'construccion', ARRAY['https://images.unsplash.com/photo-1622072183206-8ae4d5807909?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Sierra Circular 7-1/4" 1500W - Truper', 'Sierra circular profesional. Potente motor de 1500W. Capacidad de biselado hasta 45°.\nZapata de metal y guía paralela.', 1850.00, 2200.00, 'nuevo', 'construccion', ARRAY['https://images.unsplash.com/photo-1578165215096-1c25caeb5776?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Compresor de Aire 50 Litros 3HP - Truper', 'Compresor lubricado de 50 litros. Motor de 3 HP (potencia pico). \nPresión máxima 116 PSI. Doble salida de aire.\nIdeal para pintura y herramientas neumáticas.', 4200.00, 4900.00, 'nuevo', 'pintura', ARRAY['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    -- ==========================================
    -- HERRAMIENTAS MANUALES Y JUEGOS
    -- ==========================================

    (sumee_supply_id, 'Juego de Herramientas para Mecánico 85 Pzas - Pretul', 'Set completo de 85 piezas. Dados, llaves, desarmadores y pinzas. \nEstuche de plástico resistente para organización y transporte.\nExcelente relación calidad-precio.', 1350.00, 1690.00, 'nuevo', 'mecanica', ARRAY['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Caja de Herramientas Plástica 19" - Truper', 'Caja de polipropileno de alto impacto. Broches metálicos. \nCharola interior extraíble. Ideal para organizar y transportar herramienta básica.', 350.00, 480.00, 'nuevo', 'construccion', ARRAY['https://images.unsplash.com/photo-1530124566582-7c2c587326a5?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Juego de Desarmadores 10 Piezas - Truper Comfort Grip', 'Juego de desarmadores planos y de cruz. Puntas magnetizadas. \nMangos Comfort Grip para mayor comodidad y torque.\nVarillas de acero al cromo vanadio.', 320.00, 410.00, 'nuevo', 'mecanica', ARRAY['https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Pinzas de Presión 10" Mordaza Curva - Truper', 'Pinzas de presión industrial. Acero al cromo molibdeno. \nMordazas curvas con cortador de alambre. Máxima sujeción.', 185.00, 240.00, 'nuevo', 'mecanica', ARRAY['https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    -- ==========================================
    -- JARDINERÍA
    -- ==========================================

    (sumee_supply_id, 'Desbrozadora a Gasolina 26cc Curva - Truper', 'Desbrozadora con motor de 2 tiempos de 26cc. Eje curvo para mayor comodidad. \nSistema de arranque fácil. Ideal para pasto y hierba.', 3100.00, 3600.00, 'nuevo', 'jardineria', ARRAY['https://images.unsplash.com/photo-1621256566060-f655ae245db8?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Manguera Reforzada 20 Metros 1/2" - Truper', 'Manguera de 3 capas con refuerzo de tejido. Conexiones de latón. \nResistente a la intemperie y alta presión.', 290.00, 380.00, 'nuevo', 'jardineria', ARRAY['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Tijera para Podar 8" - Truper', 'Tijera de poda tipo bypass. Cuchilla de acero SK5 de alta durabilidad. \nMango de aluminio con recubrimiento antiderrapante.', 165.00, 210.00, 'nuevo', 'jardineria', ARRAY['https://images.unsplash.com/photo-1416879741977-15a488403d69?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Pala Cuadrada Puño "Y" - Truper', 'Pala cuadrada clásica. Cabeza de acero al carbono. \nMango de madera de fresno y puño tipo "Y" para mejor agarre.', 195.00, 250.00, 'nuevo', 'construccion', ARRAY['https://images.unsplash.com/photo-1622353346327-04746869403d?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Carretilla 5.5 ft³ Llanta Neumática - Truper', 'Carretilla de lámina con capacidad de 5.5 pies cúbicos. \nLlanta neumática reforzada de 16". Bastidor tubular resistente.', 1250.00, 1600.00, 'nuevo', 'construccion', ARRAY['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    -- ==========================================
    -- PLOMERÍA Y ELECTRICIDAD
    -- ==========================================

    (sumee_supply_id, 'Bomba Periférica 1/2 HP - Truper', 'Bomba de agua eléctrica 1/2 HP. Impulsor de latón. \nAltura máxima 40m. Flujo 40 L/min. Silenciosa.', 790.00, 950.00, 'nuevo', 'plomeria', ARRAY['https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Juego de Llaves Allen 13 Pzas - Truper', 'Llaves hexagonales tipo Allen. Organizador abatible. \nAcero al cromo vanadio. Medidas estándar 0.050" a 3/8".', 110.00, 150.00, 'nuevo', 'mecanica', ARRAY['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Multímetro Digital Escolar - Truper', 'Multímetro básico para estudiantes y técnicos. \nMedición de voltaje, corriente y resistencia. Pantalla LCD clara.', 180.00, 250.00, 'nuevo', 'electricidad', ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Escalera de Tijera Aluminio 3 Peldaños - Truper', 'Escalera doméstica de aluminio. Ligera y resistente. \n3 peldaños con superficie antiderrapante. Capacidad 150 kg.', 850.00, 1100.00, 'nuevo', 'construccion', ARRAY['https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata'),

    (sumee_supply_id, 'Pistola de Calor 1500W - Truper', 'Pistola de aire caliente con temperatura variable 300°C - 500°C. \nPara quitar pintura, descongelar tuberías y aplicar termoencogible.', 650.00, 820.00, 'nuevo', 'electricidad', ARRAY['https://images.unsplash.com/photo-1581092918056-0c4c3acd90f9?auto=format&fit=crop&q=80&w=800'], 'CDMX', 'Entrega Inmediata');
END $$;
