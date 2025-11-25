# 🛡️ Estrategia de Implementación Segura: Stripe Payment en RequestServiceModal

**Objetivo:** Implementar pagos con Stripe SIN afectar la colocación de leads existente

---

## ✅ **ESTRATEGIA: Feature Flag + Fallback**

### **Principio Fundamental**
- **El flujo actual DEBE seguir funcionando** como está
- El nuevo flujo de pago será **opcional y controlado por feature flag**
- Si algo falla con Stripe, **automáticamente usar el flujo actual**

---

## 🔧 **IMPLEMENTACIÓN CON FEATURE FLAG**

### **1. Variable de Entorno**

Agregar a `.env.local`:
```bash
# Feature Flag para Stripe Payment
NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=false  # false = usar flujo actual, true = usar nuevo flujo
```

### **2. Lógica Condicional en RequestServiceModal**

```typescript
// Al inicio del componente
const ENABLE_STRIPE_PAYMENT = process.env.NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT === 'true';

// Ajustar totalSteps dinámicamente
const totalSteps = ENABLE_STRIPE_PAYMENT ? 5 : 4; // 5 si pago habilitado, 4 si no

// En handleFreeRequestSubmit
const handleFreeRequestSubmit = async () => {
  // ... validaciones existentes ...
  
  if (ENABLE_STRIPE_PAYMENT && paymentMethodId) {
    // NUEVO FLUJO: Con pago
    try {
      // 1. Autorizar fondos
      const authResult = await authorizePaymentHold(paymentMethodId);
      if (!authResult.success) {
        throw new Error(authResult.error || "No se pudo autorizar el pago");
      }
      
      // 2. Crear lead con payment_intent_id
      const leadPayload = {
        // ... campos existentes ...
        payment_intent_id: authResult.paymentIntentId,
        payment_method_id: paymentMethodId,
        payment_status: 'authorized'
      };
      
      // INSERT (igual que antes)
      const { data, error } = await supabase.from('leads').insert(leadPayload);
      // ... resto del código ...
      
    } catch (paymentError) {
      console.error("Error en pago, usando flujo sin pago:", paymentError);
      // FALLBACK: Usar flujo actual sin pago
      return handleFreeRequestSubmitWithoutPayment();
    }
  } else {
    // FLUJO ACTUAL: Sin pago (sin cambios)
    return handleFreeRequestSubmitWithoutPayment();
  }
};

// Extraer lógica actual a función separada
const handleFreeRequestSubmitWithoutPayment = async () => {
  // TODO EL CÓDIGO ACTUAL DE handleFreeRequestSubmit
  // Sin modificaciones, tal cual está ahora
};
```

---

## 📋 **PLAN DE IMPLEMENTACIÓN POR FASES**

### **FASE 0: Preparación (Sin tocar código de producción)**

1. ✅ Crear migración SQL (solo agregar columnas, no modificar existentes)
2. ✅ Crear Edge Function `stripe-service` (nueva, no afecta código existente)
3. ✅ Instalar `@stripe/react-stripe-js` (solo dependencia nueva)

### **FASE 1: Código Nuevo (Aislado)**

1. ✅ Crear `src/lib/stripe/client.ts` (archivo nuevo)
2. ✅ Crear componente `PaymentForm.tsx` (componente nuevo, separado)
3. ✅ Actualizar tipos TypeScript (solo agregar campos opcionales)

### **FASE 2: Modificación Segura de RequestServiceModal**

1. ✅ Agregar feature flag check al inicio
2. ✅ Agregar estados de pago (solo se usan si feature flag activo)
3. ✅ Extraer `handleFreeRequestSubmitWithoutPayment()` (código actual intacto)
4. ✅ Agregar `handleFreeRequestSubmitWithPayment()` (nuevo código)
5. ✅ Modificar `handleFreeRequestSubmit()` para elegir entre ambos
6. ✅ Agregar Paso 4 (Pago) solo si feature flag activo

### **FASE 3: Testing en Localhost**

1. ✅ Probar con `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=false` (debe funcionar igual que ahora)
2. ✅ Probar con `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true` (nuevo flujo)
3. ✅ Probar fallback (si pago falla, usar flujo sin pago)
4. ✅ Verificar que leads se crean correctamente en ambos casos

---

## 🔒 **GARANTÍAS DE SEGURIDAD**

### **1. Código Actual Intacto**
- La función `handleFreeRequestSubmitWithoutPayment()` será **copia exacta** del código actual
- No se modifica ni una línea del flujo existente
- Si feature flag está en `false`, el código nuevo **nunca se ejecuta**

### **2. Fallback Automático**
- Si Stripe falla → automáticamente usa flujo sin pago
- Si no hay `paymentMethodId` → automáticamente usa flujo sin pago
- Si feature flag está en `false` → automáticamente usa flujo sin pago

### **3. Testing Exhaustivo**
- Probar flujo actual (feature flag false) → debe funcionar igual
- Probar nuevo flujo (feature flag true) → debe funcionar con pago
- Probar fallback (pago falla) → debe crear lead sin pago

---

## 📝 **ESTRUCTURA DE ARCHIVOS**

```
src/
├── components/
│   └── client/
│       ├── RequestServiceModal.tsx (modificado con feature flag)
│       └── PaymentForm.tsx (NUEVO - componente aislado)
├── lib/
│   └── stripe/
│       └── client.ts (NUEVO - singleton pattern)
└── types/
    └── supabase.ts (actualizado - solo agregar campos opcionales)

supabase/
├── functions/
│   └── stripe-service/ (NUEVO - Edge Function)
└── migrations/
    └── add-payment-columns-to-leads.sql (NUEVO - solo agregar columnas)
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN SEGURA**

### **Antes de Modificar RequestServiceModal**
- [ ] Migración SQL ejecutada (solo agregar columnas)
- [ ] Edge Function creada y probada
- [ ] `PaymentForm.tsx` creado y probado aisladamente
- [ ] `src/lib/stripe/client.ts` creado
- [ ] Tipos TypeScript actualizados

### **Modificación de RequestServiceModal**
- [ ] Feature flag agregado al inicio
- [ ] Código actual extraído a `handleFreeRequestSubmitWithoutPayment()`
- [ ] Nuevo código en `handleFreeRequestSubmitWithPayment()`
- [ ] `handleFreeRequestSubmit()` modifica solo para elegir entre ambos
- [ ] Paso 4 (Pago) solo se muestra si feature flag activo
- [ ] `totalSteps` es dinámico según feature flag

### **Testing en Localhost**
- [ ] Con `ENABLE_STRIPE_PAYMENT=false`: Flujo actual funciona igual
- [ ] Con `ENABLE_STRIPE_PAYMENT=true`: Nuevo flujo funciona
- [ ] Fallback funciona (si pago falla, usa flujo sin pago)
- [ ] Leads se crean correctamente en ambos casos
- [ ] No hay errores en consola
- [ ] Performance no se ve afectada

### **Antes de Activar en Producción**
- [ ] Testing exhaustivo en localhost
- [ ] Verificar que feature flag está en `false` en producción
- [ ] Documentar cómo activar el feature flag
- [ ] Plan de rollback (simplemente poner feature flag en `false`)

---

## 🚀 **ORDEN DE IMPLEMENTACIÓN RECOMENDADO**

1. **FASE 0:** Migración SQL + Edge Function (no afecta código frontend)
2. **FASE 1:** Crear archivos nuevos (PaymentForm, stripe/client.ts)
3. **FASE 2:** Modificar RequestServiceModal con feature flag
4. **FASE 3:** Testing exhaustivo en localhost con feature flag en `false`
5. **FASE 4:** Testing con feature flag en `true`
6. **FASE 5:** Solo cuando todo funcione, activar en producción

---

## 🔄 **ROLLBACK PLAN**

Si algo sale mal:
1. Cambiar `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=false` en `.env.local`
2. Reiniciar servidor
3. El código automáticamente usa el flujo original (sin cambios)

**No se necesita revertir commits ni código.**

---

**Última actualización:** 2025-11-22  
**Estado:** ✅ Listo para implementación segura

