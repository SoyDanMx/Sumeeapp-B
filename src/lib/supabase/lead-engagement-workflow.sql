-- ============================================================
-- Lead Engagement Workflow Enhancements
-- ============================================================
-- Agrega columnas para seguimiento de contacto/cita/trabajo,
-- crea tabla de eventos y define RPCs para actualizar el flujo.
-- Ejecutar este script en el editor SQL de Supabase.
-- ============================================================

-- 1. Nuevas columnas en public.leads --------------------------------------
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS contact_deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_method text,
  ADD COLUMN IF NOT EXISTS contact_notes text,
  ADD COLUMN IF NOT EXISTS appointment_at timestamptz,
  ADD COLUMN IF NOT EXISTS appointment_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS appointment_status text DEFAULT 'pendiente'::text,
  ADD COLUMN IF NOT EXISTS appointment_notes text,
  ADD COLUMN IF NOT EXISTS work_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS work_completion_notes text,
  ADD COLUMN IF NOT EXISTS engagement_points integer DEFAULT 0;

-- 2. Tabla de eventos ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id uuid,
  actor_role text,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_events'
      AND policyname = 'lead_events_select_own'
  ) THEN
    CREATE POLICY lead_events_select_own
      ON public.lead_events
      FOR SELECT
      USING (
        auth.uid() IS NOT NULL AND (
          actor_id = auth.uid() OR
          EXISTS (
            SELECT 1
            FROM public.leads l
            WHERE l.id = lead_id
              AND (l.cliente_id = auth.uid() OR l.profesional_asignado_id = auth.uid())
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_events'
      AND policyname = 'lead_events_insert_authenticated'
  ) THEN
    CREATE POLICY lead_events_insert_authenticated
      ON public.lead_events
      FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 3. RPC: marcar lead como contactado -------------------------------------
CREATE OR REPLACE FUNCTION public.mark_lead_contacted(
  lead_uuid uuid,
  method text,
  notes text DEFAULT NULL
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
    RAISE EXCEPTION 'Debes iniciar sesión para marcar el contacto.';
  END IF;

  UPDATE public.leads
  SET
    contacted_at = COALESCE(contacted_at, NOW()),
    contact_method = method,
    contact_notes = notes,
    appointment_status = 'contactado',
    estado = 'contactado',
    fecha_actualizacion = NOW()
  WHERE id = lead_uuid
    AND profesional_asignado_id = current_professional
  RETURNING * INTO updated_lead;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado o no asignado a tu cuenta: %', lead_uuid;
  END IF;

  INSERT INTO public.lead_events (lead_id, actor_id, actor_role, event_type, payload)
  VALUES (
    lead_uuid,
    current_professional,
    'profesional',
    'contacted',
    jsonb_build_object('method', method, 'notes', notes)
  );

  RETURN updated_lead;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_lead_contacted(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_lead_contacted(uuid, text, text) TO authenticated;

-- 4. RPC: agendar cita ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.schedule_lead_appointment(
  lead_uuid uuid,
  appointment_ts timestamptz,
  notes text DEFAULT NULL
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
    RAISE EXCEPTION 'Debes iniciar sesión para agendar la cita.';
  END IF;

  IF appointment_ts IS NULL THEN
    RAISE EXCEPTION 'Debes proporcionar una fecha y hora de cita.';
  END IF;

  UPDATE public.leads
  SET
    appointment_at = appointment_ts,
    appointment_notes = notes,
    appointment_status = 'pendiente_confirmacion',
    estado = 'en_progreso',
    fecha_actualizacion = NOW()
  WHERE id = lead_uuid
    AND profesional_asignado_id = current_professional
  RETURNING * INTO updated_lead;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado o no asignado a tu cuenta: %', lead_uuid;
  END IF;

  INSERT INTO public.lead_events (lead_id, actor_id, actor_role, event_type, payload)
  VALUES (
    lead_uuid,
    current_professional,
    'profesional',
    'appointment_proposed',
    jsonb_build_object('appointment_at', appointment_ts, 'notes', notes)
  );

  RETURN updated_lead;
END;
$$;

REVOKE ALL ON FUNCTION public.schedule_lead_appointment(uuid, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.schedule_lead_appointment(uuid, timestamptz, text) TO authenticated;

-- 5. RPC: confirmar cita por el cliente ----------------------------------
CREATE OR REPLACE FUNCTION public.confirm_lead_appointment(
  lead_uuid uuid
)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user uuid;
  updated_lead public.leads%ROWTYPE;
BEGIN
  current_user := auth.uid();

  IF current_user IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para confirmar la cita.';
  END IF;

  UPDATE public.leads
  SET
    appointment_status = 'confirmada',
    appointment_confirmed_at = NOW(),
    estado = 'en_progreso',
    fecha_actualizacion = NOW()
  WHERE id = lead_uuid
    AND (cliente_id = current_user OR profesional_asignado_id = current_user)
  RETURNING * INTO updated_lead;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado o no autorizado para confirmar: %', lead_uuid;
  END IF;

  INSERT INTO public.lead_events (lead_id, actor_id, actor_role, event_type)
  VALUES (
    lead_uuid,
    current_user,
    CASE WHEN current_user = updated_lead.cliente_id THEN 'cliente' ELSE 'profesional' END,
    'appointment_confirmed'
  );

  RETURN updated_lead;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_lead_appointment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_lead_appointment(uuid) TO authenticated;

-- 6. RPC: registrar trabajo completado -----------------------------------
CREATE OR REPLACE FUNCTION public.complete_lead_work(
  lead_uuid uuid,
  notes text DEFAULT NULL
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
    RAISE EXCEPTION 'Debes iniciar sesión para completar el trabajo.';
  END IF;

  UPDATE public.leads
  SET
    estado = 'completado',
    work_completed_at = NOW(),
    work_completion_notes = notes,
    appointment_status = 'completado',
    engagement_points = engagement_points + 10,
    fecha_actualizacion = NOW()
  WHERE id = lead_uuid
    AND profesional_asignado_id = current_professional
  RETURNING * INTO updated_lead;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado o no asignado a tu cuenta: %', lead_uuid;
  END IF;

  INSERT INTO public.lead_events (lead_id, actor_id, actor_role, event_type, payload)
  VALUES (
    lead_uuid,
    current_professional,
    'profesional',
    'work_completed',
    jsonb_build_object('notes', notes)
  );

  RETURN updated_lead;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_lead_work(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_lead_work(uuid, text) TO authenticated;

-- ============================================================
-- 7. Tabla y RPC para reseñas de clientes ---------------------
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lead_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

ALTER TABLE public.lead_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_reviews'
      AND policyname = 'lead_reviews_select_participants'
  ) THEN
    CREATE POLICY lead_reviews_select_participants
      ON public.lead_reviews
      FOR SELECT
      USING (
        auth.uid() IS NOT NULL AND EXISTS (
          SELECT 1
          FROM public.leads l
          WHERE l.id = lead_id
            AND (l.cliente_id = auth.uid() OR l.profesional_asignado_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_reviews'
      AND policyname = 'lead_reviews_insert_client'
  ) THEN
    CREATE POLICY lead_reviews_insert_client
      ON public.lead_reviews
      FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL AND EXISTS (
          SELECT 1
          FROM public.leads l
          WHERE l.id = lead_id
            AND l.cliente_id = auth.uid()
            AND l.estado = 'completado'
            AND NOT EXISTS (
              SELECT 1 FROM public.lead_reviews r WHERE r.lead_id = l.id
            )
        )
      );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.create_lead_review(
  lead_uuid uuid,
  rating integer,
  comment text DEFAULT NULL
)
RETURNS public.lead_reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id uuid;
  inserted_review public.lead_reviews%ROWTYPE;
BEGIN
  actor_id := auth.uid();

  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para dejar una reseña.';
  END IF;

  IF rating < 1 OR rating > 5 THEN
    RAISE EXCEPTION 'La calificación debe estar entre 1 y 5.';
  END IF;

  INSERT INTO public.lead_reviews (lead_id, rating, comment, created_by)
  VALUES (lead_uuid, rating, comment, actor_id)
  RETURNING * INTO inserted_review;

  UPDATE public.leads
  SET engagement_points = engagement_points + 5
  WHERE id = lead_uuid;

  INSERT INTO public.lead_events (lead_id, actor_id, actor_role, event_type, payload)
  VALUES (
    lead_uuid,
    actor_id,
    'cliente',
    'review_submitted',
    jsonb_build_object('rating', rating)
  );

  RETURN inserted_review;
END;
$$;

REVOKE ALL ON FUNCTION public.create_lead_review(uuid, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_lead_review(uuid, integer, text) TO authenticated;

-- ============================================================
-- Fin del script
-- ============================================================
