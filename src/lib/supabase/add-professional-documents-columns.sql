-- =========================================================================
-- AGREGAR COLUMNAS PARA DOCUMENTOS Y PORTFOLIO DE PROFESIONALES
-- =========================================================================
-- Este script agrega campos para almacenar:
-- 1. Portfolio de proyectos (con descripciones)
-- 2. Certificaciones (DC-3, Red CONOCER)
-- 3. Antecedentes no penales

-- =========================================================================
-- 1. AGREGAR COLUMNAS A LA TABLA PROFILES
-- =========================================================================

-- Portfolio de proyectos (JSONB para almacenar array de objetos con url, description, type)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'portfolio'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN portfolio JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Columna portfolio agregada a la tabla profiles';
    ELSE
        RAISE NOTICE 'La columna portfolio ya existe en la tabla profiles';
    END IF;
END $$;

-- URLs de certificaciones (array de URLs)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'certificaciones_urls'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN certificaciones_urls TEXT[] DEFAULT ARRAY[]::TEXT[];
        
        RAISE NOTICE 'Columna certificaciones_urls agregada a la tabla profiles';
    ELSE
        RAISE NOTICE 'La columna certificaciones_urls ya existe en la tabla profiles';
    END IF;
END $$;

-- URL de antecedentes no penales
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'antecedentes_no_penales_url'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN antecedentes_no_penales_url TEXT;
        
        RAISE NOTICE 'Columna antecedentes_no_penales_url agregada a la tabla profiles';
    ELSE
        RAISE NOTICE 'La columna antecedentes_no_penales_url ya existe en la tabla profiles';
    END IF;
END $$;

-- =========================================================================
-- 2. VERIFICAR ESTRUCTURA
-- =========================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('portfolio', 'certificaciones_urls', 'antecedentes_no_penales_url', 'avatar_url')
ORDER BY column_name;

-- =========================================================================
-- 3. COMENTARIOS
-- =========================================================================
COMMENT ON COLUMN public.profiles.portfolio IS 
'Portfolio de proyectos del profesional. JSONB array de objetos: [{"url": "...", "description": "...", "type": "..."}]';

COMMENT ON COLUMN public.profiles.certificaciones_urls IS 
'Array de URLs a certificaciones del profesional (DC-3, Red CONOCER, etc.)';

COMMENT ON COLUMN public.profiles.antecedentes_no_penales_url IS 
'URL a la constancia de antecedentes no penales del profesional';

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. El campo portfolio es JSONB para flexibilidad en almacenar objetos complejos
-- 2. Cada item del portfolio tiene: url (string), description (string), type (string)
-- 3. Las certificaciones_urls es un array de strings (URLs)
-- 4. antecedentes_no_penales_url es un string simple (URL)
-- 5. Todos estos campos son opcionales (NULL permitido)

