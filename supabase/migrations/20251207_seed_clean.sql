-- Clean Seed Data for Marketplace
-- PRE-REQUISITE: Run '20251207_rebuild_marketplace.sql' first to ensure schema matches!

INSERT INTO public.marketplace_products 
(title, description, price, original_price, condition, category_id, images, location_city, location_zone, status, contact_phone, created_at)
VALUES 
-- 1. Rotomartillo (The corrected item with local images)
(
    'Rotomartillo Industrial 1/2" 900W - Truper 19324',
    'Rotomartillo profesional de 900W. Uso rudo. Velocidad variable y reversible. 
Modelo: ROTO-1/2N7
Incluye: Mango auxiliar y varilla de profundidad.
Ideal para concreto, madera y metal. Diseño ergonómico y antiderrapante.',
    1755.00,
    NULL, -- No fake discount to avoid confusion
    'nuevo',
    'construccion',
    ARRAY['/images/marketplace/roto-1.jpg', '/images/marketplace/roto-2.jpg', '/images/marketplace/roto-3.jpg'],
    'CDMX',
    'Entrega Inmediata',
    'active',
    '5512345678',
    NOW()
),

-- 2. Taladro Inalámbrico
(
    'Taladro Inalámbrico 20V Pretul',
    'Taladro destornillador inalámbrico. 
Batería de Ion-Litio con mayor duración.
Luz LED para iluminar área de trabajo.',
    850.00,
    1100.00,
    'nuevo',
    'electricidad',
    ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800'],
    'CDMX',
    'Centro',
    'active',
    '5512345678',
    NOW() - INTERVAL '1 day'
),

-- 3. Juego de Herramientas
(
    'Juego de Herramientas Mecánicas 100 pzas',
    'Set completo de dados y llaves.
Acero al cromo vanadio. Estuche organizador plástico resistente.',
    2200.00,
    NULL,
    'nuevo',
    'mecanica',
    ARRAY['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=800'],
    'Naucalpan',
    'Zona Industrial',
    'active',
    '5599887766',
    NOW() - INTERVAL '2 days'
),

-- 4. Esmeriladora Angular
(
    'Esmeriladora Angular 4 1/2"',
    'Potente motor de 700W. Mango auxiliar de 2 posiciones.
Guarda de ajuste rápido.',
    950.00,
    NULL,
    'nuevo',
    'construccion',
    ARRAY['https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=800'],
    'CDMX',
    'Sur',
    'active',
    '5512345678',
    NOW() - INTERVAL '3 days'
),

-- 5. Generador Portátil
(
    'Generador Eléctrico a Gasolina 2500W',
    'Motor OHV a 4 tiempos. Tanque de 15 litros.
Arranque manual. Ideal para emergencias o trabajo en campo.',
    6500.00,
    7200.00,
    'usado_excelente',
    'electricidad',
    ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'],
    'Toluca',
    'Parque Industrial',
    'active',
    '7221234567',
    NOW() - INTERVAL '5 days'
);
