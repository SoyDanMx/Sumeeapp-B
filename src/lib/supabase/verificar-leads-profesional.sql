-- =========================================================================
-- SCRIPT PARA VERIFICAR QUE LOS PROFESIONALES PUEDEN VER LEADS
-- =========================================================================
-- Este script verifica:
-- 1. Las políticas RLS para la tabla leads
-- 2. Qué leads puede ver un profesional específico
-- 3. Si hay problemas de permisos

-- PASO 1: Verificar que RLS está habilitado en la tabla leads
SELECT 
  tablename,
  rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';

-- PASO 2: Ver TODAS las políticas de SELECT en la tabla leads
SELECT 
  schemaname,
  tablename,
  policyname as "Nombre de Política",
  permissive,
  roles as "Roles",
  cmd as "Comando",
  qual as "Condición USING",
  with_check as "Condición WITH CHECK"
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- PASO 3: Verificar políticas específicas para profesionales
-- Debería haber una política que permita a profesionales ver leads nuevos
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND cmd = 'SELECT'
        AND (
          qual LIKE '%profesional_asignado_id%' OR
          qual LIKE '%estado%' OR
          qual LIKE '%nuevo%'
        )
    ) THEN '✅ Existe política para profesionales'
    ELSE '❌ NO existe política específica para profesionales'
  END as "Estado Política Profesionales";

-- PASO 4: Verificar si hay una función RPC o vista para obtener leads
SELECT 
  routine_name as "Función/Vista",
  routine_type as "Tipo",
  routine_definition as "Definición"
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%lead%' OR
    routine_name LIKE '%professional%'
  )
ORDER BY routine_name;

-- PASO 5: Contar leads disponibles para profesionales
-- (Esto requiere ejecutarse como un profesional autenticado)
-- Para probar manualmente, ejecuta esto desde el dashboard del profesional:
-- SELECT COUNT(*) FROM leads WHERE estado = 'nuevo';

-- PASO 6: Ver estructura de la tabla leads (columnas importantes)
SELECT 
  column_name as "Columna",
  data_type as "Tipo",
  is_nullable as "Nullable",
  column_default as "Valor por Defecto"
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name IN (
    'id',
    'cliente_id',
    'profesional_asignado_id',
    'estado',
    'whatsapp',
    'ubicacion_lat',
    'ubicacion_lng',
    'servicio_solicitado',
    'descripcion_proyecto'
  )
ORDER BY ordinal_position;

-- PASO 7: Verificar índices en columnas importantes
SELECT 
  indexname as "Índice",
  indexdef as "Definición"
FROM pg_indexes
WHERE tablename = 'leads'
  AND schemaname = 'public'
ORDER BY indexname;

-- =========================================================================
-- RECOMENDACIONES:
-- =========================================================================
-- Si los profesionales NO pueden ver leads, verifica:
-- 1. Que exista una política RLS que permita SELECT para authenticated
-- 2. Que la política incluya leads con estado = 'nuevo' O profesional_asignado_id = auth.uid()
-- 3. Que el profesional esté autenticado correctamente
-- 4. Que la consulta use el cliente correcto de Supabase (con autenticación)

