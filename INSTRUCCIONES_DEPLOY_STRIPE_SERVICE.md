# 🚀 Instrucciones: Deploy de Edge Function `stripe-service`

## ✅ **PASO 1: Configurar Variable de Entorno en Supabase**

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Edge Functions** → **Secrets** (o **Settings** → **Edge Functions** → **Secrets`)
3. Haz clic en **Add new secret**
4. Agrega:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** Tu clave secreta de Stripe (ej: `sk_test_...` para testing o `sk_live_...` para producción)
5. Haz clic en **Save**

**⚠️ IMPORTANTE:** 
- Para desarrollo/testing: usa `sk_test_...`
- Para producción: usa `sk_live_...`
- Nunca compartas esta clave públicamente

---

## ✅ **PASO 2: Deploy de la Edge Function**

### **Opción A: Usando Supabase CLI (Recomendado)**

```bash
# Desde la raíz del proyecto
cd /Users/danielnuno/Documents/Projects/Sumeeapp-B

# Asegúrate de estar logueado en Supabase CLI
supabase login

# Link tu proyecto (si no está linkeado)
supabase link --project-ref [TU_PROJECT_REF]

# Deploy la función
supabase functions deploy stripe-service
```

### **Opción B: Usando Supabase Dashboard**

1. Ve a **Edge Functions** en el Dashboard
2. Haz clic en **Create a new function**
3. Nombre: `stripe-service`
4. Copia el contenido de `supabase/functions/stripe-service/index.ts`
5. Pega en el editor
6. Haz clic en **Deploy**

---

## ✅ **PASO 3: Verificar que la Función Está Desplegada**

1. Ve a **Edge Functions** en el Dashboard
2. Deberías ver `stripe-service` en la lista
3. Haz clic en ella para ver los logs y detalles

---

## ✅ **PASO 4: Probar la Función (Opcional)**

### **Probar con curl (desde terminal)**

```bash
# Reemplaza [TU_ANON_KEY] y [USER_ID] con valores reales
# Reemplaza [TU_PROJECT_URL] con tu URL de Supabase

# 1. Crear SetupIntent
curl -i --location --request POST 'https://[TU_PROJECT_URL].supabase.co/functions/v1/stripe-service' \
  --header 'Authorization: Bearer [TU_ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{
    "action": "create-setup-intent",
    "userId": "[USER_ID]"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "clientSecret": "seti_xxxx_secret_xxxx",
  "customerId": "cus_xxxx"
}
```

---

## 🔍 **Verificar Logs**

1. Ve a **Edge Functions** → `stripe-service` → **Logs**
2. Deberías ver logs cuando se invoque la función
3. Si hay errores, aparecerán aquí

---

## ⚠️ **Troubleshooting**

### **Error: "Stripe no está configurado"**
- Verifica que `STRIPE_SECRET_KEY` esté en Secrets
- Verifica que el nombre sea exactamente `STRIPE_SECRET_KEY` (case-sensitive)

### **Error: "No autorizado"**
- Verifica que estés enviando el header `Authorization: Bearer [TOKEN]`
- El token debe ser válido y del usuario autenticado

### **Error: "Customer creation failed"**
- Verifica que Stripe esté configurado correctamente
- Revisa los logs de Stripe Dashboard

---

## 📚 **Referencias**

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)

---

**Una vez deployada, la función estará lista para usar desde el frontend.**

