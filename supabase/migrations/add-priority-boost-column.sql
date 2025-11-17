-- =========================================================================
-- MIGRACIÓN: Agregar columna priority_boost a tabla leads
-- =========================================================================
-- Esta columna permite marcar leads de usuarios PRO para prioridad en matching
-- =========================================================================

-- PASO 1: Agregar columna priority_boost si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'leads' 
      AND column_name = 'priority_boost'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN priority_boost BOOLEAN DEFAULT FALSE NOT NULL;
    
    RAISE NOTICE 'Columna priority_boost creada exitosamente.';
  ELSE
    RAISE NOTICE 'Columna priority_boost ya existe.';
  END IF;
END $$;

-- PASO 2: Crear índice para mejorar performance en consultas de matching
CREATE INDEX IF NOT EXISTS idx_leads_priority_boost ON public.leads(priority_boost) 
WHERE priority_boost = TRUE;

-- PASO 3: Agregar comentario descriptivo
COMMENT ON COLUMN public.leads.priority_boost IS 
'Indica si el lead tiene prioridad en el matching debido a que el cliente tiene plan PRO. 
Los leads con priority_boost = TRUE deben ser mostrados primero a los profesionales.';

-- PASO 4: Verificar que la columna fue creada
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name = 'priority_boost';

