# 🔧 Solución: Error "Debes iniciar sesión para marcar el contacto"

## ❌ Problema

Al intentar marcar un lead como contactado desde el dashboard profesional, se produce el error:
```
Debes iniciar sesión para marcar el contacto.
```

El error ocurría en `src/lib/supabase/data.ts` línea 386, antes de que la función intentara hacer la llamada a la API.

## 🔍 Causa Raíz

La función `markLeadContacted` estaba verificando la sesión en el cliente de forma demasiado estricta y lanzando un error antes de intentar la llamada a la API. Esto causaba problemas cuando:

1. La sesión estaba expirada pero podía refrescarse en el servidor
2. La autenticación se manejaba correctamente en la API route pero el cliente la rechazaba prematuramente
3. Había problemas temporales con la obtención de la sesión en el cliente

## ✅ Solución

Se simplificó la función `markLeadContacted` para que sea similar a `acceptLead`:

### Cambios Realizados

1. **Eliminada verificación prematura de sesión**: Ya no se lanza un error si no se puede obtener la sesión en el cliente
2. **Delegación a la API**: Se permite que la API route maneje la autenticación, que tiene mejor lógica de fallback
3. **Manejo de errores mejorado**: Los errores de autenticación ahora vienen de la API con códigos de estado HTTP apropiados

### Código Anterior (Problemático)

```typescript
// Intentaba obtener sesión y lanzaba error si no la encontraba
if (!session) {
  throw new Error("Debes iniciar sesión para marcar el contacto...");
}
```

### Código Nuevo (Corregido)

```typescript
// Intenta obtener sesión pero no falla prematuramente
const { data: { session } } = await supabase.auth.getSession();

// Usa el token si está disponible, pero permite que la API maneje la autenticación
if (session?.access_token) {
  headers.Authorization = `Bearer ${session.access_token}`;
}

// La API route tiene mejor lógica de autenticación con fallbacks
```

## 📋 Archivos Modificados

- `src/lib/supabase/data.ts`: Función `markLeadContacted` simplificada

## 🧪 Verificación

Después del fix:

1. Intenta marcar un lead como contactado desde el dashboard profesional
2. Verifica que:
   - No se produce el error "Debes iniciar sesión para marcar el contacto"
   - El lead se marca correctamente como contactado
   - El estado se actualiza en la base de datos
   - Si hay problemas de autenticación, la API devuelve un error 401 apropiado

## 🔄 Flujo Mejorado

```
1. Cliente llama a markLeadContacted()
   ↓
2. Intenta obtener sesión (no falla si no la encuentra)
   ↓
3. Hace llamada a /api/leads/contact con token si está disponible
   ↓
4. API route maneja autenticación con múltiples fallbacks:
   - Cookies de sesión
   - Bearer token en header
   - Verificación de usuario
   ↓
5. Si autenticación exitosa, ejecuta RPC mark_lead_contacted
   ↓
6. Retorna lead actualizado o error apropiado
```

## 💡 Beneficios

- ✅ **Más robusto**: No falla prematuramente por problemas temporales de sesión
- ✅ **Mejor UX**: Los errores de autenticación son más claros y vienen de la API
- ✅ **Consistente**: Mismo patrón que `acceptLead` que ya funciona correctamente
- ✅ **Mantenible**: Código más simple y fácil de entender

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0*


