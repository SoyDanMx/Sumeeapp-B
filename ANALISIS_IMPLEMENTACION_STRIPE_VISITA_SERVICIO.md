# 🔍 Análisis Completo: Implementación de Stripe para Visita de Servicio ($350 MXN)

**Fecha:** 2025-11-22  
**Objetivo:** Integrar cobro de tarifa de visita técnica ($350 MXN) usando Stripe Payment Intents con Auth & Capture en `RequestServiceModal.tsx`

---

## ✅ **ESTADO ACTUAL DEL CÓDIGO**

### **1. Integración Stripe Existente**
- ✅ `@stripe/stripe-js` v7.5.0 instalado
- ✅ `stripe` v18.3.0 instalado
- ✅ `src/lib/stripe.ts` - Cliente Stripe configurado
- ✅ `src/app/api/stripe/create-checkout-session/route.ts` - API route para checkout sessions
- ✅ `supabase/functions/stripe-webhook/` - Edge Function para webhooks
- ✅ `stripe_customer_id` ya existe en tabla `profiles`

### **2. RequestServiceModal.tsx - Estado Actual**
- **Pasos actuales:** 4 pasos
  1. Selección de servicio/categoría
  2. Descripción del proyecto
  3. Ubicación
  4. Confirmación y envío
- **Flujo actual:** INSERT directo a `leads` sin validación de pago
- **Problema:** No hay retención de fondos antes de crear el lead

### **3. Base de Datos - Columnas Faltantes**
- ❌ `payment_method_id` - NO existe en `leads`
- ❌ `payment_intent_id` - NO existe en `leads`
- ❌ `payment_status` - NO existe en `leads`

---

## 🎯 **ANÁLISIS DEL PROMPT PROPUESTO**

### **✅ Fortalezas de la Propuesta**

1. **Seguridad PCI Compliance**
   - Uso de Stripe Elements (datos de tarjeta nunca tocan nuestros servidores)
   - Setup Intents para guardar tarjetas de forma segura
   - Payment Intents con `capture_method: 'manual'` para retención sin cobro inmediato

2. **Solución al Problema de Negocio**
   - Retención de fondos antes de que el técnico salga
   - Validación de fondos antes de crear el lead
   - El cliente no puede pedir servicio sin tarjeta válida

3. **Experiencia de Usuario**
   - Guarda tarjeta para futuros servicios (primera vez 1 min, siguientes 1 clic)
   - Transparencia: muestra que es una "retención temporal"
   - No cobra hasta confirmar el servicio

### **⚠️ Ajustes Necesarios al Prompt**

1. **Falta `@stripe/react-stripe-js`**
   - El prompt menciona instalarlo, pero no está en `package.json`
   - Necesario para `Elements`, `PaymentElement`, `useStripe`, `useElements`

2. **Edge Function `stripe-service` No Existe**
   - Necesitamos crear/actualizar la Edge Function
   - El prompt propone crear endpoints `/setup-intent` y `/authorize-hold`

3. **Estructura de Pasos**
   - Actual: 4 pasos
   - Propuesto: 5 pasos (agregar paso de pago entre ubicación y confirmación)
   - Necesitamos ajustar `totalSteps` y la lógica de navegación

4. **Manejo de Errores**
   - Si falla la autorización, NO crear el lead
   - Si falla el INSERT pero se autorizó, idealmente cancelar el hold (pero para MVP manual está bien)

---

## 📋 **PLAN DE IMPLEMENTACIÓN DETALLADO**

### **FASE 1: Preparación de Base de Datos** ⚙️

**Archivo:** `supabase/migrations/add-payment-columns-to-leads.sql`

```sql
-- Agregar columnas de pago a la tabla leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Agregar comentarios para documentación
COMMENT ON COLUMN public.leads.payment_method_id IS 'ID del método de pago de Stripe (pm_xxxx) usado para autorizar la visita';
COMMENT ON COLUMN public.leads.payment_intent_id IS 'ID del Payment Intent de Stripe (pi_xxxx) que retiene los $350 MXN';
COMMENT ON COLUMN public.leads.payment_status IS 'Estado del pago: pending, authorized, captured, failed, cancelled';

-- Crear índice para búsquedas por estado de pago
CREATE INDEX IF NOT EXISTS idx_leads_payment_status 
  ON public.leads(payment_status) 
  WHERE payment_status IS NOT NULL;
```

**Verificación:**
- Ejecutar en Supabase SQL Editor
- Verificar que las columnas se agregaron correctamente

---

### **FASE 2: Crear/Actualizar Edge Function** 🔧

**Archivo:** `supabase/functions/stripe-service/index.ts`

**Funcionalidades:**
1. `create-setup-intent` - Crear SetupIntent para guardar tarjeta
2. `authorize-hold` - Crear PaymentIntent con retención de $350 MXN
3. `capture-payment` - Capturar el pago cuando se confirme el servicio (futuro)
4. `cancel-hold` - Cancelar retención si el cliente rechaza (futuro)

**Dependencias necesarias:**
- Stripe SDK para Deno
- Supabase client para buscar/crear customer

---

### **FASE 3: Instalación de Dependencias Frontend** 📦

```bash
npm install @stripe/react-stripe-js
```

**Verificar:**
- `@stripe/stripe-js` ya está instalado ✅
- Solo falta `@stripe/react-stripe-js`

---

### **FASE 4: Crear Cliente Stripe Singleton** 🔐

**Archivo:** `src/lib/stripe/client.ts` (NUEVO)

**Propósito:**
- Inicializar Stripe una sola vez (Singleton pattern)
- Evitar recargar el script en cada render
- Manejar errores de configuración

---

### **FASE 5: Modificar RequestServiceModal.tsx** 🎨

**Cambios principales:**

1. **Agregar nuevos estados:**
   ```typescript
   const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
   const [clientSecret, setClientSecret] = useState<string | null>(null);
   const [isProcessingPayment, setIsProcessingPayment] = useState(false);
   ```

2. **Cambiar totalSteps de 4 a 5:**
   ```typescript
   const totalSteps = 5; // Antes era 4
   ```

3. **Nuevo Paso 4: Método de Pago**
   - Mostrar `PaymentElement` de Stripe
   - Validar y guardar tarjeta usando SetupIntent
   - Mostrar mensaje: "Se realizará una retención temporal de $350 MXN"

4. **Paso 5 (antes 4): Confirmación**
   - Mostrar resumen incluyendo método de pago
   - Al enviar, primero autorizar fondos, luego crear lead

5. **Modificar `handleFreeRequestSubmit`:**
   - ANTES del INSERT: Llamar a `authorize-hold`
   - Si autorización exitosa: Crear lead con `payment_intent_id`
   - Si falla: Mostrar error y NO crear lead

---

### **FASE 6: Actualizar Tipos TypeScript** 📝

**Archivo:** `src/types/supabase.ts`

Agregar a la interfaz `Lead`:
```typescript
export interface Lead {
  // ... campos existentes ...
  payment_method_id?: string | null;
  payment_intent_id?: string | null;
  payment_status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | null;
}
```

---

## 🔄 **FLUJO COMPLETO PROPUESTO**

```
1. Usuario selecciona servicio (Paso 1)
   ↓
2. Usuario describe el problema (Paso 2)
   ↓
3. Usuario ingresa ubicación (Paso 3)
   ↓
4. Usuario ingresa método de pago (Paso 4 - NUEVO)
   ├─ Frontend: Carga SetupIntent desde Edge Function
   ├─ Usuario completa formulario de tarjeta (Stripe Elements)
   ├─ Frontend: Confirma SetupIntent (guarda tarjeta)
   └─ Guarda payment_method_id en estado
   ↓
5. Usuario revisa resumen (Paso 5 - antes 4)
   ├─ Muestra: Servicio, Descripción, Ubicación, Método de Pago
   └─ Botón: "Enviar Solicitud"
   ↓
6. Al hacer clic en "Enviar Solicitud":
   ├─ Backend: Llamar a authorize-hold ($350 MXN)
   ├─ Stripe: Retener fondos (capture_method: 'manual')
   ├─ Backend: Si éxito, crear lead con payment_intent_id
   └─ Frontend: Mostrar éxito y cerrar modal
```

---

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **1. Seguridad**
- ✅ Datos de tarjeta nunca tocan nuestros servidores
- ✅ Usamos tokens seguros (pm_xxxx, pi_xxxx)
- ✅ PCI Compliance automático con Stripe Elements

### **2. Manejo de Errores**
- ❌ Si tarjeta rechazada → NO crear lead
- ❌ Si no hay fondos → NO crear lead
- ⚠️ Si INSERT falla pero autorización exitosa → Log para revisión manual (el hold expira en 7 días)

### **3. Experiencia de Usuario**
- ✅ Mensaje claro: "Retención temporal, no se cobra hasta confirmar"
- ✅ Primera vez: ~1 minuto para guardar tarjeta
- ✅ Siguientes veces: 1 clic (reutilizar tarjeta guardada)

### **4. Reglas de Negocio**
- ✅ $350 MXN se retiene al confirmar acuerdo con técnico
- ✅ Si cliente rechaza estimado → Se cobra $350 MXN (no reembolsable)
- ✅ Si cliente acepta → $350 MXN se descuenta del total

---

## 📊 **ESTIMACIÓN DE ESFUERZO**

| Fase | Tiempo Estimado | Complejidad |
|------|----------------|-------------|
| FASE 1: Base de Datos | 15 min | Baja |
| FASE 2: Edge Function | 2-3 horas | Media-Alta |
| FASE 3: Dependencias | 5 min | Baja |
| FASE 4: Cliente Stripe | 30 min | Baja |
| FASE 5: RequestServiceModal | 4-5 horas | Alta |
| FASE 6: Tipos TypeScript | 10 min | Baja |
| **TOTAL** | **7-9 horas** | **Media-Alta** |

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Preparación**
- [ ] Ejecutar migración SQL en Supabase
- [ ] Verificar variables de entorno Stripe
- [ ] Instalar `@stripe/react-stripe-js`

### **Backend**
- [ ] Crear Edge Function `stripe-service`
- [ ] Implementar `create-setup-intent`
- [ ] Implementar `authorize-hold`
- [ ] Probar endpoints con Postman/curl

### **Frontend**
- [ ] Crear `src/lib/stripe/client.ts`
- [ ] Actualizar tipos en `src/types/supabase.ts`
- [ ] Modificar `RequestServiceModal.tsx`:
  - [ ] Agregar estados de pago
  - [ ] Cambiar totalSteps a 5
  - [ ] Crear componente `PaymentForm`
  - [ ] Agregar Paso 4 (Pago)
  - [ ] Modificar Paso 5 (Confirmación)
  - [ ] Modificar `handleFreeRequestSubmit` para autorizar antes de INSERT

### **Testing**
- [ ] Probar con tarjeta de prueba exitosa
- [ ] Probar con tarjeta rechazada
- [ ] Probar con tarjeta sin fondos
- [ ] Verificar que lead NO se crea si falla autorización
- [ ] Verificar que payment_intent_id se guarda en lead

### **Documentación**
- [ ] Documentar flujo completo
- [ ] Agregar comentarios en código crítico
- [ ] Crear guía para cancelar holds manualmente (si es necesario)

---

## 🚀 **PRÓXIMOS PASOS**

1. **Revisar y aprobar este análisis**
2. **Ejecutar FASE 1 (Base de Datos)**
3. **Crear FASE 2 (Edge Function)**
4. **Implementar FASE 3-6 (Frontend)**
5. **Testing exhaustivo**
6. **Deploy a producción**

---

## 📚 **REFERENCIAS**

- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Setup Intents](https://stripe.com/docs/payments/setup-intents)
- [Stripe Elements](https://stripe.com/docs/stripe-js/react)
- [Stripe Manual Capture](https://stripe.com/docs/payments/capture-later)
- [Página de Pago de Servicios](https://sumeeapp.com/pago-de-servicios)

---

**Última actualización:** 2025-11-22  
**Autor:** Análisis Automatizado  
**Estado:** ✅ Listo para implementación

