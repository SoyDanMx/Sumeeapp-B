# 🚀 Instrucciones Rápidas: Ejecutar Script RLS para Solucionar Error de Permisos

## ⚡ Solución Rápida (2 opciones)

Si estás viendo el error **"No tienes permisos para crear solicitudes"** al intentar crear una solicitud gratuita, tienes **2 opciones**:

### 🎯 **Opción 1: Usar Función RPC (Recomendada - Más Robusta)**

Esta solución crea una función RPC con `SECURITY DEFINER` que bypassea las políticas RLS. Es la más robusta y recomendada.

### 🎯 **Opción 2: Arreglar Políticas RLS Directamente**

Esta solución ajusta las políticas RLS para permitir que usuarios autenticados creen leads.

---

## 📋 Opción 1: Función RPC (Recomendada)

### Paso 1: Abre Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **Sumee App**

### Paso 2: Abre el SQL Editor

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en el botón **"New query"** (si es necesario)

### Paso 3: Copia y Ejecuta el Script RPC

1. Abre el archivo: `src/lib/supabase/create-lead-rpc-function.sql`
2. **Copia TODO el contenido** del archivo
3. Pega el contenido en el editor SQL de Supabase
4. Haz clic en el botón **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
5. Verifica que veas mensajes de éxito

**✅ Listo!** El código ahora usará automáticamente esta función RPC, que evita problemas de RLS.

---

## 📋 Opción 2: Arreglar Políticas RLS (Alternativa)

Si prefieres no usar la función RPC, sigue estos pasos:

### Paso 1: Abre Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **Sumee App**

### Paso 2: Abre el SQL Editor

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en el botón **"New query"** (si es necesario)

### Paso 3: Copia y Pega el Script RLS

1. Abre el archivo: `src/lib/supabase/fix-leads-rls-simplified-v3.sql`
   - **Nota:** Este es el script más reciente (v3) que elimina TODAS las políticas antiguas y crea políticas robustas con comparación de texto para evitar problemas de tipo
2. **Copia TODO el contenido** del archivo (desde `-- =========================================================================` hasta el final)
3. Pega el contenido en el editor SQL de Supabase

### Paso 4: Ejecuta el Script

1. Haz clic en el botón **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
2. Espera a que termine la ejecución
3. Verifica que veas mensajes de éxito sin errores rojos

### Paso 5: Verifica que Funcionó

1. En el mismo SQL Editor, ejecuta esta consulta de verificación:

```sql
SELECT
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'leads'
  AND cmd = 'INSERT';
```

2. **Resultado esperado:** Debes ver 2 políticas:

   - `authenticated_users_can_create_leads_v3` (rol: authenticated)
   - `anonymous_users_can_create_leads_v3` (rol: anon)

   **IMPORTANTE:** La política `"Public users can create leads"` debe ser eliminada por este script. Si aún aparece después de ejecutar el script, ejecuta manualmente:

   ```sql
   DROP POLICY IF EXISTS "Public users can create leads" ON public.leads;
   ```

### Paso 6: Prueba en la App

1. Cierra sesión y vuelve a iniciar sesión en la app (para refrescar la sesión)
2. Intenta crear una solicitud gratuita nuevamente
3. ✅ **Debería funcionar sin errores**

---

## 🔍 Si el Error Persiste

### Verificación 1: Estado de RLS

Ejecuta esta consulta en SQL Editor:

```sql
SELECT
  tablename,
  CASE
    WHEN c.relrowsecurity THEN 'RLS Habilitado ✅'
    ELSE 'RLS Deshabilitado ❌'
  END as rls_status
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = pt.schemaname
WHERE pt.tablename = 'leads'
  AND pt.schemaname = 'public';
```

**Debe mostrar:** `RLS Habilitado ✅`

### Verificación 2: Revisar Consola del Navegador

1. Abre las **Herramientas de Desarrollador** (F12)
2. Ve a la pestaña **Console**
3. Intenta crear la solicitud de nuevo
4. Busca mensajes que empiecen con `🔍 handleFreeRequestSubmit`
5. Los logs ahora incluyen información detallada sobre:
   - Estado de la sesión de Supabase
   - Token de acceso
   - User ID y su tipo
   - Detalles completos del error (código, mensaje, hint)
6. Copia los mensajes de error y compártelos con soporte

**Nota:** Si ves un error RLS, los logs incluirán una sugerencia para ejecutar el script `fix-leads-rls-simplified-v3.sql`.

### Verificación 3: Usar Script de Verificación

Ejecuta el script de verificación para ver el estado completo de las políticas:

1. Abre el archivo: `src/lib/supabase/verificar-politicas-rls.sql`
2. Copia y pega el contenido en SQL Editor
3. Ejecuta el script
4. Verifica que todas las verificaciones muestren ✅

---

## 📞 Contacto

Si después de ejecutar el script el error persiste:

1. Verifica que ejecutaste **TODO el script** (no solo partes)
2. Verifica que no hubo errores en la ejecución del script
3. Revisa los logs de Supabase (Dashboard → Logs → Postgres Logs)
4. Contacta al equipo con:
   - Screenshot del error en la app
   - Resultado de las verificaciones SQL
   - Logs de la consola del navegador

---

_Última actualización: 2025-11-05_
