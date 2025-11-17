# 📋 Instrucciones de Configuración - Notificaciones Realtime + Email

## 🔍 Paso 1: Extraer valores de tu .env.local

### 1.1 Extraer PROJECT_REF de Supabase

Tu `NEXT_PUBLIC_SUPABASE_URL` tiene este formato:
```
https://TU_PROJECT_REF.supabase.co
```

**Ejemplo:**
- Si tu URL es: `https://abcdefghijklmnop.supabase.co`
- Entonces tu PROJECT_REF es: `abcdefghijklmnop`

**Acción:** Copia solo la parte del PROJECT_REF (sin `https://` ni `.supabase.co`)

### 1.2 Obtener Service Role Key

Ya tienes `SUPABASE_SERVICE_ROLE_KEY` en tu `.env.local`. 
**Copia el valor completo** (empieza con `eyJhbGci...`)

---

## 📝 Paso 2: Agregar RESEND_API_KEY

### 2.1 Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Ve a **API Keys** en el dashboard
4. Crea una nueva API Key
5. Copia la key (empieza con `re_...`)

### 2.2 Agregar a .env.local

Abre tu archivo `.env.local` y agrega al final:

```env
# Variables de entorno para Resend (Notificaciones por Email)
RESEND_API_KEY=re_tu_api_key_aqui
```

**⚠️ IMPORTANTE:** Esta variable NO debe tener el prefijo `NEXT_PUBLIC_` porque solo se usa en el servidor (Edge Function).

---

## 🔧 Paso 3: Configurar en Supabase

### 3.1 Configurar RESEND_API_KEY en Edge Functions

1. Ve a **Supabase Dashboard**
2. Ve a **Settings** > **Edge Functions** > **Secrets**
3. Haz clic en **Add new secret**
4. Nombre: `RESEND_API_KEY`
5. Valor: Pega tu API key de Resend
6. Guarda

### 3.2 Ejecutar Script SQL

1. Ve a **Supabase Dashboard** > **SQL Editor**
2. Abre el archivo `SCRIPT_SQL_PERSONALIZADO.sql`
3. **Reemplaza estos valores:**
   - `TU_PROJECT_REF_AQUI` → Tu PROJECT_REF (ejemplo: `abcdefghijklmnop`)
   - `TU_SERVICE_ROLE_KEY_AQUI` → Tu `SUPABASE_SERVICE_ROLE_KEY` completo
4. Copia y pega todo el script en el SQL Editor
5. Haz clic en **Run**

### 3.3 Verificar instalación

Después de ejecutar el script, ejecuta esta consulta para verificar:

```sql
-- Verificar configuración
SELECT 
  current_setting('app.settings.supabase_url', true) as supabase_url,
  CASE 
    WHEN current_setting('app.settings.supabase_service_key', true) IS NOT NULL 
    THEN '✅ Configurada' 
    ELSE '❌ No configurada' 
  END as service_key_status;

-- Verificar trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_pros_on_new_lead';
```

Deberías ver:
- ✅ `supabase_url` con tu URL completa
- ✅ `service_key_status` = "✅ Configurada"
- ✅ El trigger listado

---

## 🚀 Paso 4: Desplegar Edge Function

### 4.1 Crear Edge Function en Supabase

1. Ve a **Supabase Dashboard** > **Edge Functions**
2. Haz clic en **Create a new function**
3. Nombre: `notify-pros`
4. Copia el contenido de `supabase/functions/notify-pros/index.ts`
5. Pega en el editor
6. Haz clic en **Deploy**

### 4.2 Verificar que RESEND_API_KEY está configurada

1. En **Edge Functions** > **notify-pros**
2. Ve a la pestaña **Settings**
3. Verifica que `RESEND_API_KEY` aparezca en **Secrets**

---

## ✅ Paso 5: Probar

### 5.1 Crear un lead de prueba

Desde tu aplicación, crea un lead nuevo. El trigger debería:
1. Activar automáticamente
2. Llamar a la Edge Function
3. Enviar emails a profesionales relevantes

### 5.2 Verificar logs

1. **Logs de Trigger:** Ve a **Supabase Dashboard** > **Logs** > **Postgres Logs**
   - Busca mensajes que digan: `Edge Function notify-pros llamada`

2. **Logs de Edge Function:** Ve a **Edge Functions** > **notify-pros** > **Logs**
   - Busca mensajes que digan: `📧 notify-pros: Lead recibido`
   - Busca mensajes que digan: `✅ Email enviado a...`

---

## 🐛 Troubleshooting

### ❌ Error: "Supabase URL no configurada"
**Solución:** Verifica que ejecutaste el PASO 2 del script SQL correctamente y que reemplazaste `TU_PROJECT_REF_AQUI`

### ❌ Error: "Service Key no configurada"
**Solución:** Verifica que ejecutaste el PASO 2 del script SQL y que copiaste el `SUPABASE_SERVICE_ROLE_KEY` completo

### ❌ Error: "Extension pg_net does not exist"
**Solución:** Ejecuta primero el PASO 1 del script SQL para habilitar la extensión

### ❌ Error: "RESEND_API_KEY not found"
**Solución:** 
1. Verifica que agregaste `RESEND_API_KEY` a `.env.local`
2. Verifica que configuraste el secret en Supabase Edge Functions
3. Verifica que el nombre del secret es exactamente `RESEND_API_KEY`

### ❌ No se envían emails
**Solución:**
1. Verifica que tu dominio esté verificado en Resend (opcional pero recomendado)
2. Revisa los logs de la Edge Function
3. Verifica que hay profesionales con emails válidos en la base de datos
4. Verifica que los profesionales tienen `role = 'profesional'` y `email IS NOT NULL`

---

## 📊 Resumen de Variables Necesarias

### En `.env.local` (ya las tienes):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### En `.env.local` (agregar):
- ⚠️ `RESEND_API_KEY=re_tu_api_key_aqui`

### En Supabase Database (configurar con SQL):
- ⚠️ `app.settings.supabase_url`
- ⚠️ `app.settings.supabase_service_key`

### En Supabase Edge Functions Secrets:
- ⚠️ `RESEND_API_KEY`

---

## ✅ Checklist Final

- [ ] Extraje el PROJECT_REF de mi `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Tengo mi `SUPABASE_SERVICE_ROLE_KEY` copiado
- [ ] Creé cuenta en Resend y obtuve API Key
- [ ] Agregué `RESEND_API_KEY` a `.env.local`
- [ ] Configuré `RESEND_API_KEY` en Supabase Edge Functions Secrets
- [ ] Ejecuté el script SQL con mis valores reales
- [ ] Verifiqué que el trigger se creó correctamente
- [ ] Desplegué la Edge Function `notify-pros`
- [ ] Probé creando un lead y verifiqué los logs

---

**🎉 ¡Listo! Tu sistema de notificaciones está configurado.**

