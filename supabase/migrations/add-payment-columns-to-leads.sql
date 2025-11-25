-- =========================================================================
-- MIGRACIÓN: Agregar Columnas de Pago a la Tabla leads
-- =========================================================================
-- Fecha: 2025-11-22
-- Objetivo: Agregar soporte para retención de fondos con Stripe ($350 MXN)
-- Seguridad: Solo agrega columnas nuevas, NO modifica columnas existentes
-- Nota: Verifica si ya existen columnas relacionadas con pagos
-- =========================================================================

-- 1. VERIFICAR COLUMNAS EXISTENTES Y AGREGAR LAS FALTANTES
-- =========================================================================

-- Verificar si ya existe inspection_fee_payment_intent_id (columna existente)
DO $$
BEGIN
  -- Si existe inspection_fee_payment_intent_id, usaremos esa columna
  -- Si no existe, crearemos payment_intent_id como alias
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'inspection_fee_payment_intent_id'
  ) THEN
    -- Crear payment_intent_id si no existe inspection_fee_payment_intent_id
    ALTER TABLE public.leads
      ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
  END IF;
END $$;

-- payment_method_id: ID del método de pago de Stripe (pm_xxxx) usado para autorizar la visita
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS payment_method_id TEXT;

-- inspection_fee_payment_method_id: Alias para payment_method_id (si se prefiere nombre más descriptivo)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS inspection_fee_payment_method_id TEXT;

-- payment_status: Estado del pago (pending, authorized, captured, failed, cancelled)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- inspection_fee_status: Alias para payment_status (si se prefiere nombre más descriptivo)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS inspection_fee_status TEXT DEFAULT 'pending';

-- 2. AGREGAR COMENTARIOS PARA DOCUMENTACIÓN
-- =========================================================================

COMMENT ON COLUMN public.leads.payment_method_id IS 
  'ID del método de pago de Stripe (pm_xxxx) usado para autorizar la visita técnica de $350 MXN';

COMMENT ON COLUMN public.leads.inspection_fee_payment_method_id IS 
  'ID del método de pago de Stripe (pm_xxxx) usado para autorizar la tarifa de inspección de $350 MXN (alias de payment_method_id)';

-- Comentario para payment_intent_id (si se creó)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'payment_intent_id'
  ) THEN
    EXECUTE 'COMMENT ON COLUMN public.leads.payment_intent_id IS ''ID del Payment Intent de Stripe (pi_xxxx) que retiene los $350 MXN. Se captura cuando el cliente acepta el estimado final.''';
  END IF;
END $$;

-- Comentario para inspection_fee_payment_intent_id (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'inspection_fee_payment_intent_id'
  ) THEN
    EXECUTE 'COMMENT ON COLUMN public.leads.inspection_fee_payment_intent_id IS ''ID del Payment Intent de Stripe (pi_xxxx) que retiene la tarifa de inspección de $350 MXN. Se captura cuando el cliente acepta el estimado final.''';
  END IF;
END $$;

COMMENT ON COLUMN public.leads.payment_status IS 
  'Estado del pago: pending (pendiente), authorized (retención exitosa), captured (cobrado), failed (falló), cancelled (cancelado)';

COMMENT ON COLUMN public.leads.inspection_fee_status IS 
  'Estado de la tarifa de inspección: pending (pendiente), authorized (retención exitosa), captured (cobrado), failed (falló), cancelled (cancelado)';

-- 3. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =========================================================================

-- Índice para búsquedas por estado de pago
CREATE INDEX IF NOT EXISTS idx_leads_payment_status 
  ON public.leads(payment_status) 
  WHERE payment_status IS NOT NULL;

-- Índice para búsquedas por inspection_fee_status
CREATE INDEX IF NOT EXISTS idx_leads_inspection_fee_status 
  ON public.leads(inspection_fee_status) 
  WHERE inspection_fee_status IS NOT NULL;

-- Índice para búsquedas por payment_intent_id (si la columna existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'payment_intent_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_leads_payment_intent_id 
      ON public.leads(payment_intent_id) 
      WHERE payment_intent_id IS NOT NULL;
  END IF;
END $$;

-- Nota: El índice idx_leads_payment_intent_id para inspection_fee_payment_intent_id
-- ya existe según la información proporcionada, no es necesario crearlo de nuevo

-- 4. VERIFICACIÓN
-- =========================================================================

-- Verificar que las columnas se agregaron correctamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name IN (
      'payment_method_id', 
      'payment_intent_id', 
      'payment_status',
      'inspection_fee_payment_method_id',
      'inspection_fee_payment_intent_id',
      'inspection_fee_status'
    )
ORDER BY column_name;

-- Verificar que los índices se crearon
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'leads'
    AND indexname IN (
      'idx_leads_payment_status', 
      'idx_leads_payment_intent_id',
      'idx_leads_inspection_fee_status'
    );

