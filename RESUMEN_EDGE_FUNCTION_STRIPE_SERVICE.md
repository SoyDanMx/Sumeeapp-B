# ✅ Edge Function `stripe-service` - Completada

**Fecha:** 2025-11-22  
**Estado:** ✅ Creada y lista para deploy

---

## 📁 **Archivos Creados**

1. **`supabase/functions/stripe-service/index.ts`** ✅
   - Función completa con 4 endpoints
   - Manejo de errores robusto
   - Autenticación y validación

2. **`supabase/functions/stripe-service/deno.json`** ✅
   - Configuración de Deno
   - Import de Stripe SDK

3. **`supabase/config.toml`** ✅ (Actualizado)
   - Configuración agregada para `stripe-service`

---

## 🔧 **Endpoints Implementados**

### **1. `create-setup-intent`**
**Propósito:** Crear SetupIntent para guardar tarjeta sin cobrar

**Request:**
```json
{
  "action": "create-setup-intent",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "seti_xxxx_secret_xxxx",
  "customerId": "cus_xxxx"
}
```

**Flujo:**
1. Busca o crea Customer en Stripe
2. Crea SetupIntent asociado al Customer
3. Retorna `clientSecret` para usar en frontend

---

### **2. `authorize-hold`**
**Propósito:** Retener $350 MXN en la tarjeta (sin cobrar aún)

**Request:**
```json
{
  "action": "authorize-hold",
  "paymentMethodId": "pm_xxxx",
  "amount": 350
}
```

**Response:**
```json
{
  "success": true,
  "paymentIntentId": "pi_xxxx",
  "status": "requires_capture",
  "amount": 350
}
```

**Flujo:**
1. Busca o crea Customer en Stripe
2. Crea PaymentIntent con `capture_method: 'manual'`
3. Confirma inmediatamente (retención)
4. Retorna `paymentIntentId` para guardar en lead

**⚠️ IMPORTANTE:**
- `capture_method: 'manual'` = Solo retiene, NO cobra
- El dinero queda "congelado" en la tarjeta
- Se puede capturar después o cancelar

---

### **3. `capture-payment`** (Para uso futuro)
**Propósito:** Capturar el pago cuando el cliente acepta el estimado

**Request:**
```json
{
  "action": "capture-payment",
  "paymentIntentId": "pi_xxxx"
}
```

**Response:**
```json
{
  "success": true,
  "paymentIntentId": "pi_xxxx",
  "status": "succeeded"
}
```

---

### **4. `cancel-hold`** (Para uso futuro)
**Propósito:** Cancelar la retención si el cliente rechaza

**Request:**
```json
{
  "action": "cancel-hold",
  "paymentIntentId": "pi_xxxx"
}
```

**Response:**
```json
{
  "success": true,
  "paymentIntentId": "pi_xxxx",
  "status": "canceled"
}
```

---

## 🔐 **Seguridad Implementada**

1. **Autenticación:**
   - Requiere header `Authorization: Bearer [TOKEN]`
   - Valida token con Supabase Auth
   - Solo usuarios autenticados pueden usar la función

2. **Validación:**
   - Verifica que Stripe esté configurado
   - Valida parámetros requeridos
   - Maneja errores específicos de Stripe

3. **Manejo de Errores:**
   - Errores de tarjeta → mensajes amigables
   - Errores de Stripe → logging detallado
   - Errores de BD → no expone información sensible

---

## 🛠️ **Función Auxiliar: `findOrCreateStripeCustomer`**

**Propósito:** Buscar o crear Customer en Stripe

**Flujo:**
1. Busca `stripe_customer_id` en tabla `profiles`
2. Si existe, verifica que el Customer existe en Stripe
3. Si no existe o fue eliminado, crea uno nuevo
4. Guarda `stripe_customer_id` en `profiles`
5. Retorna el `customer_id`

**Ventajas:**
- Reutiliza Customers existentes
- Evita duplicados
- Sincroniza BD con Stripe

---

## 📋 **Próximos Pasos**

1. **Deploy la función:**
   - Ver `INSTRUCCIONES_DEPLOY_STRIPE_SERVICE.md`
   - Agregar `STRIPE_SECRET_KEY` a Supabase Secrets
   - Ejecutar `supabase functions deploy stripe-service`

2. **Probar endpoints:**
   - Usar curl o Postman
   - Verificar logs en Supabase Dashboard
   - Probar con tarjetas de prueba de Stripe

3. **Integrar en Frontend:**
   - Continuar con FASE 2 (modificar RequestServiceModal)
   - Usar feature flag para testing seguro

---

## 🧪 **Tarjetas de Prueba de Stripe**

Para testing, usa estas tarjetas:

- **Éxito:** `4242 4242 4242 4242`
- **Rechazo:** `4000 0000 0000 0002`
- **Sin fondos:** `4000 0000 0000 9995`
- **Cualquier fecha futura y CVC válido**

---

## ✅ **Checklist de Verificación**

- [x] Edge Function creada
- [x] `deno.json` configurado
- [x] `config.toml` actualizado
- [ ] `STRIPE_SECRET_KEY` agregada a Supabase Secrets
- [ ] Función deployada en Supabase
- [ ] Endpoints probados con curl/Postman
- [ ] Logs verificados en Supabase Dashboard

---

**Estado:** ✅ Lista para deploy y testing

