# ⚡ Guía Rápida: Pruebas Esenciales de Pago

**Fecha:** 2025-11-23  
**Para:** Testing rápido antes de producción

---

## 🎯 **5 Pruebas Esenciales (15 minutos)**

### **1. Flujo Completo con Pago Exitoso** ⏱️ 5 min

1. Inicia sesión → Abre "Solicitar Servicio"
2. Completa Pasos 1-3
3. **Paso 4:** Tarjeta `4242 4242 4242 4242` (cualquier fecha futura, CVC 123)
4. **Paso 5:** Confirma

**✅ Verifica:**
- Lead creado en Supabase con `payment_intent_id` y `payment_status: 'authorized'`
- Payment Intent en Stripe con status `Requires capture` y monto $350 MXN

---

### **2. No se Puede Avanzar Sin Pago** ⏱️ 2 min

1. Completa Pasos 1-3
2. Llega al Paso 4
3. **NO completes el pago**
4. Intenta hacer clic en "Siguiente"

**✅ Verifica:**
- Botón "Siguiente" está deshabilitado
- No puedes avanzar

---

### **3. Tarjeta Rechazada** ⏱️ 3 min

1. Completa Pasos 1-3
2. **Paso 4:** Tarjeta `4000 0000 0000 0002`
3. Intenta completar

**✅ Verifica:**
- Muestra error específico
- NO crea el lead
- Puedes intentar con otra tarjeta

---

### **4. Datos en Supabase** ⏱️ 3 min

1. Después de crear lead con pago exitoso
2. Ve a Supabase → Table Editor → `leads`

**✅ Verifica:**
- `payment_method_id`: `pm_xxxx`
- `payment_intent_id`: `pi_xxxx`
- `payment_status`: `authorized`

---

### **5. Payment Intent en Stripe** ⏱️ 2 min

1. Después de crear lead con pago exitoso
2. Ve a Stripe Dashboard → Payments

**✅ Verifica:**
- Payment Intent con status `Requires capture`
- Amount: $350.00 MXN
- Capture method: `Manual`

---

## ✅ **Si Todas las Pruebas Pasan:**

**Listo para producción** ✅

**Siguiente Paso:** Activar feature flag en producción y verificar claves de Stripe (producción, no test)

---

## ❌ **Si Alguna Prueba Falla:**

**NO pasar a producción** ❌

**Acción:** Revisar el error y corregirlo antes de continuar

---

**Tiempo Total:** ~15 minutos

