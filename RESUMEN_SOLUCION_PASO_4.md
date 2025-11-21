# 🔧 SOLUCIÓN: Modal Congelado en Paso 4

## 🐛 PROBLEMA IDENTIFICADO

El modal se congela en el paso 4 (botón "Enviando...") porque:

1. **Operaciones sin timeout**: RPC y Edge Function pueden tardar indefinidamente
2. **`useAgreementSubscription` detecta la creación**: Puede estar llamando a `refreshLeads()` prematuramente
3. **No hay timeout de seguridad**: Si algo falla, se queda bloqueado

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. **Timeouts en todas las operaciones**

**Archivo:** `src/components/client/RequestServiceModal.tsx`

**Cambios:**
- ✅ Timeout global de 15 segundos para toda la operación
- ✅ Timeout de 8 segundos para RPC `create_lead`
- ✅ Timeout de 8 segundos para Edge Function `create-lead`
- ✅ Limpieza de timeout en todos los casos (éxito, error, return temprano)

### 2. **useAgreementSubscription - Ignorar INSERTs**

**Archivo:** `src/hooks/useAgreementSubscription.ts`

**Cambio:**
- ✅ Ahora ignora cuando se **crea** un lead (INSERT)
- ✅ Solo procesa cuando se **actualiza** un lead existente
- ✅ Esto evita que interfiera con la creación

### 3. **useAgreementSubscription - Deshabilitar durante carga**

**Archivo:** `src/app/dashboard/client/page.tsx`

**Cambio:**
- ✅ Solo se activa cuando `!loading` (dashboard completamente cargado)
- ✅ `refreshLeads()` ahora usa `setTimeout` para no bloquear

## 📊 FLUJO CORREGIDO

### Antes (se congela):
```
1. Usuario hace clic en "Enviar Solicitud"
2. RPC tarda mucho → Se queda en "Enviando..."
3. useAgreementSubscription detecta creación → refreshLeads()
4. Dashboard se congela esperando leads
5. ❌ Modal nunca se cierra
```

### Después (funciona):
```
1. Usuario hace clic en "Enviar Solicitud"
2. RPC con timeout de 8s → Si tarda, usa fallback
3. useAgreementSubscription ignora INSERT → No interfiere
4. Timeout global de 15s → Si todo falla, muestra error
5. ✅ Modal se cierra y redirige
```

## 🎯 RESULTADO ESPERADO

1. ✅ El modal **NO se congela** en el paso 4
2. ✅ Si hay timeout, muestra error y permite reintentar
3. ✅ `useAgreementSubscription` **NO interfiere** con la creación
4. ✅ La redirección funciona correctamente

## 📋 LOGS ESPERADOS

**Durante creación (éxito):**
```
🔍 handleFreeRequestSubmit - Iniciando solicitud gratuita
🔍 handleFreeRequestSubmit - Intentando crear lead via RPC...
✅ handleFreeRequestSubmit - Lead creado via RPC, ID: [id]
✅ handleFreeRequestSubmit - Lead creado exitosamente, cerrando modal...
🔍 handleFreeRequestSubmit - Redirigiendo a: /solicitudes/[id]
```

**Durante creación (timeout):**
```
🔍 handleFreeRequestSubmit - Iniciando solicitud gratuita
⏱️ handleFreeRequestSubmit - Timeout de 15 segundos alcanzado
❌ Error: La solicitud está tardando demasiado...
```

**useAgreementSubscription (normal):**
```
🔔 useAgreementSubscription: Suscribiéndose a cambios de acuerdo...
🔔 useAgreementSubscription: Estado de suscripción: SUBSCRIBED
🔕 useAgreementSubscription: Desuscribiéndose...
🔔 useAgreementSubscription: Estado de suscripción: CLOSED
```

## ✅ PRÓXIMOS PASOS

1. **Recarga** la página
2. **Intenta crear un lead** nuevamente
3. **Verifica** que el modal no se congela
4. **Confirma** que redirige correctamente

Si aún hay problemas, revisa los logs en la consola para identificar dónde se está bloqueando.



