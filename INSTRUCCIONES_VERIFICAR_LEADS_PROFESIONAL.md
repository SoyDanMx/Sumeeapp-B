# 🔍 Instrucciones para Verificar que los Profesionales Pueden Ver Leads

## 📋 Pasos para Verificar

### Paso 1: Verificar la Función RPC

Ejecuta este script en Supabase SQL Editor para verificar que la función existe:

```sql
-- Verificar que la función RPC existe
SELECT 
  routine_name as "Función",
  routine_type as "Tipo",
  pg_get_function_arguments(p.oid) as "Argumentos",
  pg_get_function_result(p.oid) as "Retorno"
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name = 'get_open_leads_for_professional';
```

**Resultado esperado:** Deberías ver la función con:
- Argumentos: `professional_id uuid`
- Retorno: `SETOF public.leads`
- Tipo: `FUNCTION`

### Paso 2: Verificar Políticas RLS

Ejecuta el script completo: `src/lib/supabase/verificar-leads-profesional.sql`

Este script verifica:
- ✅ Que RLS está habilitado
- ✅ Todas las políticas de SELECT en la tabla `leads`
- ✅ Si existe una política específica para profesionales
- ✅ La estructura de la tabla

### Paso 3: Corregir Políticas RLS (si es necesario)

Si los profesionales NO pueden ver leads, ejecuta:

```sql
src/lib/supabase/fix-professional-leads-rls.sql
```

Este script crea una política que permite a profesionales autenticados ver:
- Leads con estado `'nuevo'` (disponibles para aceptar)
- Leads que tienen asignados (`profesional_asignado_id = auth.uid()`)

### Paso 4: Verificar la Función RPC (Recrear si es necesario)

Si la función RPC no existe o tiene problemas, ejecuta:

```sql
src/lib/supabase/get-open-leads-for-professional.sql
```

Esta función usa `SECURITY DEFINER`, lo que significa que puede leer leads incluso si las políticas RLS están restringidas.

## 🔧 Solución Completa

Si después de verificar todo lo anterior los profesionales aún no pueden ver leads, ejecuta este script completo:

```sql
-- =========================================================================
-- SOLUCIÓN COMPLETA: Permitir que profesionales vean leads
-- =========================================================================

-- 1. Asegurar que la función RPC existe y está correcta
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

-- 2. Otorgar permisos
REVOKE ALL ON FUNCTION public.get_open_leads_for_professional(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_open_leads_for_professional(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_open_leads_for_professional(uuid) TO anon;

-- 3. Crear política RLS para profesionales (backup si la función RPC falla)
DROP POLICY IF EXISTS "Professionals can view new and assigned leads" ON public.leads;

CREATE POLICY "Professionals can view new and assigned leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  estado = 'nuevo' OR
  profesional_asignado_id = auth.uid()
);

-- 4. Verificar que todo está correcto
SELECT 
  'Función RPC' as "Componente",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'get_open_leads_for_professional'
    ) THEN '✅ Existe'
    ELSE '❌ NO existe'
  END as "Estado"
UNION ALL
SELECT 
  'Política RLS' as "Componente",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads' 
        AND policyname = 'Professionals can view new and assigned leads'
    ) THEN '✅ Existe'
    ELSE '❌ NO existe'
  END as "Estado";
```

## 🧪 Prueba Manual

Para probar manualmente desde el dashboard del profesional:

1. Abre la consola del navegador (F12)
2. Ejecuta esta consulta en la consola:

```javascript
const { data, error } = await supabase.rpc('get_open_leads_for_professional', {
  professional_id: 'TU_USER_ID_AQUI'
});
console.log('Leads:', data);
console.log('Error:', error);
```

3. Si hay un error, compártelo para diagnosticar el problema.

## ⚠️ Problemas Comunes

### Error: "function get_open_leads_for_professional does not exist"
**Solución:** Ejecuta `src/lib/supabase/get-open-leads-for-professional.sql`

### Error: "permission denied for table leads"
**Solución:** Ejecuta `src/lib/supabase/fix-professional-leads-rls.sql`

### Error: "No rows returned"
**Posibles causas:**
- No hay leads con estado `'nuevo'` en la base de datos
- El profesional no está autenticado correctamente
- Las políticas RLS están bloqueando el acceso

## 📝 Notas Importantes

1. La función RPC `get_open_leads_for_professional` usa `SECURITY DEFINER`, lo que significa que se ejecuta con privilegios elevados y puede leer leads incluso si las políticas RLS están restringidas.

2. La política RLS es un backup por si la función RPC falla o no está disponible.

3. Los profesionales pueden ver:
   - Leads con estado `'nuevo'` (disponibles para aceptar)
   - Leads que tienen asignados (`profesional_asignado_id = auth.uid()`)

4. Los clientes pueden ver sus propios leads mediante la política existente: `cliente_id = auth.uid()`

