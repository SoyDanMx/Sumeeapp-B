-- =========================================================================
-- POLÍTICAS RLS PARA TABLA MESSAGES (Chat System)
-- =========================================================================
-- Implementación de seguridad Row Level Security para la tabla de mensajes
-- Asegura que los usuarios solo puedan ver y enviar mensajes en sus propias
-- conversaciones (leads)
-- =========================================================================

-- PASO 1: Habilitar RLS en la tabla messages (si no está habilitado)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- POLÍTICAS PARA USUARIOS AUTENTICADOS
-- =========================================================================

-- POLÍTICA 1: Leer mensajes (SELECT)
-- Los usuarios pueden leer mensajes si son el cliente o el profesional del lead
DROP POLICY IF EXISTS "Users can view messages from their leads" ON public.messages;

CREATE POLICY "Users can view messages from their leads" ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            WHERE leads.id = messages.lead_id
            AND (
                leads.cliente_id = auth.uid() 
                OR leads.profesional_asignado_id = auth.uid()
            )
        )
    );

-- POLÍTICA 2: Crear mensajes (INSERT)
-- Los usuarios pueden crear mensajes si son parte del lead y el sender_id coincide con su auth.uid()
DROP POLICY IF EXISTS "Users can send messages in their leads" ON public.messages;

CREATE POLICY "Users can send messages in their leads" ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.leads
            WHERE leads.id = messages.lead_id
            AND (
                leads.cliente_id = auth.uid() 
                OR leads.profesional_asignado_id = auth.uid()
            )
        )
    );

-- POLÍTICA 3: Actualizar mensajes (UPDATE)
-- Los usuarios pueden actualizar solo sus propios mensajes (ej: marcar como leído)
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

-- POLÍTICA 4: Eliminar mensajes (DELETE)
-- Los usuarios pueden eliminar solo sus propios mensajes
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE
    USING (auth.uid() = sender_id);

-- =========================================================================
-- POLÍTICAS PARA FUNCIONES RPC (Si existen funciones RPC para mensajes)
-- =========================================================================

-- Política para permitir que las funciones RPC lean mensajes
DROP POLICY IF EXISTS "RPC functions can select messages" ON public.messages;

CREATE POLICY "RPC functions can select messages" ON public.messages
    FOR SELECT
    TO postgres
    USING (true);

-- Política para permitir que las funciones RPC inserten mensajes
DROP POLICY IF EXISTS "RPC functions can insert messages" ON public.messages;

CREATE POLICY "RPC functions can insert messages" ON public.messages
    FOR INSERT
    TO postgres
    WITH CHECK (true);

-- Política para permitir que las funciones RPC actualicen mensajes
DROP POLICY IF EXISTS "RPC functions can update messages" ON public.messages;

CREATE POLICY "RPC functions can update messages" ON public.messages
    FOR UPDATE
    TO postgres
    USING (true)
    WITH CHECK (true);

-- =========================================================================
-- VERIFICACIÓN DE POLÍTICAS
-- =========================================================================

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON POLICY "Users can view messages from their leads" ON public.messages 
    IS 'Permite a usuarios ver mensajes de leads donde participan como cliente o profesional';

COMMENT ON POLICY "Users can send messages in their leads" ON public.messages 
    IS 'Permite a usuarios enviar mensajes solo en leads donde participan';

COMMENT ON POLICY "Users can update their own messages" ON public.messages 
    IS 'Permite a usuarios actualizar solo sus propios mensajes';

COMMENT ON POLICY "Users can delete their own messages" ON public.messages 
    IS 'Permite a usuarios eliminar solo sus propios mensajes';

-- =========================================================================
-- TESTING DE SEGURIDAD
-- =========================================================================

-- TEST 1: Verificar que RLS está habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'messages' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS NO está habilitado en la tabla messages';
    ELSE
        RAISE NOTICE '✅ RLS está habilitado correctamente en messages';
    END IF;
END $$;

-- TEST 2: Contar políticas activas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'messages';
    
    IF policy_count < 4 THEN
        RAISE WARNING '⚠️ Solo % políticas encontradas. Se esperaban al menos 4.', policy_count;
    ELSE
        RAISE NOTICE '✅ % políticas activas en messages', policy_count;
    END IF;
END $$;

-- =========================================================================
-- NOTAS IMPORTANTES
-- =========================================================================
-- 1. RLS asegura que los usuarios solo vean mensajes de SUS leads
-- 2. No se pueden falsificar mensajes de otros usuarios (sender_id verificado)
-- 3. Las funciones RPC con SECURITY DEFINER tienen acceso completo
-- 4. Actualizar/Eliminar solo funciona para mensajes propios
-- 5. Las políticas RPC no interfieren con las políticas de usuario
-- =========================================================================

