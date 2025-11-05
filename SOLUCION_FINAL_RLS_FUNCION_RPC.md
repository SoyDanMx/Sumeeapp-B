# 🎯 Solución Final: Función RPC para Crear Leads

## 🔍 Problema

El error `new row violates row-level security policy for table "leads"` (código 42501) ocurre porque las políticas RLS están bloqueando la inserción de leads, incluso cuando las políticas parecen estar configuradas correctamente.

## ✅ Solución Implementada

Hemos implementado una **solución híbrida** que intenta usar primero una función RPC con `SECURITY DEFINER` (que bypassea RLS) y, si falla, hace fallback al INSERT directo.

### Ventajas de la Función RPC

1. **Bypassea RLS**: Usa `SECURITY DEFINER`, ejecutándose con permisos de superusuario
2. **Más robusta**: No depende de que las políticas RLS estén perfectamente configuradas
3. **Mantiene seguridad**: La función valida el `auth.uid()` internamente
4. **Funciona para usuarios anónimos y autenticados**

### Cómo Funciona

1. **Primer intento**: El código llama a `supabase.rpc("create_lead", {...})`
2. **Si la función existe y funciona**: El lead se crea exitosamente
3. **Si la función no existe o falla**: Hace fallback al INSERT directo con las políticas RLS

## 📋 Pasos para Implementar

### 1. Ejecutar Script SQL en Supabase

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo: `src/lib/supabase/create-lead-rpc-function.sql`
3. Copia **TODO** el contenido
4. Pega en el SQL Editor y ejecuta

### 2. Verificar que la Función Fue Creada

Ejecuta esta consulta en SQL Editor:

```sql
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';
```

**Resultado esperado:**

- `routine_name`: `create_lead`
- `routine_type`: `FUNCTION`
- `security_type`: `DEFINER`

### 3. Probar en la Aplicación

1. Cierra sesión y vuelve a iniciar sesión
2. Intenta crear una solicitud gratuita
3. Revisa la consola del navegador:
   - Si ves `✅ handleFreeRequestSubmit - Lead creado via RPC`, la función RPC está funcionando
   - Si ves `⚠️ handleFreeRequestSubmit - RPC falló`, entonces está usando el fallback de INSERT directo

## 🔧 Código Modificado

El código en `src/components/client/RequestServiceModal.tsx` ahora:

1. Intenta primero usar `supabase.rpc("create_lead", {...})`
2. Si falla, hace fallback al INSERT directo
3. Proporciona logs detallados para debugging

## 🐛 Troubleshooting

### Si el RPC falla:

1. **Verifica que la función existe**: Ejecuta el script SQL nuevamente
2. **Verifica permisos**: La función debe tener `GRANT EXECUTE ON FUNCTION public.create_lead TO anon, authenticated;`
3. **Revisa logs**: Los logs en la consola mostrarán el error específico

### Si el INSERT directo falla:

1. Ejecuta el script `fix-leads-rls-simplified-v3.sql` (Opción 2)
2. Verifica las políticas RLS con `verificar-politicas-rls.sql`

## 📝 Notas Técnicas

- La función RPC usa `SECURITY DEFINER`, lo que significa que se ejecuta con permisos de superusuario
- La función obtiene `auth.uid()` internamente, asegurando que el `cliente_id` coincida con el usuario autenticado
- Para usuarios anónimos, `cliente_id` será `NULL` (correcto según el diseño)

## ✅ Resultado Esperado

Después de ejecutar el script SQL:

- ✅ Usuarios autenticados pueden crear leads
- ✅ Usuarios anónimos pueden crear leads (sin `cliente_id`)
- ✅ La función RPC bypassea problemas de RLS
- ✅ El código tiene fallback automático si RPC no está disponible

---

_Última actualización: 2025-11-05_
