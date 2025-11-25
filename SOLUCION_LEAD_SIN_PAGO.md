# 🔧 Solución: Lead se Crea Sin Pasar por el Paso de Pago

**Fecha:** 2025-11-23  
**Problema:** El lead se crea pero nunca aparece el paso 4 (pago)

---

## 🔍 **Causa del Problema**

El feature flag `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT` estaba en `false`, por lo que:
- El flujo usaba `handleFreeRequestSubmitWithoutPayment()`
- El lead se creaba directamente sin pasar por el pago
- Solo aparecían 4 pasos (sin paso de pago)

---

## ✅ **Solución Aplicada**

### **1. Feature Flag Activado** ✅
```bash
NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true
```

### **2. Validación Adicional Agregada** ✅
Ahora `handleFreeRequestSubmit()` valida:
- Si el feature flag está activo Y no hay `paymentMethodId` → Error y regresa al paso 4
- Esto previene que el lead se cree sin pago

### **3. Flujo Correcto Ahora:**
```
Paso 1: Servicio
   ↓
Paso 2: Descripción
   ↓
Paso 3: Ubicación y WhatsApp
   ↓
Paso 4: 💳 MÉTODO DE PAGO (OBLIGATORIO) ← AQUÍ
   ├─ Usuario DEBE ingresar tarjeta
   ├─ Se autoriza HOLD de $350 MXN
   └─ NO se puede avanzar sin completar
   ↓
Paso 5: Confirmación
   └─ ✅ AQUÍ SE CREA EL LEAD (solo si pago exitoso)
```

---

## 🔄 **Reiniciar Servidor**

**IMPORTANTE:** Después de cambiar `.env.local`, debes reiniciar el servidor:

```bash
# 1. Detén el servidor actual (Ctrl+C en la terminal donde corre)
# 2. Reinicia:
npm run dev
```

---

## ✅ **Verificación**

### **1. Verificar Feature Flag:**
```bash
grep NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT .env.local
# Debe mostrar: NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true
```

### **2. Verificar en el Modal:**
- Debe mostrar **"Paso X de 5"** (no "de 4")
- El **Paso 4** debe ser "Método de Pago"
- El **Paso 5** debe ser "Confirma y Envía"

### **3. Verificar en Consola (DevTools):**
```javascript
// Abre DevTools (F12) → Console
console.log("Feature flag:", process.env.NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT);
// Debe mostrar: "true"
```

### **4. Probar Flujo:**
1. Abre modal "Solicitar Servicio"
2. Completa Pasos 1-3
3. **Paso 4:** Debe aparecer formulario de pago
4. **NO puedes avanzar** sin completar el pago
5. **Paso 5:** Solo aparece después de completar pago
6. El lead solo se crea en Paso 5 (después de pago exitoso)

---

## 🛡️ **Protecciones Implementadas**

### **1. Validación en `handleFreeRequestSubmit()`:**
```typescript
if (enableStripePayment) {
  if (!paymentMethodId) {
    setError("Debes completar el paso de pago antes de enviar la solicitud.");
    setCurrentStep(4); // Regresar al paso de pago
    return;
  }
  return handleFreeRequestSubmitWithPayment();
}
```

### **2. Validación en Botón "Siguiente":**
```typescript
disabled={
  ...
  (enableStripePayment && currentStep === 4 && !paymentMethodId)
}
```
- El botón "Siguiente" está deshabilitado en Paso 4 si no hay `paymentMethodId`

### **3. Validación en `handleFreeRequestSubmitWithPayment()`:**
```typescript
if (!paymentMethodId) {
  throw new Error("No se ha proporcionado un método de pago válido...");
}
```
- La función de pago valida que exista `paymentMethodId` antes de autorizar

---

## 📋 **Comportamiento Esperado**

### **Con Feature Flag Activado (`true`):**
- ✅ 5 pasos totales
- ✅ Paso 4 es obligatorio (Pago)
- ✅ No se puede avanzar sin completar pago
- ✅ Lead solo se crea después de pago exitoso
- ✅ Si pago falla, lead NO se crea

### **Con Feature Flag Desactivado (`false`):**
- ✅ 4 pasos totales
- ✅ No aparece paso de pago
- ✅ Lead se crea directamente (flujo actual)

---

## 🐛 **Troubleshooting**

### **Problema: "Sigue creando el lead sin pago"**

**Causa:** El servidor no se reinició después de cambiar `.env.local`

**Solución:**
1. Detén el servidor (Ctrl+C)
2. Reinicia: `npm run dev`
3. Recarga la página en el navegador

### **Problema: "No aparece el paso de pago"**

**Causa:** El feature flag no está activado o el servidor no se reinició

**Solución:**
1. Verifica `.env.local`: `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true`
2. Reinicia el servidor
3. Recarga la página

### **Problema: "Puedo avanzar sin completar el pago"**

**Causa:** Bug en la validación (debería estar resuelto)

**Solución:**
- La validación agregada previene esto
- Si persiste, verifica que el código esté actualizado

---

## ✅ **Estado Actual**

- ✅ Feature flag activado: `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true`
- ✅ Validación agregada en `handleFreeRequestSubmit()`
- ✅ Validación en botón "Siguiente"
- ✅ Validación en `handleFreeRequestSubmitWithPayment()`

**Próximo Paso:** Reiniciar servidor y probar el flujo completo

---

**Estado:** ✅ Solución aplicada

**Acción Requerida:** Reiniciar servidor (`npm run dev`)

