-- =========================================================================
-- MIGRACIÓN: Agregar Columnas de Cotización con Partidas
-- =========================================================================
-- Este script agrega las columnas necesarias para almacenar cotizaciones
-- con múltiples partidas (conceptos, cantidades, precios) y el estado
-- de aceptación del cliente.
-- =========================================================================

-- 1. ACTUALIZAR ENUM negotiation_status_type PARA INCLUIR 'propuesta_enviada' Y 'propuesta_aceptada'
-- =========================================================================
DO $$ 
BEGIN
    -- Verificar si el tipo existe
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'negotiation_status_type') THEN
        -- Agregar nuevos valores al ENUM si no existen
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'propuesta_enviada' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'negotiation_status_type')) THEN
            ALTER TYPE negotiation_status_type ADD VALUE 'propuesta_enviada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'propuesta_aceptada' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'negotiation_status_type')) THEN
            ALTER TYPE negotiation_status_type ADD VALUE 'propuesta_aceptada';
        END IF;
        
        RAISE NOTICE 'Valores agregados al ENUM negotiation_status_type';
    ELSE
        -- Si el tipo no existe, crearlo con todos los valores
        CREATE TYPE negotiation_status_type AS ENUM (
            'asignado',
            'propuesta_enviada',
            'propuesta_aceptada',
            'acuerdo_confirmado',
            'cancelado_pro',
            'cancelado_cliente',
            'rechazado_cliente'
        );
        RAISE NOTICE 'Tipo ENUM negotiation_status_type creado exitosamente';
    END IF;
END $$;

-- 2. AGREGAR COLUMNAS PARA COTIZACIÓN CON PARTIDAS
-- =========================================================================

-- quote_items: Array JSONB con las partidas de la cotización
-- Estructura: [{"concepto": "string", "cantidad": number, "precio_unitario": number, "subtotal": number}, ...]
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS quote_items JSONB DEFAULT '[]'::jsonb;

-- quote_sent_at: Timestamp de cuando se envió la propuesta al cliente
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMP WITH TIME ZONE;

-- quote_sent_by: ID del profesional que envió la propuesta
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS quote_sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- quote_accepted_at: Timestamp de cuando el cliente aceptó la propuesta
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMP WITH TIME ZONE;

-- quote_accepted_by: ID del cliente que aceptó la propuesta
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS quote_accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. AGREGAR ÍNDICES PARA OPTIMIZACIÓN
-- =========================================================================

-- Índice para búsquedas por propuestas enviadas
CREATE INDEX IF NOT EXISTS idx_leads_quote_sent_at 
    ON public.leads(quote_sent_at) 
    WHERE quote_sent_at IS NOT NULL;

-- Índice para búsquedas por propuestas aceptadas
CREATE INDEX IF NOT EXISTS idx_leads_quote_accepted_at 
    ON public.leads(quote_accepted_at) 
    WHERE quote_accepted_at IS NOT NULL;

-- Índice GIN para búsquedas en quote_items (JSONB)
CREATE INDEX IF NOT EXISTS idx_leads_quote_items_gin 
    ON public.leads USING GIN (quote_items);

-- 4. AGREGAR COMENTARIOS PARA DOCUMENTACIÓN
-- =========================================================================

COMMENT ON COLUMN public.leads.quote_items IS 
    'Array JSONB con las partidas de la cotización. Cada partida contiene: concepto, cantidad, precio_unitario, subtotal.';

COMMENT ON COLUMN public.leads.quote_sent_at IS 
    'Timestamp de cuando el profesional envió la propuesta de cotización al cliente.';

COMMENT ON COLUMN public.leads.quote_sent_by IS 
    'ID del profesional que envió la propuesta de cotización.';

COMMENT ON COLUMN public.leads.quote_accepted_at IS 
    'Timestamp de cuando el cliente aceptó la propuesta de cotización.';

COMMENT ON COLUMN public.leads.quote_accepted_by IS 
    'ID del cliente que aceptó la propuesta de cotización.';

-- 5. VERIFICACIÓN
-- =========================================================================

-- Verificar que las columnas fueron creadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name IN ('quote_items', 'quote_sent_at', 'quote_sent_by', 'quote_accepted_at', 'quote_accepted_by')
ORDER BY column_name;

-- Verificar valores del ENUM
SELECT 
    enumlabel as value
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'negotiation_status_type')
ORDER BY enumsortorder;

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. quote_items: JSONB permite búsquedas eficientes y flexibilidad en estructura
-- 2. Estructura de partida: {"concepto": string, "cantidad": number, "precio_unitario": number, "subtotal": number}
-- 3. El total se calcula sumando todos los subtotales de las partidas
-- 4. quote_accepted_at y quote_accepted_by registran cuando el cliente acepta
-- 5. Los índices optimizan consultas comunes en dashboards
-- =========================================================================

