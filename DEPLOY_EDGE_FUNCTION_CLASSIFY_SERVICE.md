# 🚀 Desplegar Edge Function classify-service

## ⚠️ Error Actual

Si ves el error:
```
FunctionsFetchError: Failed to send a request to the Edge Function
```

Significa que la Edge Function `classify-service` no está desplegada en Supabase.

---

## ✅ Solución Temporal (Fallback Implementado)

He implementado un **sistema de fallback** que permite que el asistente funcione incluso sin la Edge Function:

- ✅ Usa clasificación básica basada en palabras clave
- ✅ Detecta automáticamente cuando la función no está disponible
- ✅ Muestra un mensaje informativo al usuario

**El asistente funcionará, pero con capacidades limitadas sin la IA completa.**

---

## 🔧 Desplegar la Edge Function (Solución Completa)

### **Opción 1: Usando Supabase CLI (Recomendado)**

```bash
# 1. Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# 2. Login en Supabase
supabase login

# 3. Linkear tu proyecto
supabase link --project-ref tu-project-ref

# 4. Desplegar la función
supabase functions deploy classify-service
```

### **Opción 2: Usando Supabase Dashboard**

1. Ve a **Supabase Dashboard** > **Edge Functions**
2. Haz clic en **"Create a new function"**
3. Nombre: `classify-service`
4. Copia el contenido de `supabase/functions/classify-service/index.ts`
5. Pega en el editor
6. Haz clic en **"Deploy"**

### **Opción 3: Usando el Editor Web de Supabase**

1. Ve a **Supabase Dashboard** > **Edge Functions** > **classify-service**
2. Si ya existe, haz clic en **"Edit"**
3. Reemplaza el contenido con el código actualizado
4. Haz clic en **"Deploy"**

---

## 🔑 Configurar Variables de Entorno

Después de desplegar, configura la API Key de Gemini:

1. Ve a **Supabase Dashboard** > **Edge Functions** > **Settings** > **Secrets**
2. Agrega:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Tu API key de Google Gemini

---

## ✅ Verificar que Funciona

1. Abre el asistente en el dashboard del cliente
2. Escribe un mensaje de prueba: "Deseo instalar una lámpara"
3. Deberías ver una respuesta de la IA con clasificación completa

---

## 🐛 Troubleshooting

### **Error: "Function not found"**
- Verifica que el nombre de la función sea exactamente `classify-service`
- Verifica que esté desplegada en el proyecto correcto

### **Error: "GEMINI_API_KEY no está configurada"**
- Ve a Edge Functions > Settings > Secrets
- Agrega la variable `GEMINI_API_KEY`

### **Error: "Failed to send a request"**
- Verifica que la función esté desplegada
- Verifica la conexión a Supabase
- Revisa los logs de la Edge Function en el Dashboard

---

## 📝 Notas

- El fallback funciona sin la Edge Function, pero con capacidades limitadas
- Para usar la IA completa con visión, la Edge Function debe estar desplegada
- La función usa `gemini-1.5-pro` para visión y `gemini-pro` para solo texto

