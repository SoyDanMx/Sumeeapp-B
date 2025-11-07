-- =====================================================================
-- RPC: update_lead_details
-- Permite a los clientes actualizar sus propias solicitudes (leads)
-- cuando las políticas RLS estándar impiden el UPDATE directo.
-- Ejecuta este script en Supabase para crear la función.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_lead_details(
  lead_id uuid,
  servicio_solicitado_in text,
  descripcion_proyecto_in text,
  ubicacion_direccion_in text,
  photos_urls_in text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'update_lead_details: se requiere usuario autenticado';
  END IF;

  UPDATE public.leads
  SET
    servicio_solicitado = servicio_solicitado_in,
    descripcion_proyecto = descripcion_proyecto_in,
    ubicacion_direccion = ubicacion_direccion_in,
    photos_urls = photos_urls_in,
    updated_at = now()
  WHERE id = lead_id
    AND (cliente_id IS NULL OR cliente_id = current_user_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se pudo actualizar la solicitud. Verifica permisos o ID.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_lead_details(uuid, text, text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_lead_details(uuid, text, text, text, text[]) TO authenticated;

-- =====================================================================
-- Nota: Asegúrate de tener políticas SELECT adecuadas para lead_id/cliente_id.
-- =====================================================================
