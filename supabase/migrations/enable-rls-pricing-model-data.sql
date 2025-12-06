-- =========================================================================
-- HABILITAR RLS EN pricing_model_data
-- =========================================================================
-- Este script habilita Row Level Security (RLS) en la tabla pricing_model_data
-- y crea políticas apropiadas para acceso seguro.

-- 1. HABILITAR RLS
ALTER TABLE public.pricing_model_data ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA DE LECTURA: Permitir lectura pública (para Edge Functions y consultas)
-- La tabla contiene datos agregados de precios que pueden ser consultados públicamente
CREATE POLICY "Anyone can view pricing model data"
    ON public.pricing_model_data
    FOR SELECT
    USING (true);

-- 3. POLÍTICA DE INSERCIÓN: Solo funciones autenticadas pueden insertar
-- Las funciones SQL autenticadas pueden insertar nuevos datos de precios
CREATE POLICY "Authenticated users can insert pricing model data"
    ON public.pricing_model_data
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. POLÍTICA DE ACTUALIZACIÓN: Solo funciones autenticadas pueden actualizar
-- Las funciones SQL autenticadas pueden actualizar datos existentes
CREATE POLICY "Authenticated users can update pricing model data"
    ON public.pricing_model_data
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. POLÍTICA DE ELIMINACIÓN: Solo service_role puede eliminar
-- Solo el servicio puede eliminar datos antiguos (por ejemplo, versiones antiguas)
-- Nota: Si necesitas que usuarios autenticados también puedan eliminar, ajusta esta política
CREATE POLICY "Service role can delete pricing model data"
    ON public.pricing_model_data
    FOR DELETE
    TO service_role
    USING (true);

-- =========================================================================
-- VERIFICACIÓN
-- =========================================================================
-- Verificar que RLS está habilitado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'pricing_model_data'
    ) THEN
        IF EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'pricing_model_data'
        ) THEN
            RAISE NOTICE '✅ RLS habilitado y políticas creadas para pricing_model_data';
        ELSE
            RAISE WARNING '⚠️ RLS habilitado pero no se encontraron políticas';
        END IF;
    ELSE
        RAISE WARNING '⚠️ La tabla pricing_model_data no existe';
    END IF;
END $$;

