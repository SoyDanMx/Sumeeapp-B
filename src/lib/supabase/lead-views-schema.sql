-- Tabla para rastrear qué profesionales han visto cada lead
-- Esto permite mostrar en tiempo real "quién está viendo tu solicitud"

CREATE TABLE IF NOT EXISTS public.lead_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_lead_views_lead_id ON public.lead_views(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_views_profesional_id ON public.lead_views(profesional_id);
CREATE INDEX IF NOT EXISTS idx_lead_views_viewed_at ON public.lead_views(viewed_at);

-- RLS Policies
ALTER TABLE public.lead_views ENABLE ROW LEVEL SECURITY;

-- Los profesionales pueden ver sus propias vistas
CREATE POLICY "Profesionales pueden ver sus vistas"
ON public.lead_views
FOR SELECT
TO authenticated
USING (auth.uid() = profesional_id);

-- Los profesionales pueden crear vistas cuando ven un lead
CREATE POLICY "Profesionales pueden crear vistas"
ON public.lead_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profesional_id);

-- Los clientes pueden ver las vistas de sus leads
CREATE POLICY "Clientes pueden ver vistas de sus leads"
ON public.lead_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_views.lead_id 
    AND leads.cliente_id = auth.uid()
  )
);

-- Función para registrar una vista de lead
CREATE OR REPLACE FUNCTION public.record_lead_view(lead_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar o actualizar la vista
  INSERT INTO public.lead_views (lead_id, profesional_id, viewed_at)
  VALUES (lead_uuid, auth.uid(), NOW())
  ON CONFLICT (lead_id, profesional_id) 
  DO UPDATE SET viewed_at = NOW();
END;
$$;

-- Función para obtener profesionales que han visto un lead
CREATE OR REPLACE FUNCTION public.get_lead_viewers(lead_uuid UUID)
RETURNS TABLE (
  profesional_id UUID,
  full_name TEXT,
  profession TEXT,
  avatar_url TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.profession,
    p.avatar_url,
    lv.viewed_at
  FROM public.lead_views lv
  JOIN public.profiles p ON p.user_id = lv.profesional_id
  WHERE lv.lead_id = lead_uuid
  ORDER BY lv.viewed_at DESC;
END;
$$;
