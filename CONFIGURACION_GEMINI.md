# 🔑 Configuración de Google Gemini API

## 📋 Pasos para Obtener tu API Key

### **Paso 1: Crear cuenta en Google AI Studio**

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Get API Key"** o **"Create API Key"**

### **Paso 2: Crear proyecto (si es necesario)**

- Si es tu primera vez, Google te pedirá crear un proyecto
- Elige un nombre para tu proyecto (ej: "SumeeApp-AI")
- Selecciona tu organización (si aplica)

### **Paso 3: Copiar API Key**

- Una vez creada, copia tu API key
- **IMPORTANTE**: Guárdala de forma segura, no la compartas públicamente

---

## 🔐 Configurar en tu Proyecto

### **1. Agregar a `.env.local`**

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
# Google Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_aqui
```

**Reemplaza** `tu_api_key_aqui` con tu API key real.

### **2. Verificar configuración**

El sistema funciona en **modo híbrido**:

- ✅ **Con API Key**: Usa Gemini para respuestas conversacionales
- ⚠️ **Sin API Key**: Usa fallback con respuestas estándar (sistema actual)

---

## 💰 Planes y Límites Gratuitos

### **Tier Gratuito (Hasta alcanzar límite)**

- **15 RPM** (Requests Per Minute)
- **1,500 RPD** (Requests Per Day)
- **Sin costo** hasta 60 requests/minuto promedio

### **Pricing Post-Gratuito**

- **$0.075 por 1M tokens de entrada**
- **$0.30 por 1M tokens de salida**

**Ejemplo de costo:**

- Consulta típica: ~500 tokens
- 1,000 consultas = 500,000 tokens = **$0.0375 USD**

---

## 🧪 Probar la Integración

### **1. Sin API Key (Modo Fallback)**

```bash
# El sistema usará respuestas estándar
npm run dev
```

### **2. Con API Key (Modo Gemini)**

```bash
# Agrega la variable de entorno
echo "GOOGLE_GENERATIVE_AI_API_KEY=tu_key" >> .env.local

# Reinicia el servidor
npm run dev
```

### **3. Verificar en Logs**

Busca estos mensajes en la consola:

- ✅ **"🤖 Respuesta de Gemini generada exitosamente"** → Gemini funcionando
- ⚠️ **"⚠️ Error en Gemini, usando respuesta estándar"** → Modo fallback activo

---

## 🔒 Seguridad

### **⚠️ NUNCA:**

- ❌ Subas tu `.env.local` a Git
- ❌ Compartas tu API key públicamente
- ❌ La expongas en el código frontend

### **✅ SÍ:**

- ✅ Mantén `.env.local` en `.gitignore`
- ✅ Usa variables de entorno en producción (Vercel, etc.)
- ✅ Rota tu API key si se compromete

---

## 🚀 Configuración en Vercel

### **Opción 1: Dashboard de Vercel**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Environment Variables
3. Agrega:
   - **Key**: `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value**: Tu API key
   - **Environments**: Production, Preview, Development
4. Haz clic en **Save**

### **Opción 2: CLI de Vercel**

```bash
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
# Pega tu API key cuando se solicite
```

---

## 🧪 Testing

### **Probar Endpoint**

```bash
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"query": "Mi boiler no prende"}'
```

**Respuesta esperada con Gemini:**

```json
{
  "service_category": "Plomería",
  "technical_info": {
    "description": "Entiendo tu problema con el boiler. Esto puede deberse a varias causas..."
  },
  "ai_suggested_questions": [
    "¿El boiler tiene corriente eléctrica?",
    "¿Cuánto tiempo lleva sin funcionar?",
    "¿Escuchas algún sonido cuando intentas encenderlo?"
  ]
}
```

---

## 📊 Monitoreo de Uso

### **Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Revisa el uso de tu API key

### **Métricas Recomendadas**

- Monitorea requests por día
- Revisa costos mensuales
- Configura alertas si superas el límite gratuito

---

## ❓ Troubleshooting

### **Error: "API key not valid"**

- ✅ Verifica que copiaste la key completa
- ✅ Asegúrate de que no hay espacios extra
- ✅ Verifica que la key está activa en Google AI Studio

### **Error: "Quota exceeded"**

- ⚠️ Has alcanzado el límite gratuito
- 💰 Considera actualizar a plan de pago
- 🔄 El sistema automáticamente usará fallback

### **Respuestas genéricas**

- ⚠️ Verifica que Gemini está activo en logs
- 🔍 Revisa que la API key está correcta
- 📝 Verifica formato de consulta en la API

---

## 🎯 Próximos Pasos

Una vez configurado Gemini:

1. ✅ Probar conversaciones naturales
2. ✅ Monitorear calidad de respuestas
3. ✅ Ajustar prompts en `gemini-agent.ts`
4. ✅ Implementar RAG para mejor contexto
5. ✅ Guardar feedback para mejorar

---

## 📚 Recursos

- [Gemini API Docs](https://ai.google.dev/docs)
- [Pricing Calculator](https://cloud.google.com/vertex-ai/pricing)
- [Best Practices](https://ai.google.dev/docs/prompt_intro)
