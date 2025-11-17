# 📚 Guía Paso a Paso Detallada - Sistema de Notificaciones

## 🎯 Objetivo
Configurar el sistema de notificaciones en tiempo real + email para profesionales cuando se crea un nuevo lead.

---

## 📋 PASO 1: Obtener API Key de Resend

### 1.1 Crear cuenta en Resend
1. Abre tu navegador
2. Ve a: **https://resend.com**
3. Haz clic en **"Sign Up"** o **"Get Started"**
4. Crea tu cuenta (puedes usar Google, GitHub o email)
5. Confirma tu email si es necesario

### 1.2 Crear API Key
1. Una vez dentro del dashboard de Resend
2. En el menú lateral, haz clic en **"API Keys"**
3. Haz clic en el botón **"Create API Key"**
4. Dale un nombre (ejemplo: "SumeeApp Notifications")
5. Selecciona los permisos: **"Sending access"**
6. Haz clic en **"Add"**
7. **⚠️ IMPORTANTE:** Copia la API Key inmediatamente (empieza con `re_...`)
   - Se muestra solo una vez
   - Si la pierdes, tendrás que crear una nueva

### 1.3 Guardar la API Key
- **Copia la key completa** (ejemplo: `re_1234567890abcdefghijklmnop`)
- Guárdala en un lugar seguro temporalmente (notas, documento de texto)

---

## 📝 PASO 2: Agregar RESEND_API_KEY a .env.local

### 2.1 Abrir archivo .env.local
1. Abre tu proyecto en el editor (VS Code, Cursor, etc.)
2. En la raíz del proyecto, busca el archivo `.env.local`
3. Si no existe, créalo

### 2.2 Agregar la variable
1. Abre el archivo `.env.local`
2. Ve al final del archivo
3. Agrega estas líneas:

```env
# Variables de entorno para Resend (Notificaciones por Email)
RESEND_API_KEY=re_tu_api_key_aqui
```

4. **Reemplaza** `re_tu_api_key_aqui` con la API Key que copiaste en el Paso 1.2
5. **Ejemplo real:**
```env
RESEND_API_KEY=re_1234567890abcdefghijklmnop
```

### 2.3 Guardar el archivo
1. Guarda el archivo (Ctrl+S o Cmd+S)
2. **⚠️ IMPORTANTE:** Este archivo NO debe subirse a Git (debe estar en `.gitignore`)

---

## 🔍 PASO 3: Extraer valores de Supabase

### 3.1 Abrir Supabase Dashboard
1. Ve a: **https://supabase.com/dashboard**
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto

### 3.2 Obtener PROJECT_REF
1. En el menú lateral, haz clic en **"Settings"** (⚙️)
2. Haz clic en **"API"**
3. Busca la sección **"Project URL"**
4. Verás algo como: `https://abcdefghijklmnop.supabase.co`
5. **Copia solo la parte del medio:** `abcdefghijklmnop`
   - Esto es tu **PROJECT_REF**
   - Guárdalo en un lugar seguro

### 3.3 Obtener Service Role Key
1. En la misma página de **Settings > API**
2. Busca la sección **"Project API keys"**
3. Busca la key que dice **"service_role"** (⚠️ secreta)
4. Haz clic en el ícono de **ojo** para revelarla
5. Haz clic en **"Copy"** para copiarla
6. **⚠️ IMPORTANTE:** Esta key es muy sensible, no la compartas
7. Guárdala en un lugar seguro temporalmente

---

## 🔧 PASO 4: Configurar RESEND_API_KEY en Supabase Edge Functions

### 4.1 Ir a Edge Functions
1. En Supabase Dashboard, en el menú lateral
2. Haz clic en **"Edge Functions"** (⚡)

### 4.2 Agregar Secret
1. Haz clic en la pestaña **"Secrets"** (o busca el botón "Manage secrets")
2. Haz clic en **"Add new secret"** o **"New secret"**
3. En el campo **"Name"**, escribe exactamente: `RESEND_API_KEY`
4. En el campo **"Value"**, pega tu API Key de Resend (la que copiaste en Paso 1.2)
5. Haz clic en **"Save"** o **"Add"**
6. Verifica que aparezca en la lista de secrets

---

## 💻 PASO 5: Ejecutar Script SQL en Supabase

### 5.1 Abrir SQL Editor
1. En Supabase Dashboard, en el menú lateral
2. Haz clic en **"SQL Editor"** (📝)

### 5.2 Preparar el script
1. Abre el archivo `SCRIPT_SQL_PERSONALIZADO.sql` en tu editor
2. Busca estas dos líneas (alrededor de la línea 25-29):

```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://TU_PROJECT_REF_AQUI.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'TU_SERVICE_ROLE_KEY_AQUI';
```

3. **Reemplaza:**
   - `TU_PROJECT_REF_AQUI` → Con tu PROJECT_REF del Paso 3.2
   - `TU_SERVICE_ROLE_KEY_AQUI` → Con tu Service Role Key del Paso 3.3

### 5.3 Ejemplo de cómo debe quedar:
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://abcdefghijklmnop.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890';
```

### 5.4 Ejecutar el script
1. Copia **TODO** el contenido del archivo `SCRIPT_SQL_PERSONALIZADO.sql` (ya con tus valores reemplazados)
2. En Supabase SQL Editor, haz clic en **"New query"**
3. Pega el script completo
4. Haz clic en **"Run"** (o presiona Ctrl+Enter)
5. Espera a que termine la ejecución

### 5.5 Verificar que funcionó
1. Deberías ver mensajes de éxito en la consola
2. Ejecuta esta consulta para verificar:

```sql
-- Verificar configuración
SELECT 
  current_setting('app.settings.supabase_url', true) as supabase_url,
  CASE 
    WHEN current_setting('app.settings.supabase_service_key', true) IS NOT NULL 
    THEN '✅ Configurada' 
    ELSE '❌ No configurada' 
  END as service_key_status;
```

3. Deberías ver:
   - `supabase_url` con tu URL completa
   - `service_key_status` = "✅ Configurada"

---

## 🚀 PASO 6: Desplegar Edge Function notify-pros

### 6.1 Crear nueva Edge Function
1. En Supabase Dashboard, ve a **"Edge Functions"**
2. Haz clic en **"Create a new function"** o **"New function"**
3. En el campo **"Function name"**, escribe: `notify-pros`
4. Haz clic en **"Create function"**

### 6.2 Copiar código de la función
1. En tu editor, abre el archivo: `supabase/functions/notify-pros/index.ts`
2. Selecciona **TODO** el contenido (Ctrl+A o Cmd+A)
3. Copia (Ctrl+C o Cmd+C)

### 6.3 Pegar en Supabase
1. En el editor de Supabase Edge Functions
2. Borra cualquier código que esté ahí por defecto
3. Pega el código que copiaste (Ctrl+V o Cmd+V)

### 6.4 Desplegar
1. Haz clic en el botón **"Deploy"** o **"Save"**
2. Espera a que termine el despliegue
3. Deberías ver un mensaje de éxito

### 6.5 Verificar que RESEND_API_KEY está disponible
1. En la página de la función `notify-pros`
2. Ve a la pestaña **"Settings"** o **"Secrets"**
3. Verifica que `RESEND_API_KEY` aparezca en la lista de secrets disponibles
4. Si no aparece, vuelve al Paso 4 y verifica que lo agregaste correctamente

---

## ✅ PASO 7: Verificar instalación completa

### 7.1 Verificar Trigger
1. En Supabase SQL Editor, ejecuta:

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_pros_on_new_lead';
```

2. Deberías ver una fila con:
   - `trigger_name` = `trigger_notify_pros_on_new_lead`
   - `event_manipulation` = `INSERT`
   - `event_object_table` = `leads`

### 7.2 Verificar Función
1. Ejecuta:

```sql
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'notify_professionals_on_new_lead';
```

2. Deberías ver una fila con la función

### 7.3 Verificar Extensión pg_net
1. Ejecuta:

```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

2. Deberías ver una fila con la extensión

---

## 🧪 PASO 8: Probar el sistema

### 8.1 Crear lead de prueba desde la aplicación
1. Abre tu aplicación en el navegador
2. Inicia sesión como cliente
3. Crea un nuevo lead/solicitud de servicio
4. Completa el formulario y envía

### 8.2 Verificar logs del Trigger
1. En Supabase Dashboard, ve a **"Logs"** (en el menú lateral)
2. Haz clic en **"Postgres Logs"**
3. Busca mensajes que digan:
   - `Edge Function notify-pros llamada. Job ID: ...`
   - Si ves esto, el trigger está funcionando ✅

### 8.3 Verificar logs de Edge Function
1. En Supabase Dashboard, ve a **"Edge Functions"**
2. Haz clic en **"notify-pros"**
3. Ve a la pestaña **"Logs"**
4. Busca mensajes que digan:
   - `📧 notify-pros: Lead recibido: ...`
   - `✅ Email enviado a ...`
   - Si ves estos mensajes, la función está funcionando ✅

### 8.4 Verificar email recibido
1. Revisa el email de los profesionales en tu base de datos
2. Deberían haber recibido un email con el asunto:
   - `¡NUEVO LEAD DE [DISCIPLINA] Cerca de ti!`
3. Si no recibes el email:
   - Revisa la carpeta de spam
   - Verifica que el email del profesional sea válido
   - Revisa los logs de la Edge Function para errores

---

## 🐛 PASO 9: Solución de problemas comunes

### Problema: "Extension pg_net does not exist"
**Solución:**
1. Ve a Supabase SQL Editor
2. Ejecuta: `CREATE EXTENSION IF NOT EXISTS pg_net;`
3. Vuelve a ejecutar el script completo

### Problema: "Supabase URL no configurada"
**Solución:**
1. Verifica que ejecutaste el PASO 5 correctamente
2. Verifica que reemplazaste `TU_PROJECT_REF_AQUI` con tu PROJECT_REF real
3. Ejecuta de nuevo la línea:
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://TU_PROJECT_REF.supabase.co';
```

### Problema: "Service Key no configurada"
**Solución:**
1. Verifica que copiaste el Service Role Key completo
2. Verifica que no tiene espacios extra al inicio o final
3. Ejecuta de nuevo la línea:
```sql
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'TU_SERVICE_ROLE_KEY';
```

### Problema: "RESEND_API_KEY not found"
**Solución:**
1. Ve a Supabase Dashboard > Edge Functions > Secrets
2. Verifica que existe un secret llamado exactamente `RESEND_API_KEY`
3. Verifica que el valor es correcto (empieza con `re_`)
4. Si no existe, vuelve al Paso 4 y créalo

### Problema: No se envían emails
**Solución:**
1. Verifica que hay profesionales en la base de datos con:
   - `role = 'profesional'`
   - `email IS NOT NULL`
   - `email` válido
2. Verifica que la disciplina del lead coincide con la profesión del profesional
3. Revisa los logs de la Edge Function para ver errores específicos
4. Verifica que tu dominio esté verificado en Resend (opcional pero recomendado)

### Problema: Trigger no se activa
**Solución:**
1. Verifica que el lead se crea con `estado = 'nuevo'` o `estado IS NULL`
2. Ejecuta la consulta del Paso 7.1 para verificar que el trigger existe
3. Revisa los Postgres Logs para ver si hay errores

---

## 📊 Checklist Final

Marca cada paso cuando lo completes:

- [ ] ✅ Paso 1: Creé cuenta en Resend y obtuve API Key
- [ ] ✅ Paso 2: Agregué `RESEND_API_KEY` a `.env.local`
- [ ] ✅ Paso 3: Extraje PROJECT_REF y Service Role Key de Supabase
- [ ] ✅ Paso 4: Configuré `RESEND_API_KEY` en Supabase Edge Functions Secrets
- [ ] ✅ Paso 5: Ejecuté el script SQL con mis valores reales
- [ ] ✅ Paso 6: Desplegué la Edge Function `notify-pros`
- [ ] ✅ Paso 7: Verifiqué que trigger, función y extensión existen
- [ ] ✅ Paso 8: Probé creando un lead y verifiqué los logs
- [ ] ✅ Paso 9: Los profesionales recibieron el email correctamente

---

## 🎉 ¡Listo!

Si completaste todos los pasos y el checklist, tu sistema de notificaciones está funcionando. 

**Próximos pasos opcionales:**
- Verificar dominio en Resend para emails más confiables
- Configurar templates de email personalizados
- Agregar analytics para trackear apertura de emails

---

## 📞 ¿Necesitas ayuda?

Si tienes algún problema en algún paso:
1. Revisa la sección "Solución de problemas" (Paso 9)
2. Revisa los logs en Supabase Dashboard
3. Verifica que todos los valores estén correctos
4. Asegúrate de haber completado todos los pasos anteriores

