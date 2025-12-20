# 🔧 Solución Final: Error "Debes iniciar sesión para marcar el contacto"

## ❌ Problema

Aunque el usuario está logueado, al intentar marcar un lead como contactado aparece el error:
```
Debes iniciar sesión para marcar el contacto.
```

## 🔍 Causa Raíz

El problema tenía dos causas:

1. **RPC `mark_lead_contacted` usa `auth.uid()`**: El RPC verifica `auth.uid()` para obtener el usuario actual, pero cuando se llama desde el `adminClient`, `auth.uid()` es `NULL` porque el admin client no tiene un usuario autenticado.

2. **API route usaba solo admin client**: La API route estaba usando directamente el `adminClient` para llamar al RPC, lo que causaba que `auth.uid()` fuera `NULL` y el RPC lanzara el error.

## ✅ Solución Implementada

Se actualizó la API route `/api/leads/contact` para seguir el mismo patrón que `/api/leads/accept`:

### Estrategia de Fallback

1. **Primer intento: Cliente autenticado**
   - Usa `supabase` (cliente autenticado con sesión del usuario)
   - Llama al RPC `mark_lead_contacted`
   - El RPC puede acceder a `auth.uid()` correctamente
   - ✅ **Funciona cuando hay sesión válida**

2. **Fallback: Admin client con UPDATE directo**
   - Si el RPC falla, usa `adminClient`
   - Verifica que el lead esté asignado al usuario actual
   - Hace UPDATE directo en la tabla `leads`
   - Registra el evento en `lead_events` manualmente
   - ✅ **Funciona incluso si hay problemas con la sesión**

### Cambios Realizados

**Archivo:** `src/app/api/leads/contact/route.ts`

```typescript
// ANTES: Solo usaba admin client
const { data: lead, error } = await adminClient
  .rpc("mark_lead_contacted", {...})
  .maybeSingle();

// DESPUÉS: Intenta primero con cliente autenticado, luego fallback
try {
  const rpcResult = await supabase.rpc("mark_lead_contacted", {...});
  // Si funciona, usa el resultado
} catch {
  // Si falla, usa admin client con UPDATE directo
  const { data: updatedLead } = await adminClient
    .from("leads")
    .update({...})
    .eq("id", leadId)
    .select("*")
    .maybeSingle();
}
```

## 📋 Flujo Mejorado

```
1. Usuario hace clic en "Contactar WhatsApp"
   ↓
2. Cliente llama a markLeadContacted()
   ↓
3. Hace fetch a /api/leads/contact
   ↓
4. API route obtiene usuario autenticado
   ↓
5. Intenta RPC con cliente autenticado (supabase)
   ↓
6a. ✅ Si funciona: Retorna lead actualizado
   ↓
6b. ❌ Si falla: Usa admin client con UPDATE directo
   ↓
7. Verifica que lead esté asignado al usuario
   ↓
8. Actualiza lead directamente
   ↓
9. Registra evento en lead_events
   ↓
10. ✅ Retorna lead actualizado
```

## 🧪 Verificación

Después del fix:

1. ✅ Inicia sesión como profesional
2. ✅ Acepta un lead (debe aparecer en "En Progreso")
3. ✅ Haz clic en "Contactar WhatsApp"
4. ✅ Verifica que:
   - No aparece el error "Debes iniciar sesión para marcar el contacto"
   - El lead se marca correctamente como contactado
   - El estado cambia a "contactado"
   - El evento se registra en `lead_events`
   - El banner de "30 minutos para contactar" desaparece

## 💡 Beneficios

- ✅ **Más robusto**: Funciona incluso si hay problemas temporales con la sesión
- ✅ **Consistente**: Mismo patrón que `acceptLead` que ya funciona
- ✅ **Mejor UX**: No falla prematuramente, intenta múltiples estrategias
- ✅ **Trazabilidad**: Siempre registra el evento en `lead_events`

## 🔄 Comparación con acceptLead

Ambas funciones ahora siguen el mismo patrón:

| Función | RPC | Fallback |
|---------|-----|----------|
| `acceptLead` | `accept_lead` | UPDATE directo con admin client |
| `markLeadContacted` | `mark_lead_contacted` | UPDATE directo con admin client |

Esto asegura consistencia y robustez en todo el sistema.

---

*Documento creado el 17 de enero de 2025*
*Versión: 2.0 - Solución Final*


