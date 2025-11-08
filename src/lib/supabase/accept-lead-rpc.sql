-- =========================================================================
-- RPC: accept_lead
-- =========================================================================
-- Actualiza el estado de un lead a "aceptado" y asigna al profesional que
-- ejecuta la función (auth.uid()).
-- Esta función se ejecuta con SECURITY DEFINER para evitar problemas de RLS,
-- pero valida que exista un usuario autenticado.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.accept_lead(
  lead_uuid uuid
)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_professional uuid;
  updated_lead public.leads%ROWTYPE;
BEGIN
  current_professional := auth.uid();

  IF current_professional IS NULL THEN
    RAISE EXCEPTION 'No hay un usuario autenticado para aceptar el lead.';
  END IF;

  UPDATE public.leads
  SET
    estado = 'aceptado',
    profesional_asignado_id = current_professional,
    fecha_actualizacion = NOW()
  WHERE id = lead_uuid
  RETURNING * INTO updated_lead;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado para el ID: %', lead_uuid;
  END IF;

  RETURN updated_lead;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_lead(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_lead(uuid) TO authenticated;

-- =========================================================================
-- NOTA: Esta función asume que la columna fecha_actualizacion existe. Si no
-- existe, elimina la asignación correspondiente antes de ejecutar el script.
-- =========================================================================

