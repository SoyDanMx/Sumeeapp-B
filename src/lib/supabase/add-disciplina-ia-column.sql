-- =========================================================================
-- Migración: agregar columnas para resultados de IA en la tabla leads
-- =========================================================================

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS disciplina_ia TEXT;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS urgencia_ia INTEGER;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS diagnostico_ia TEXT;

COMMENT ON COLUMN public.leads.disciplina_ia IS 'Disciplina sugerida por IA (Gemini)';
COMMENT ON COLUMN public.leads.urgencia_ia IS 'Urgencia sugerida por IA (1-10)';
COMMENT ON COLUMN public.leads.diagnostico_ia IS 'Diagnóstico breve sugerido por IA';

