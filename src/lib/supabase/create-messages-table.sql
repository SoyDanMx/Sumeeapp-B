-- =========================================================================
-- TABLA DE MENSAJES PARA CHAT EN TIEMPO REAL
-- =========================================================================
-- Esta tabla almacena los mensajes entre clientes y profesionales
-- relacionados con un lead específico

-- Crear la tabla messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver mensajes donde son el remitente
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id);

-- Política: Los usuarios pueden ver mensajes de leads donde son el profesional asignado
-- Esto permite que el profesional vea todos los mensajes del chat de su lead asignado
CREATE POLICY "Professionals can view messages for their assigned leads"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = messages.lead_id
      AND leads.profesional_asignado_id = auth.uid()
    )
  );

-- Política: Los usuarios solo pueden insertar sus propios mensajes
CREATE POLICY "Users can insert their own messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Habilitar Realtime para la tabla messages
-- NOTA: Esta operación debe hacerse manualmente desde el Dashboard de Supabase:
-- 1. Ve a Database > Replication
-- 2. Busca la tabla "messages"
-- 3. Activa el toggle de Realtime para esa tabla

-- Comentarios para documentación
COMMENT ON TABLE public.messages IS 'Tabla para almacenar mensajes de chat entre clientes y profesionales por lead';
COMMENT ON COLUMN public.messages.lead_id IS 'ID del lead relacionado';
COMMENT ON COLUMN public.messages.sender_id IS 'ID del usuario que envía el mensaje';
COMMENT ON COLUMN public.messages.content IS 'Contenido del mensaje';
COMMENT ON COLUMN public.messages.created_at IS 'Fecha y hora de creación del mensaje';
