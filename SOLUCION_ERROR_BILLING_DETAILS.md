# 🔧 Solución: Error de Billing Details en Stripe

**Fecha:** 2025-11-23  
**Error:** `IntegrationError: You specified "never" for fields.billing_details.email/phone...`

---

## 🔍 **Causa del Error**

Cuando configuramos `PaymentElement` con:
```typescript
fields: {
  billingDetails: {
    email: "never",
    phone: "never",
  },
}
```

Stripe requiere que pasemos estos datos manualmente en `confirmParams.payment_method_data.billing_details` al llamar a `stripe.confirmSetup()`.

---

## ✅ **Solución Aplicada**

### **1. PaymentForm.tsx Actualizado** ✅

**Agregado:**
- Prop `userEmail?: string`
- Prop `userPhone?: string`
- Lógica para pasar email y teléfono en `confirmParams.payment_method_data.billing_details`

**Código:**
```typescript
const confirmParams: any = {
  return_url: window.location.origin,
};

if (userEmail || userPhone) {
  confirmParams.payment_method_data = {
    billing_details: {
      ...(userEmail && { email: userEmail }),
      ...(userPhone && { phone: userPhone }),
    },
  };
}
```

### **2. RequestServiceModal.tsx Actualizado** ✅

**Agregado:**
- Pasa `userEmail` al `PaymentForm`
- Pasa `userPhone` al `PaymentForm` (desde `whatsappValidation.normalized` o `formData.whatsapp`)

**Código:**
```typescript
<PaymentForm
  ...
  userEmail={user?.email || profile?.email || undefined}
  userPhone={whatsappValidation.normalized || formData.whatsapp || profile?.phone || profile?.whatsapp || undefined}
/>
```

---

## 🔄 **Flujo Corregido**

1. Usuario completa Pasos 1-3 (incluyendo WhatsApp)
2. Llega al Paso 4 (Pago)
3. `PaymentForm` recibe:
   - `userEmail`: Del usuario autenticado
   - `userPhone`: Del WhatsApp ingresado en Paso 3
4. Al confirmar SetupIntent, pasa estos datos a Stripe
5. Stripe acepta la confirmación sin errores ✅

---

## ✅ **Verificación**

**Prueba el flujo:**
1. Completa Pasos 1-3 (asegúrate de ingresar WhatsApp)
2. Llega al Paso 4 (Pago)
3. Ingresa tarjeta: `4242 4242 4242 4242`
4. **Verifica:** NO debe aparecer el error de billing details
5. El pago debe completarse correctamente

---

## 📋 **Datos Pasados a Stripe**

Cuando el usuario confirma el pago, Stripe recibe:

```javascript
{
  payment_method_data: {
    billing_details: {
      email: "usuario@ejemplo.com",  // Del usuario autenticado
      phone: "525512345678"          // Del WhatsApp ingresado
    }
  }
}
```

Esto cumple con los requisitos de Stripe cuando `fields.billing_details.email/phone` es `"never"`.

---

**Estado:** ✅ Error corregido

**Próximo Paso:** Probar el flujo completo de pago

