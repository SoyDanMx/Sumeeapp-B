-- =========================================================================
-- SCRIPT PARA AGREGAR SERVICIO 'PROYECTOS Y REMODELACIONES' A LA TABLA SERVICES
-- =========================================================================
-- Este script es idempotente y seguro ejecutarlo múltiples veces

-- Paso 1: Verificar si el servicio ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.services WHERE slug = 'proyectos'
    ) THEN
        -- Insertar el nuevo servicio
        INSERT INTO public.services (
            name,
            slug,
            category,
            description,
            is_popular,
            created_at,
            updated_at
        )
        VALUES (
            'Proyectos y Remodelaciones',
            'proyectos',
            'Proyectos',
            'Proyectos grandes, remodelaciones integrales y obras civiles. Incluye diseño, construcción, supervisión y gestión completa de proyectos.',
            false, -- No es popular por defecto
            NOW(),
            NOW()
        );

        RAISE NOTICE '✅ Servicio "Proyectos y Remodelaciones" agregado exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ El servicio "proyectos" ya existe';
    END IF;
END $$;

-- Paso 2: Verificar que el servicio fue creado correctamente
SELECT
    id,
    name,
    slug,
    category,
    description,
    is_popular,
    created_at
FROM public.services
WHERE slug = 'proyectos';

