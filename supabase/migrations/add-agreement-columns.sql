-- =========================================================================
-- MIGRACIÓN: Agregar Columnas de Confirmación de Acuerdo Final
-- =========================================================================
-- Este script agrega las columnas necesarias para capturar el precio y
-- alcance del trabajo acordado entre profesional y cliente, sentando la
-- base para la monetización (comisión al PRO y membresía al cliente).
-- =========================================================================

-- 1. CREAR TIPO ENUM PARA negotiation_status
-- =========================================================================
DO $$ 
BEGIN
    -- Crear el tipo si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'negotiation_status_type') THEN
        CREATE TYPE negotiation_status_type AS ENUM (
            'asignado',              -- Lead asignado, esperando confirmación
            'acuerdo_confirmado',    -- Acuerdo confirmado por profesional
            'cancelado_pro',        -- Cancelado por profesional
            'cancelado_cliente',    -- Cancelado por cliente
            'rechazado_cliente'     -- Cliente rechazó el acuerdo
        );
        
        RAISE NOTICE 'Tipo ENUM negotiation_status_type creado exitosamente';
    ELSE
        RAISE NOTICE 'Tipo ENUM negotiation_status_type ya existe';
    END IF;
END $$;

-- 2. AGREGAR COLUMNAS A LA TABLA leads
-- =========================================================================

-- agreed_price: Precio final acordado (base para cálculo de comisión)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS agreed_price DECIMAL(10,2) CHECK (agreed_price >= 0);

-- agreed_scope: Alcance del trabajo acordado (documento para garantía y disputas)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS agreed_scope TEXT;

-- negotiation_status: Estado de la negociación (control de flujo)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS negotiation_status negotiation_status_type;

-- agreed_at: Timestamp de cuando se confirmó el acuerdo (auditoría)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS agreed_at TIMESTAMP WITH TIME ZONE;

-- agreed_by: ID del usuario que confirmó el acuerdo (auditoría)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS agreed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. AGREGAR ÍNDICES PARA OPTIMIZACIÓN
-- =========================================================================

-- Índice para búsquedas por estado de negociación
CREATE INDEX IF NOT EXISTS idx_leads_negotiation_status 
    ON public.leads(negotiation_status) 
    WHERE negotiation_status IS NOT NULL;

-- Índice para búsquedas por profesional que confirmó
CREATE INDEX IF NOT EXISTS idx_leads_agreed_by 
    ON public.leads(agreed_by) 
    WHERE agreed_by IS NOT NULL;

-- Índice compuesto para consultas comunes (profesional + estado)
CREATE INDEX IF NOT EXISTS idx_leads_profesional_negotiation 
    ON public.leads(profesional_asignado_id, negotiation_status) 
    WHERE profesional_asignado_id IS NOT NULL;

-- 4. AGREGAR COMENTARIOS PARA DOCUMENTACIÓN
-- =========================================================================

COMMENT ON COLUMN public.leads.agreed_price IS 
    'Precio final acordado entre profesional y cliente. Base para cálculo de comisión.';

COMMENT ON COLUMN public.leads.agreed_scope IS 
    'Alcance detallado del trabajo acordado. Documento para garantía y resolución de disputas.';

COMMENT ON COLUMN public.leads.negotiation_status IS 
    'Estado de la negociación: asignado, acuerdo_confirmado, cancelado_pro, cancelado_cliente, rechazado_cliente.';

COMMENT ON COLUMN public.leads.agreed_at IS 
    'Timestamp de cuando se confirmó el acuerdo final. Usado para auditoría.';

COMMENT ON COLUMN public.leads.agreed_by IS 
    'ID del usuario (profesional) que confirmó el acuerdo. Usado para auditoría.';

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
    AND column_name IN ('agreed_price', 'agreed_scope', 'negotiation_status', 'agreed_at', 'agreed_by')
ORDER BY column_name;

-- Verificar que el tipo ENUM fue creado
SELECT 
    typname as type_name,
    typtype as type_type
FROM pg_type
WHERE typname = 'negotiation_status_type';

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. agreed_price: Precio en MXN, con 2 decimales. Mínimo 0.
-- 2. agreed_scope: Texto libre, recomendado mínimo 50 caracteres.
-- 3. negotiation_status: Complementa el campo 'estado', no lo reemplaza.
-- 4. agreed_at y agreed_by: Campos de auditoría para trazabilidad.
-- 5. Los índices optimizan consultas comunes en el dashboard profesional.
-- =========================================================================

