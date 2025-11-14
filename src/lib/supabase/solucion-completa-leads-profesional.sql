-- =========================================================================
-- SOLUCIÓN COMPLETA: Permitir que profesionales vean leads
-- =========================================================================
-- Este script:
-- 1. Verifica y crea la función RPC get_open_leads_for_professional
-- 2. Crea/actualiza las políticas RLS necesarias
-- 3. Verifica que todo esté correctamente configurado

-- =========================================================================
-- PASO 1: Crear/Actualizar la función RPC
-- =========================================================================
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

-- Otorgar permisos a la función RPC
REVOKE ALL ON FUNCTION public.get_open_leads_for_professional(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_open_leads_for_professional(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_open_leads_for_professional(uuid) TO anon;

-- =========================================================================
-- PASO 2: Crear/Actualizar Política RLS para Profesionales
-- =========================================================================
-- Eliminar políticas conflictivas existentes (si las hay)
DROP POLICY IF EXISTS "Professionals can view new leads" ON public.leads;
DROP POLICY IF EXISTS "Professionals can view available leads" ON public.leads;
DROP POLICY IF EXISTS "Professionals can view new and assigned leads" ON public.leads;

-- Crear política para que profesionales puedan ver leads nuevos y asignados
CREATE POLICY "Professionals can view new and assigned leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  -- Pueden ver leads nuevos (disponibles para aceptar)
  estado = 'nuevo' OR
  -- O leads que tienen asignados
  profesional_asignado_id = auth.uid()
);

-- =========================================================================
-- PASO 3: Asegurar que RLS está habilitado
-- =========================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- PASO 4: Verificar que todo está correcto
-- =========================================================================

-- Verificar que la función RPC existe
SELECT 
  'Función RPC' as "Componente",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public'
        AND routine_name = 'get_open_leads_for_professional'
    ) THEN '✅ Existe'
    ELSE '❌ NO existe'
  END as "Estado"
UNION ALL
-- Verificar que la política RLS existe
SELECT 
  'Política RLS' as "Componente",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND policyname = 'Professionals can view new and assigned leads'
    ) THEN '✅ Existe'
    ELSE '❌ NO existe'
  END as "Estado"
UNION ALL
-- Verificar que RLS está habilitado
SELECT 
  'RLS Habilitado' as "Componente",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = 'leads'
        AND rowsecurity = true
    ) THEN '✅ Habilitado'
    ELSE '❌ NO habilitado'
  END as "Estado";

-- =========================================================================
-- PASO 5: Mostrar todas las políticas de SELECT en la tabla leads
-- =========================================================================
SELECT 
  schemaname,
  tablename,
  policyname as "Nombre de Política",
  permissive,
  roles as "Roles",
  cmd as "Comando",
  qual as "Condición USING"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- =========================================================================
-- PASO 6: Mostrar información de la función RPC
-- =========================================================================
SELECT 
  routine_name as "Función",
  routine_type as "Tipo",
  pg_get_function_arguments(p.oid) as "Argumentos",
  pg_get_function_result(p.oid) as "Retorno"
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name = 'get_open_leads_for_professional';

-- =========================================================================
-- NOTAS IMPORTANTES:
-- =========================================================================
-- 1. La función RPC usa SECURITY DEFINER, lo que significa que se ejecuta
--    con privilegios elevados y puede leer leads incluso si las políticas
--    RLS están restringidas.
--
-- 2. La política RLS es un backup por si la función RPC falla o no está
--    disponible.
--
-- 3. Los profesionales pueden ver:
--    - Leads con estado 'nuevo' (disponibles para aceptar)
--    - Leads que tienen asignados (profesional_asignado_id = auth.uid())
--
-- 4. Los clientes pueden ver sus propios leads mediante la política:
--    "Users can view their own leads" (cliente_id = auth.uid())

