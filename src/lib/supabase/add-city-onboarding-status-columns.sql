-- =========================================================================
-- SCRIPT PARA AÑADIR COLUMNAS CITY Y ONBOARDING_STATUS A PUBLIC.PROFILES
-- =========================================================================
-- Este script es idempotente y seguro ejecutarlo múltiples veces

-- Paso 1: Añadir columna city (ciudad principal del profesional)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN city TEXT;
        
        -- Establecer valor por defecto para registros existentes
        UPDATE public.profiles 
        SET city = 'Ciudad de México' 
        WHERE city IS NULL AND role = 'profesional';
        
        RAISE NOTICE '✅ Columna "city" agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "city" ya existe';
    END IF;
END $$;

-- Paso 2: Añadir columna onboarding_status (estado del profesional en el onboarding)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'onboarding_status'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN onboarding_status TEXT NOT NULL DEFAULT 'pending_review';
        
        -- Establecer estado 'approved' para profesionales existentes de CDMX
        UPDATE public.profiles 
        SET onboarding_status = 'approved' 
        WHERE role = 'profesional' 
        AND (city = 'Ciudad de México' OR city IS NULL);
        
        -- Establecer estado 'waitlist_other_city' para profesionales de otras ciudades si los hay
        UPDATE public.profiles 
        SET onboarding_status = 'waitlist_other_city' 
        WHERE role = 'profesional' 
        AND city IS NOT NULL 
        AND city != 'Ciudad de México';
        
        RAISE NOTICE '✅ Columna "onboarding_status" agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ La columna "onboarding_status" ya existe';
    END IF;
END $$;

-- Paso 3: Verificar que las columnas fueron creadas correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name IN ('city', 'onboarding_status');

-- Paso 4: Añadir comentarios descriptivos
COMMENT ON COLUMN public.profiles.city IS 'Ciudad principal donde el profesional opera (ej: Ciudad de México, Monterrey, Guadalajara)';
COMMENT ON COLUMN public.profiles.onboarding_status IS 'Estado del profesional en el proceso de onboarding: approved, pending_review, waitlist_other_city, rejected';

