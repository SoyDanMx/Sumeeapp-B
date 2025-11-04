# 🐛 Solución: Bug de Permisos al Crear Solicitudes Gratuitas

## 🔴 Problema Identificado

**Error:** `No tienes permisos para crear solicitudes. Por favor, verifica tu sesión o contacta a soporte.`

**Ubicación:** Dashboard del Cliente → Solicitar Servicio → Paso 4 → Plan Gratuito

**Causa Raíz:**
Las políticas RLS (Row Level Security) de la tabla `leads` están bloqueando la inserción de leads por usuarios autenticados. Esto puede deberse a:

1. Políticas RLS demasiado restrictivas que requieren condiciones específicas
2. Conflicto entre múltiples políticas de INSERT
3. Falta de política específica para usuarios autenticados con membresía "free"

---

## ✅ Solución Paso a Paso

### Paso 1: Ejecutar Script SQL en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido completo de: `src/lib/supabase/fix-leads-rls-for-authenticated-users.sql`
3. Haz clic en **"Run"** o presiona `Ctrl+Enter`
4. Verifica que veas mensajes de éxito:
   - ✅ Políticas eliminadas (si existían)
   - ✅ Políticas creadas exitosamente
   - ✅ RLS Habilitado ✅

### Paso 2: Verificar que las Políticas Fueron Creadas

Ejecuta esta consulta para verificar:

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

**Resultado esperado:**

- `Authenticated users can create leads` (rol: authenticated)
- `Anonymous users can create leads` (rol: anon)

### Paso 3: Probar la Funcionalidad

1. Inicia sesión como cliente en la aplicación
2. Ve al Dashboard del Cliente (`/dashboard/client`)
3. Haz clic en "Solicitar mi Primer Servicio" o "Solicitar Servicio"
4. Completa los pasos 1-3 del formulario
5. En el paso 4, haz clic en "Publicar mi Solicitud Gratis"
6. ✅ **Esperado:** La solicitud se crea exitosamente sin errores

---

## 🔍 Diagnóstico Adicional

### Si el error persiste después de ejecutar el script:

**Verificación 1: Estado de RLS**

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

**Verificación 2: Todas las políticas de leads**

```sql
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY cmd, policyname;
```

**Verificación 3: Usuario autenticado**
En el código frontend, verifica en la consola del navegador:

```javascript
console.log("Usuario:", user?.id);
console.log("Autenticado:", isAuthenticated);
console.log("Cliente ID:", user?.id);
```

---

## 📝 Cambios Realizados en el Código

### Script SQL Creado:

- `src/lib/supabase/fix-leads-rls-for-authenticated-users.sql`
  - Elimina todas las políticas de INSERT existentes
  - Crea política específica para usuarios autenticados
  - Crea política específica para usuarios anónimos
  - Incluye verificaciones y diagnósticos

---

## 🎯 Políticas RLS Implementadas

### Para Usuarios Autenticados:

```sql
CREATE POLICY "Authenticated users can create leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  cliente_id = auth.uid() OR cliente_id IS NULL
);
```

**Explicación:**

- Permite a usuarios autenticados crear leads
- Verifica que `cliente_id` coincida con el usuario autenticado
- También permite `cliente_id IS NULL` para casos especiales

### Para Usuarios Anónimos:

```sql
CREATE POLICY "Anonymous users can create leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (cliente_id IS NULL);
```

**Explicación:**

- Permite a usuarios anónimos crear leads
- Solo permite `cliente_id IS NULL` (usuarios anónimos no tienen ID)

---

## ⚠️ Notas Importantes

1. **Seguridad:** Estas políticas solo afectan INSERT, no SELECT/UPDATE/DELETE
2. **Membresías:** Las políticas no distinguen entre membresías (free, basic, premium)
3. **Límites:** Los límites de solicitudes mensuales se manejan en el código frontend, no en RLS
4. **Verificación:** El script incluye verificaciones automáticas para confirmar que todo está correcto

---

## 🆘 Contacto y Soporte

Si el problema persiste después de seguir estos pasos:

1. Verifica los logs de Supabase (Dashboard → Logs → Postgres Logs)
2. Revisa la consola del navegador para errores detallados
3. Verifica que el usuario esté correctamente autenticado
4. Contacta al equipo de desarrollo con:
   - Screenshot del error
   - Logs de la consola del navegador
   - Resultado de las verificaciones SQL

---

_Última actualización: 2025-11-04_
