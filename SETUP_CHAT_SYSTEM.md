# 🚀 Configuración del Sistema de Chat en Tiempo Real

## ✅ Paso 1: Tabla `messages` creada

La tabla `messages` ya existe en tu base de datos con la estructura correcta.

## ✅ Paso 2: Habilitar Realtime en Supabase

### Instrucciones:

1. Ve a tu **Dashboard de Supabase**: https://supabase.com/dashboard
2. Selecciona tu proyecto: **Sumee App B**
3. Navega a: **Database** → **Replication** (en el menú lateral izquierdo)
4. Busca la tabla **`messages`** en la lista
5. **Activa el toggle** de Realtime para esa tabla

## 🧪 Paso 3: Probar el Sistema de Chat

### Escenario de Prueba:

1. **Crea un Lead de Prueba** (como cliente):

   - Ve a `/dashboard/client`
   - Haz clic en "Solicitar un Servicio"
   - Completa el formulario y crea una solicitud

2. **Asigna un Profesional al Lead** (desde el dashboard del profesional o directamente en Supabase):

   ```sql
   -- Actualizar el estado del lead a "aceptado" y asignar un profesional
   UPDATE public.leads
   SET estado = 'aceptado', profesional_asignado_id = '[UUID_DEL_PROFESIONAL]'
   WHERE id = '[UUID_DEL_LEAD]';
   ```

3. **Accede a la Página de Seguimiento**:

   - Navega a `/solicitudes/[leadId]` (reemplaza `[leadId]` con el ID real del lead)
   - Deberías ver el `StatusTracker` con el estado actual
   - El `ChatBox` debería aparecer en el lado derecho

4. **Prueba el Chat**:
   - Envía un mensaje desde el cliente
   - Abre la misma URL como profesional (desde otra sesión/ventana)
   - Los mensajes deberían aparecer en tiempo real sin recargar la página

## 📍 Rutas Importantes:

- **Dashboard del Cliente**: `/dashboard/client`
- **Página de Seguimiento de Solicitud**: `/solicitudes/[leadId]`
- **Dashboard del Profesional**: `/dashboard/pro` (o `/professional-dashboard`)

## 🔍 Verificación del Chat:

Si el chat no funciona, verifica:

1. **Realtime está habilitado**:

   ```sql
   -- Verificar que Realtime está habilitado para messages
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime'
   AND tablename = 'messages';
   ```

2. **Las políticas RLS permiten acceso**:

   ```sql
   -- Ver políticas de messages
   SELECT * FROM pg_policies WHERE tablename = 'messages';
   ```

3. **El usuario autenticado tiene permisos**:
   - El cliente debe poder ver mensajes donde `sender_id = auth.uid()`
   - El profesional asignado debe poder ver todos los mensajes del lead

## 🐛 Troubleshooting:

- **Los mensajes no aparecen en tiempo real**: Verifica que Realtime está habilitado para `messages`
- **Error de permisos**: Verifica las políticas RLS de la tabla `messages`
- **El chat no se muestra**: Verifica que el estado del lead es `'aceptado'`, `'en_camino'` o `'completado'`
