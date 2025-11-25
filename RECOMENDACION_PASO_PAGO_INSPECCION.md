# 💡 Recomendación: Cuándo Debe Aparecer el Pago de Inspección

**Fecha:** 2025-11-23  
**Pregunta:** ¿En qué paso debe aparecer el cargo de pago?

---

## 🎯 **Recomendación: Paso 4 (ANTES de Confirmación)**

### **Flujo Recomendado:**

```
┌─────────────────────────────────────────────────────────┐
│  PASO 1: Seleccionar Servicio                          │
│  (Plomería, Electricidad, etc.)                         │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│  PASO 2: Descripción del Problema                      │
│  (Detalles, síntomas, cuándo empezó)                   │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│  PASO 3: Ubicación y WhatsApp                          │
│  (Dirección, contacto)                                  │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│  PASO 4: 💳 MÉTODO DE PAGO (OBLIGATORIO)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Usuario ingresa tarjeta                      │   │
│  │ • Se autoriza HOLD de $350 MXN                 │   │
│  │ • NO se crea el lead aún                       │   │
│  │ • Si falla → Error, no avanza                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│  PASO 5: Confirmación y Resumen                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Muestra resumen completo                     │   │
│  │ • Muestra info de pago autorizado              │   │
│  │ • Usuario confirma                             │   │
│  │ • ✅ AQUÍ SE CREA EL LEAD                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ **Por Qué el Pago Debe Ser en el Paso 4**

### **1. Garantía de Pago Antes de Crear Lead**
- ✅ El lead solo se crea si el pago es exitoso
- ✅ Si el pago falla, el lead NO se crea
- ✅ Evita leads "huérfanos" sin garantía de pago

### **2. Flujo Lógico**
- ✅ Usuario recopila información (Pasos 1-3)
- ✅ Usuario paga (Paso 4)
- ✅ Usuario confirma y se crea el lead (Paso 5)

### **3. Experiencia de Usuario**
- ✅ El usuario ve el resumen completo antes de confirmar
- ✅ Sabe que el pago ya está autorizado
- ✅ Confianza: "Ya pagué, ahora solo confirmo"

### **4. Seguridad del Negocio**
- ✅ Retención de fondos ANTES de asignar técnico
- ✅ Si el cliente no tiene fondos, no puede crear el lead
- ✅ Protege contra clientes que no quieren pagar después

---

## ❌ **Por Qué NO Debe Ser Después de Crear el Lead**

### **Flujo Incorrecto:**
```
Paso 1 → Paso 2 → Paso 3 → Paso 4 (Confirmación) → Lead Creado ❌
                                                         ↓
                                              Paso 5 (Pago) ❌
```

**Problemas:**
- ❌ El lead se crea sin garantía de pago
- ❌ Si el pago falla, el lead queda "huérfano"
- ❌ No cumple el objetivo: "retener fondos antes de asignar técnico"
- ❌ El técnico podría ser asignado sin garantía de pago

---

## 📊 **Comparación de Flujos**

| Aspecto | Pago ANTES (Recomendado) | Pago DESPUÉS (No Recomendado) |
|---------|-------------------------|------------------------------|
| **Orden** | Info → Pago → Confirmación → Lead | Info → Confirmación → Lead → Pago |
| **Garantía de pago** | ✅ Sí (lead solo se crea si pago OK) | ❌ No (lead se crea sin pago) |
| **Leads huérfanos** | ✅ No (si pago falla, no hay lead) | ❌ Sí (lead existe sin pago) |
| **Seguridad** | ✅ Alta (fondos retenidos antes) | ❌ Baja (sin garantía) |
| **UX** | ✅ Lógico y claro | ❌ Confuso (pago después) |

---

## 🔧 **Implementación Actual**

### **Estado:**
✅ **Ya está implementado correctamente**

El código actual:
- Paso 4: Pago (si feature flag activo)
- Paso 5: Confirmación → Crear Lead (solo si pago exitoso)

### **Problema:**
❌ El feature flag está en `false`

### **Solución:**
1. Activar feature flag:
   ```bash
   # En .env.local:
   NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true
   ```

2. Reiniciar servidor:
   ```bash
   npm run dev
   ```

3. Verificar:
   - Debe aparecer **5 pasos** (no 4)
   - Paso 4 debe ser "Método de Pago"
   - Paso 5 debe ser "Confirma y Envía"
   - El lead solo se crea en Paso 5 (después de pago)

---

## 📋 **Flujo Detallado del Paso 4 (Pago)**

### **Cuando el Usuario Llega al Paso 4:**

1. **Inicialización Automática:**
   - Se llama a Edge Function `stripe-service`
   - Se crea `SetupIntent` para guardar tarjeta
   - Se obtiene `clientSecret`

2. **Usuario Ingresa Tarjeta:**
   - Usa Stripe Elements (seguro, PCI compliant)
   - Ingresa: número, fecha, CVC, código postal
   - Haz clic en "Guardar Tarjeta y Continuar"

3. **Validación y Guardado:**
   - Stripe valida la tarjeta
   - Se guarda el `payment_method_id` (pm_xxxx)
   - Se avanza automáticamente al Paso 5

4. **Si Falla:**
   - Se muestra error específico
   - NO se avanza al siguiente paso
   - El usuario puede corregir o usar otra tarjeta

### **Cuando el Usuario Confirma (Paso 5):**

1. **Autorización de Hold:**
   - Se llama a Edge Function con `authorize-hold`
   - Se retiene $350 MXN en la tarjeta
   - Se obtiene `payment_intent_id` (pi_xxxx)

2. **Creación del Lead:**
   - Solo si el hold es exitoso
   - Se crea el lead con:
     - `payment_method_id`: pm_xxxx
     - `payment_intent_id`: pi_xxxx
     - `payment_status`: 'authorized'

3. **Si el Hold Falla:**
   - NO se crea el lead
   - Se muestra error al usuario
   - El usuario puede reintentar

---

## ✅ **Resumen de Recomendación**

### **Paso Recomendado para el Pago:**
**PASO 4** (después de recopilar información, antes de confirmar)

### **Razones:**
1. ✅ Garantiza pago antes de crear lead
2. ✅ Flujo lógico y claro
3. ✅ Protege el negocio
4. ✅ Mejor experiencia de usuario

### **Estado de Implementación:**
✅ **Ya está implementado correctamente**

### **Acción Requerida:**
1. Activar feature flag: `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true`
2. Reiniciar servidor
3. Probar flujo completo

---

**Conclusión:** El pago debe ser en el **Paso 4**, y esto ya está implementado. Solo necesitas activar el feature flag.

