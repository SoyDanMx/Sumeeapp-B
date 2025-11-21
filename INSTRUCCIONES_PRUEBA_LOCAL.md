# Instrucciones para Probar la Aceptación de Leads en Localhost

## Estado Actual
✅ `SUPABASE_SERVICE_ROLE_KEY` está configurada en `.env.local`
✅ El código tiene fallback de 3 niveles implementado
✅ El servidor de desarrollo necesita reiniciarse para leer las variables

## Pasos para Probar

### 1. Reiniciar el Servidor de Desarrollo

```bash
# Detener el servidor actual (Ctrl+C en la terminal donde corre)
# Luego reiniciar:
npm run dev
```

### 2. Abrir el Dashboard Profesional

1. Abre `http://localhost:3000/professional-dashboard` en tu navegador
2. Inicia sesión como profesional
3. Asegúrate de tener al menos un lead disponible para aceptar

### 3. Intentar Aceptar un Lead

1. Haz clic en el botón "Aceptar Trabajo" en cualquier lead disponible
2. Observa la consola del navegador (F12 → Console)
3. **IMPORTANTE**: Observa los logs del servidor en la terminal donde corre `npm run dev`

### 4. Logs Esperados en el Servidor

Deberías ver logs como estos en la terminal del servidor:

#### Si el admin client está disponible:
```
🔍 createSupabaseAdminClient - Verificando variables:
- NEXT_PUBLIC_SUPABASE_URL: ✅ Definida
- SUPABASE_SERVICE_ROLE_KEY: ✅ Definida (eyJhbGci...)
🔍 [ACCEPT LEAD] Iniciando aceptación de lead: [lead-id]
✅ [ACCEPT LEAD] Usuario autenticado: [user-id] [email]
🔍 [ACCEPT LEAD] Verificando existencia del lead: [lead-id]
✅ [ACCEPT LEAD] Lead encontrado: { id: ..., estado: ..., profesional_asignado_id: ... }
🔄 [ACCEPT LEAD] Intentando aceptar lead con RPC...
✅ [ACCEPT LEAD] Lead aceptado exitosamente con RPC
```

#### Si el admin client NO está disponible (fallback):
```
🔍 createSupabaseAdminClient - Verificando variables:
- NEXT_PUBLIC_SUPABASE_URL: ✅ Definida
- SUPABASE_SERVICE_ROLE_KEY: ❌ Falta
⚠️ [ACCEPT LEAD] Admin client no disponible. Usando cliente autenticado con RPC/UPDATE.
🔍 [ACCEPT LEAD] Iniciando aceptación de lead: [lead-id]
✅ [ACCEPT LEAD] Usuario autenticado: [user-id] [email]
🔍 [ACCEPT LEAD] Verificando existencia del lead: [lead-id]
✅ [ACCEPT LEAD] Lead encontrado: { id: ..., estado: ..., profesional_asignado_id: ... }
🔄 [ACCEPT LEAD] Intentando aceptar lead con RPC...
✅ [ACCEPT LEAD] Lead aceptado exitosamente con RPC
```

### 5. Posibles Errores y Soluciones

#### Error: "Error de configuración del servidor"
- **Causa**: El servidor no está leyendo `SUPABASE_SERVICE_ROLE_KEY`
- **Solución**: Reinicia el servidor de desarrollo (`npm run dev`)

#### Error: "No encontramos la solicitud indicada"
- **Causa**: El lead no existe o las políticas RLS lo están bloqueando
- **Solución**: Verifica que el lead existe en Supabase y que el profesional tiene permisos

#### Error: "RPC falló"
- **Causa**: La función RPC `accept_lead` no existe o tiene problemas
- **Solución**: El código automáticamente intentará con UPDATE directo como fallback

### 6. Verificar que Funciona

Si todo funciona correctamente, deberías ver:
- ✅ El lead se acepta exitosamente
- ✅ El lead aparece en "En Progreso"
- ✅ Se muestra el banner de contacto con el deadline de 30 minutos
- ✅ Los botones de WhatsApp y ruta están disponibles

## Debugging Adicional

Si necesitas más información, los logs incluyen:
- `🔍` - Operaciones de verificación/búsqueda
- `✅` - Operaciones exitosas
- `⚠️` - Advertencias (fallbacks, etc.)
- `❌` - Errores

Todos los logs tienen el prefijo `[ACCEPT LEAD]` para facilitar el filtrado.

## Nota Importante

El código ahora tiene **3 niveles de fallback**:
1. **RPC** (no requiere admin client) - PRIMERA OPCIÓN
2. **UPDATE directo** con cliente autenticado - SEGUNDA OPCIÓN
3. **UPDATE con admin client** - TERCERA OPCIÓN (solo si está disponible)

Esto garantiza que funcione tanto en desarrollo local como en producción.

