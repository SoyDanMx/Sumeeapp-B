-- =========================================================================
-- SCRIPT DE MIGRACIÓN: AGREGAR COLUMNA REVIEW_COUNT A LA TABLA PROFILES
-- =========================================================================
-- Este script añade la columna review_count para implementar el sistema
-- de calificación inteligente por fases.

-- 1. AÑADIR COLUMNA REVIEW_COUNT
-- =========================================================================
DO $$
BEGIN
    -- Verificar si la columna review_count existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'review_count'
    ) THEN
        -- Agregar la columna review_count
        ALTER TABLE public.profiles 
        ADD COLUMN review_count INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Columna review_count agregada a la tabla profiles';
    ELSE
        RAISE NOTICE 'La columna review_count ya existe en la tabla profiles';
    END IF;
END $$;

-- 2. ACTUALIZAR VALORES EXISTENTES (OPCIONAL)
-- =========================================================================
-- Si ya tienes datos, puedes actualizar los valores existentes
-- basándote en alguna lógica de negocio existente
UPDATE public.profiles 
SET review_count = 0 
WHERE review_count IS NULL;

-- 3. CREAR ÍNDICE PARA OPTIMIZAR CONSULTAS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_review_count 
ON public.profiles(review_count);

-- 4. COMENTARIOS SOBRE MANTENIMIENTO FUTURO
-- =========================================================================
-- NOTA: Para mantener esta columna actualizada automáticamente,
-- se recomienda crear un trigger que se ejecute cuando se inserten,
-- actualicen o eliminen registros en una futura tabla 'reviews'.
-- 
-- Ejemplo de trigger (para implementar cuando se cree la tabla reviews):
-- 
-- CREATE OR REPLACE FUNCTION update_review_count()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF TG_OP = 'INSERT' THEN
--         UPDATE public.profiles 
--         SET review_count = review_count + 1 
--         WHERE user_id = NEW.professional_id;
--         RETURN NEW;
--     ELSIF TG_OP = 'DELETE' THEN
--         UPDATE public.profiles 
--         SET review_count = review_count - 1 
--         WHERE user_id = OLD.professional_id;
--         RETURN OLD;
--     END IF;
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- CREATE TRIGGER trigger_update_review_count
--     AFTER INSERT OR DELETE ON public.reviews
--     FOR EACH ROW
--     EXECUTE FUNCTION update_review_count();

RAISE NOTICE 'Script de migración para review_count ejecutado exitosamente.';
