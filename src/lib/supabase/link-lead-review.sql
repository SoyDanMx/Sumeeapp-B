-- Crear la tabla lead_reviews si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'lead_reviews'
  ) THEN
    CREATE TABLE public.lead_reviews (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
      rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment text,
      created_at timestamptz NOT NULL DEFAULT now(),
      created_by UUID NULL REFERENCES auth.users(id)
    );
  END IF;
END
$$;

-- Asegurar columna lead_id y FK
ALTER TABLE public.lead_reviews
  ADD COLUMN IF NOT EXISTS lead_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lead_reviews_lead_id_fkey'
  ) THEN
    ALTER TABLE public.lead_reviews
      ADD CONSTRAINT lead_reviews_lead_id_fkey
      FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Refrescar metadatos
NOTIFY pgrst, 'reload schema';
