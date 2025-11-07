-- =====================================================================
-- RPC: get_open_leads_for_professional
-- Devuelve todos los leads disponibles (sin profesional asignado) más
-- los leads ya asignados al profesional autenticado.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_open_leads_for_professional(
  professional_id uuid
)
RETURNS SETOF public.leads
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.leads
  WHERE profesional_asignado_id IS NULL
     OR profesional_asignado_id = professional_id
  ORDER BY fecha_creacion DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_open_leads_for_professional(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_open_leads_for_professional(uuid) TO authenticated;

-- =====================================================================
-- Nota: Verifica que las políticas RLS permitan el uso del RPC con
-- SECURITY DEFINER. La función se ejecuta con privilegios del owner.
-- =====================================================================
