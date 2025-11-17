-- =========================================================================
-- SCRIPT DE VERIFICACIÓN: Columnas de Confirmación de Acuerdo
-- =========================================================================
-- Ejecuta este script para verificar que todas las columnas fueron creadas
-- =========================================================================

-- Verificar que las columnas fueron creadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN data_type = 'USER-DEFINED' THEN 
            (SELECT typname FROM pg_type WHERE oid = (SELECT typtype FROM pg_type WHERE typname = column_name::text))
        ELSE data_type
    END as actual_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name IN ('agreed_price', 'agreed_scope', 'negotiation_status', 'agreed_at', 'agreed_by')
ORDER BY column_name;

-- Verificar que el tipo ENUM fue creado (ya lo confirmaste)
SELECT 
    typname as type_name,
    typtype as type_type,
    CASE typtype
        WHEN 'e' THEN 'ENUM'
        ELSE 'OTRO'
    END as tipo_descripcion
FROM pg_type
WHERE typname = 'negotiation_status_type';

-- Verificar valores del ENUM
SELECT 
    e.enumlabel as valor_posible
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'negotiation_status_type'
ORDER BY e.enumsortorder;

-- Verificar índices creados
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'leads'
    AND indexname IN (
        'idx_leads_negotiation_status',
        'idx_leads_agreed_by',
        'idx_leads_profesional_negotiation'
    )
ORDER BY indexname;

