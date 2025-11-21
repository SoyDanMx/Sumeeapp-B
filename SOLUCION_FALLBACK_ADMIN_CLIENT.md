# Solución con Fallback para Admin Client

## Problema Identificado
El error "Error de configuración del servidor. Contacta al soporte técnico." ocurría porque el código dependía completamente del `adminClient`, que requiere `SUPABASE_SERVICE_ROLE_KEY`. En desarrollo local, esta variable puede no estar configurada.

## Solución Implementada
Se agregó un **sistema de fallback robusto** que funciona tanto en desarrollo local como en producción:

### Flujo de Aceptación de Leads

1. **Intento 1: RPC `accept_lead`** (funciona con cliente autenticado)
   - Usa la función RPC de Supabase que tiene `SECURITY DEFINER`
   - No requiere admin client
   - Funciona con políticas RLS correctas

2. **Intento 2: UPDATE directo con cliente autenticado** (si RPC falla)
   - Usa el cliente autenticado del usuario
   - Intenta actualizar directamente el lead
   - Respeta las políticas RLS

3. **Intento 3: UPDATE con admin client** (solo si está disponible)
   - Se usa solo si `SUPABASE_SERVICE_ROLE_KEY` está configurada
   - Bypassa RLS completamente
   - Garantiza que la operación se complete

### Cambios Realizados

#### `src/app/api/leads/accept/route.ts`

**Antes:**
- Dependía completamente del admin client
- Fallaba si `SUPABASE_SERVICE_ROLE_KEY` no estaba configurada
- No tenía fallback

**Después:**
- Intenta primero con RPC (no requiere admin client)
- Si RPC falla, intenta con UPDATE directo usando cliente autenticado
- Solo usa admin client si está disponible y los otros métodos fallan
- Funciona en desarrollo local sin `SUPABASE_SERVICE_ROLE_KEY`

### Lógica de Estados

El código ahora determina inteligentemente qué estado usar:
- Si el lead está en estado `'nuevo'` o `'Nuevo'`, actualiza a `'asignado'` (compatible con RLS)
- Si el lead está en otro estado, actualiza a `'aceptado'`

Esto asegura compatibilidad con las políticas RLS que requieren estados específicos.

## Cómo Probar

### 1. En Desarrollo Local (sin SUPABASE_SERVICE_ROLE_KEY)

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre `http://localhost:3000/professional-dashboard`

3. Inicia sesión como profesional

4. Intenta aceptar un lead

5. Revisa los logs del servidor (terminal donde corre `npm run dev`):
   - Deberías ver: `⚠️ [ACCEPT LEAD] Admin client no disponible. Usando cliente autenticado con RPC/UPDATE.`
   - Si RPC funciona: `✅ [ACCEPT LEAD] Lead aceptado exitosamente con RPC`
   - Si RPC falla pero UPDATE funciona: `✅ [ACCEPT LEAD] Lead aceptado exitosamente`

### 2. En Producción (con SUPABASE_SERVICE_ROLE_KEY)

1. El código intentará primero con RPC
2. Si RPC falla, usará admin client (si está disponible)
3. Si admin client no está disponible, usará UPDATE directo

## Logs de Debugging

Todos los pasos están logueados con prefijos `[ACCEPT LEAD]`:

- `🔍 [ACCEPT LEAD]` - Verificaciones y búsquedas
- `✅ [ACCEPT LEAD]` - Operaciones exitosas
- `⚠️ [ACCEPT LEAD]` - Advertencias (fallbacks, etc.)
- `❌ [ACCEPT LEAD]` - Errores

## Beneficios

1. **Funciona en desarrollo local** sin necesidad de configurar `SUPABASE_SERVICE_ROLE_KEY`
2. **Funciona en producción** con o sin admin client
3. **Múltiples fallbacks** aseguran que la operación se complete si es posible
4. **Logging detallado** facilita el debugging
5. **Compatible con RLS** respeta las políticas cuando es posible

## Notas Importantes

- **SUPABASE_SERVICE_ROLE_KEY**: Aunque no es obligatoria para desarrollo local, es recomendable tenerla configurada en producción para garantizar operaciones administrativas.
- **Políticas RLS**: El código respeta las políticas RLS cuando usa el cliente autenticado, pero las bypassa cuando usa admin client.
- **Estados del Lead**: El código determina automáticamente qué estado usar según el estado actual del lead para cumplir con las políticas RLS.

## Fecha de Implementación
20 de noviembre de 2025

