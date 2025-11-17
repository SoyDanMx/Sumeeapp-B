-- =========================================================================
-- MIGRACIÓN: Agregar Columnas de Control de Precios y Tiering
-- =========================================================================
-- Este script agrega las columnas necesarias para implementar el sistema
-- de precios sugeridos por IA y el tiering de profesionales, previniendo
-- la guerra de precios y garantizando calidad del servicio.
-- =========================================================================

-- 1. CREAR TIPO ENUM PARA pro_tier
-- =========================================================================
DO $$ 
BEGIN
    -- Crear el tipo si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pro_tier_type') THEN
        CREATE TYPE pro_tier_type AS ENUM (
            'verified_express',  -- Profesionales básicos verificados
            'certified_pro',     -- Profesionales certificados
            'premium_elite'      -- Profesionales premium (futuro)
        );
        
        RAISE NOTICE 'Tipo ENUM pro_tier_type creado exitosamente';
    ELSE
        RAISE NOTICE 'Tipo ENUM pro_tier_type ya existe';
    END IF;
END $$;

-- 2. AGREGAR COLUMNAS A LA TABLA leads
-- =========================================================================

-- ai_suggested_price_min: Rango inferior del precio sugerido por IA
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS ai_suggested_price_min DECIMAL(10,2) CHECK (ai_suggested_price_min >= 0);

-- ai_suggested_price_max: Rango superior del precio sugerido por IA
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS ai_suggested_price_max DECIMAL(10,2) CHECK (ai_suggested_price_max >= 0);

-- Validación: max debe ser >= min (eliminar si existe primero)
ALTER TABLE public.leads
    DROP CONSTRAINT IF EXISTS check_price_range;

ALTER TABLE public.leads
    ADD CONSTRAINT check_price_range 
    CHECK (ai_suggested_price_max IS NULL OR ai_suggested_price_min IS NULL OR ai_suggested_price_max >= ai_suggested_price_min);

-- 3. AGREGAR COLUMNA A LA TABLA profiles
-- =========================================================================

-- pro_tier: Categoría del profesional (tiering)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS pro_tier pro_tier_type DEFAULT 'verified_express';

-- 4. AGREGAR ÍNDICES PARA OPTIMIZACIÓN
-- =========================================================================

-- Índice para búsquedas por rango de precio sugerido
CREATE INDEX IF NOT EXISTS idx_leads_ai_price_range 
    ON public.leads(ai_suggested_price_min, ai_suggested_price_max) 
    WHERE ai_suggested_price_min IS NOT NULL AND ai_suggested_price_max IS NOT NULL;

-- Índice para búsquedas por tier de profesional
CREATE INDEX IF NOT EXISTS idx_profiles_pro_tier 
    ON public.profiles(pro_tier) 
    WHERE pro_tier IS NOT NULL;

-- 5. AGREGAR COMENTARIOS PARA DOCUMENTACIÓN
-- =========================================================================

COMMENT ON COLUMN public.leads.ai_suggested_price_min IS 
    'Precio mínimo sugerido por IA basado en diagnóstico y mercado. Base para control de ofertas.';

COMMENT ON COLUMN public.leads.ai_suggested_price_max IS 
    'Precio máximo sugerido por IA basado en diagnóstico y mercado. Base para control de ofertas.';

COMMENT ON COLUMN public.profiles.pro_tier IS 
    'Tier del profesional: verified_express (básico), certified_pro (certificado), premium_elite (premium). Afecta flexibilidad de precios.';

-- 6. ACTUALIZAR PROFESIONALES EXISTENTES
-- =========================================================================

-- Asignar tier por defecto a profesionales existentes
UPDATE public.profiles
SET pro_tier = 'verified_express'
WHERE role = 'profesional' AND pro_tier IS NULL;

-- 7. VERIFICACIÓN
-- =========================================================================

-- Verificar que las columnas fueron creadas en leads
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name IN ('ai_suggested_price_min', 'ai_suggested_price_max')
ORDER BY column_name;

-- Verificar que la columna fue creada en profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'pro_tier';

-- Verificar que el tipo ENUM fue creado
SELECT 
    typname as type_name,
    typtype as type_type
FROM pg_type
WHERE typname = 'pro_tier_type';

-- Verificar valores del ENUM
SELECT 
    e.enumlabel as valor_posible
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'pro_tier_type'
ORDER BY e.enumsortorder;

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. ai_suggested_price_min/max: Precios en MXN, con 2 decimales. Mínimo 0.
-- 2. pro_tier: Por defecto 'verified_express' para todos los profesionales.
-- 3. Flexibilidad de precio según tier:
--    - verified_express: ±10% del rango sugerido
--    - certified_pro: ±15% del rango sugerido
--    - premium_elite: ±20% del rango sugerido
-- 4. Los índices optimizan consultas de búsqueda por precio y tier.
-- =========================================================================

