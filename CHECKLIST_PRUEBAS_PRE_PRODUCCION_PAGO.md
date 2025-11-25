# ✅ Checklist de Pruebas Pre-Producción: Pago de Inspección

**Fecha:** 2025-11-23  
**Objetivo:** Verificar que la funcionalidad de pago esté lista para producción

---

## 🎯 **PRUEBAS CRÍTICAS (Obligatorias)**

### **1. Flujo Completo con Pago Exitoso** ✅

**Pasos:**
1. Inicia sesión como cliente
2. Abre modal "Solicitar Servicio"
3. **Paso 1:** Selecciona un servicio (ej: Plomería)
4. **Paso 2:** Escribe descripción (mínimo 20 caracteres)
5. **Paso 3:** Ingresa WhatsApp y dirección
6. **Paso 4:** 💳 **Método de Pago**
   - Usa tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura (ej: 12/25)
   - CVC: Cualquier 3 dígitos (ej: 123)
   - Código postal: Cualquier código (ej: 12345)
   - Haz clic en "Guardar Tarjeta y Continuar"
7. **Paso 5:** Confirma y envía

**Verificaciones:**
- [ ] Aparecen 5 pasos (no 4)
- [ ] Paso 4 muestra formulario de Stripe
- [ ] Se puede ingresar tarjeta correctamente
- [ ] Al completar pago, avanza automáticamente al Paso 5
- [ ] Paso 5 muestra información de pago ("Tarjeta guardada (Pre-autorización $350 MXN)")
- [ ] Al confirmar, se crea el lead exitosamente
- [ ] Se redirige a `/solicitudes/[lead-id]`

**En Consola (DevTools):**
- [ ] `💳 Inicializando SetupIntent para guardar tarjeta...`
- [ ] `✅ SetupIntent creado, clientSecret obtenido`
- [ ] `✅ PaymentMethod obtenido: pm_xxxx`
- [ ] `💳 Autorizando fondos en Stripe...`
- [ ] `✅ Fondos retenidos exitosamente. Payment Intent: pi_xxxx`
- [ ] `✅ ¡ÉXITO! Lead creado con ID: ... y pago autorizado`

**En Supabase:**
- [ ] Lead creado con:
  - [ ] `payment_method_id`: `pm_xxxx`
  - [ ] `payment_intent_id`: `pi_xxxx`
  - [ ] `payment_status`: `authorized`

**En Stripe Dashboard:**
- [ ] Payment Intent creado con:
  - [ ] Status: `Requires capture`
  - [ ] Amount: $350.00 MXN
  - [ ] Capture method: `Manual`

---

### **2. Validación: No se Puede Avanzar Sin Pago** ✅

**Pasos:**
1. Completa Pasos 1-3
2. Llega al Paso 4 (Pago)
3. **NO completes el pago**
4. Intenta hacer clic en "Siguiente"

**Verificaciones:**
- [ ] Botón "Siguiente" está **deshabilitado**
- [ ] No puedes avanzar al Paso 5 sin completar el pago
- [ ] Si intentas avanzar de otra forma, muestra error

---

### **3. Validación: No se Crea Lead Sin Pago** ✅

**Pasos:**
1. Completa Pasos 1-3
2. Llega al Paso 4 (Pago)
3. **NO completes el pago**
4. Intenta crear el lead (si es posible)

**Verificaciones:**
- [ ] Si intentas crear el lead sin pago, muestra error:
  - [ ] "Debes completar el paso de pago antes de enviar la solicitud."
- [ ] El lead **NO se crea** en Supabase
- [ ] Regresa automáticamente al Paso 4

---

### **4. Manejo de Errores: Tarjeta Rechazada** ✅

**Pasos:**
1. Completa Pasos 1-3
2. **Paso 4:** Usa tarjeta de prueba rechazada: `4000 0000 0000 0002`
3. Intenta completar el pago

**Verificaciones:**
- [ ] Muestra error específico: "Tu tarjeta fue rechazada..."
- [ ] NO avanza al Paso 5
- [ ] El lead **NO se crea**
- [ ] Puedes intentar con otra tarjeta

---

### **5. Manejo de Errores: Fondos Insuficientes** ✅

**Pasos:**
1. Completa Pasos 1-3
2. **Paso 4:** Usa tarjeta sin fondos: `4000 0000 0000 9995`
3. Intenta completar el pago

**Verificaciones:**
- [ ] Muestra error relacionado con fondos insuficientes
- [ ] NO avanza al Paso 5
- [ ] El lead **NO se crea**
- [ ] Puedes intentar con otra tarjeta

---

### **6. Manejo de Errores: Tarjeta Expirada** ✅

**Pasos:**
1. Completa Pasos 1-3
2. **Paso 4:** Usa tarjeta expirada: `4000 0000 0000 0069`
3. Intenta completar el pago

**Verificaciones:**
- [ ] Muestra error específico sobre tarjeta expirada
- [ ] NO avanza al Paso 5
- [ ] El lead **NO se crea**

---

### **7. Verificación: Hold de $350 MXN** ✅

**Pasos:**
1. Completa flujo completo con pago exitoso
2. Verifica en Stripe Dashboard

**Verificaciones:**
- [ ] Payment Intent creado con monto exacto: **$350.00 MXN**
- [ ] Status: `Requires capture` (retención, no cobrado)
- [ ] Capture method: `Manual`
- [ ] El dinero está "congelado" en la tarjeta (no cobrado aún)

---

### **8. Verificación: Datos de Pago en Lead** ✅

**Pasos:**
1. Completa flujo completo con pago exitoso
2. Verifica en Supabase Dashboard → Table Editor → `leads`

**Verificaciones:**
- [ ] `payment_method_id`: Contiene `pm_xxxx` (ID de método de pago)
- [ ] `payment_intent_id`: Contiene `pi_xxxx` (ID de Payment Intent)
- [ ] `payment_status`: `authorized` (retención exitosa)
- [ ] Todos los demás campos del lead están completos

---

## 🔄 **PRUEBAS DE FLUJO Y NAVEGACIÓN**

### **9. Navegación: Regresar desde Paso de Pago** ✅

**Pasos:**
1. Llega al Paso 4 (Pago)
2. Haz clic en "Anterior"
3. Vuelve al Paso 4

**Verificaciones:**
- [ ] Puedes regresar al Paso 3
- [ ] Al volver al Paso 4, se reinicializa el SetupIntent
- [ ] Puedes completar el pago normalmente

---

### **10. Navegación: Cerrar Modal Durante Pago** ✅

**Pasos:**
1. Llega al Paso 4 (Pago)
2. Cierra el modal (X)
3. Abre el modal nuevamente

**Verificaciones:**
- [ ] El modal se resetea correctamente
- [ ] No hay estados residuales de pago
- [ ] Puedes iniciar el flujo desde el principio

---

### **11. Múltiples Intentos: Pago Fallido y Reintento** ✅

**Pasos:**
1. Completa Pasos 1-3
2. **Paso 4:** Usa tarjeta rechazada: `4000 0000 0000 0002`
3. Intenta completar el pago (falla)
4. Usa tarjeta válida: `4242 4242 4242 4242`
5. Intenta completar el pago nuevamente

**Verificaciones:**
- [ ] El primer intento falla correctamente
- [ ] Puedes intentar con otra tarjeta
- [ ] El segundo intento funciona
- [ ] Se crea el lead exitosamente

---

## 🔒 **PRUEBAS DE SEGURIDAD**

### **12. Validación: No se Puede Omitir el Pago** ✅

**Pasos:**
1. Abre DevTools (F12) → Console
2. Intenta manipular el estado:
   ```javascript
   // Intentar avanzar sin pago (no debería funcionar)
   ```
3. Intenta crear lead directamente sin pasar por el modal

**Verificaciones:**
- [ ] No se puede manipular el estado para omitir el pago
- [ ] Las validaciones del servidor previenen leads sin pago
- [ ] El código del frontend valida correctamente

---

### **13. Verificación: Tokens No Expuestos** ✅

**Pasos:**
1. Completa flujo con pago
2. Abre DevTools → Network
3. Revisa las llamadas a `stripe-service`

**Verificaciones:**
- [ ] Los números de tarjeta **NO** aparecen en las llamadas
- [ ] Solo se envía `paymentMethodId` (pm_xxxx), no datos de tarjeta
- [ ] Los tokens están encriptados

---

## 🎨 **PRUEBAS DE UX/UI**

### **14. UI: Formulario de Pago se Muestra Correctamente** ✅

**Verificaciones:**
- [ ] El formulario de Stripe se carga correctamente
- [ ] Los campos son claros y legibles
- [ ] El mensaje informativo sobre retención de $350 MXN es visible
- [ ] El botón "Guardar Tarjeta y Continuar" funciona

---

### **15. UI: Estados de Carga** ✅

**Pasos:**
1. Llega al Paso 4 (Pago)
2. Observa el estado de carga

**Verificaciones:**
- [ ] Muestra "Cargando sistema de pagos..." mientras inicializa
- [ ] El spinner se muestra correctamente
- [ ] El formulario aparece cuando está listo

---

### **16. UI: Mensajes de Error Claros** ✅

**Verificaciones:**
- [ ] Los errores de tarjeta son claros y específicos
- [ ] Los errores de red son informativos
- [ ] Los errores sugieren soluciones

---

## 🔧 **PRUEBAS DE INTEGRACIÓN**

### **17. Integración: Edge Function `stripe-service`** ✅

**Pasos:**
1. Completa flujo con pago
2. Verifica en Supabase Dashboard → Edge Functions → `stripe-service` → Logs

**Verificaciones:**
- [ ] Se llama `create-setup-intent` correctamente
- [ ] Se llama `authorize-hold` correctamente
- [ ] Ambas llamadas retornan `success: true`
- [ ] No hay errores en los logs

---

### **18. Integración: Supabase Database** ✅

**Verificaciones:**
- [ ] Las columnas de pago existen en la tabla `leads`:
  - [ ] `payment_method_id`
  - [ ] `payment_intent_id`
  - [ ] `payment_status`
- [ ] Los datos se guardan correctamente
- [ ] Los tipos de datos son correctos

---

### **19. Integración: Stripe Dashboard** ✅

**Verificaciones:**
- [ ] Los Payment Intents se crean correctamente
- [ ] Los Setup Intents se crean correctamente
- [ ] Los Customers se crean/actualizan correctamente
- [ ] Los metadatos están completos

---

## 📱 **PRUEBAS DE RESPONSIVIDAD**

### **20. Mobile: Formulario de Pago en Móvil** ✅

**Pasos:**
1. Abre la aplicación en un dispositivo móvil (o DevTools → Toggle device toolbar)
2. Completa el flujo hasta el Paso 4

**Verificaciones:**
- [ ] El formulario de pago se adapta a pantallas pequeñas
- [ ] Los campos son fáciles de usar en móvil
- [ ] El teclado numérico aparece para campos de tarjeta
- [ ] No hay problemas de scroll o layout

---

## ⚡ **PRUEBAS DE RENDIMIENTO**

### **21. Tiempo de Respuesta: Inicialización de Pago** ✅

**Verificaciones:**
- [ ] El SetupIntent se inicializa en menos de 3 segundos
- [ ] El formulario de pago aparece rápidamente
- [ ] No hay delays excesivos

---

### **22. Tiempo de Respuesta: Autorización de Hold** ✅

**Verificaciones:**
- [ ] La autorización de hold se completa en menos de 5 segundos
- [ ] El lead se crea rápidamente después del pago
- [ ] No hay timeouts

---

## 🧪 **PRUEBAS DE EDGE CASES**

### **23. Edge Case: Usuario Cierra Navegador Durante Pago** ✅

**Pasos:**
1. Llega al Paso 4 (Pago)
2. Ingresa tarjeta pero NO completas
3. Cierra el navegador
4. Vuelve a abrir y crea un nuevo lead

**Verificaciones:**
- [ ] No hay estados residuales
- [ ] Puedes crear un nuevo lead normalmente
- [ ] No hay Payment Intents "huérfanos" en Stripe

---

### **24. Edge Case: Múltiples Leads Rápidos** ✅

**Pasos:**
1. Crea un lead con pago exitoso
2. Inmediatamente crea otro lead con pago

**Verificaciones:**
- [ ] Ambos leads se crean correctamente
- [ ] Cada uno tiene su propio Payment Intent
- [ ] No hay conflictos o errores

---

### **25. Edge Case: Cambio de Servicio Después de Pago** ✅

**Pasos:**
1. Completa Pasos 1-3
2. Completa Paso 4 (Pago)
3. En Paso 5, intenta regresar y cambiar el servicio

**Verificaciones:**
- [ ] El comportamiento es consistente
- [ ] El pago sigue siendo válido
- [ ] El lead se crea con el servicio correcto

---

## 🔍 **PRUEBAS DE VERIFICACIÓN EN PRODUCCIÓN**

### **26. Verificación: Feature Flag en Producción** ✅

**Antes de activar en producción:**

**Verificaciones:**
- [ ] El feature flag está configurado en Vercel Environment Variables
- [ ] `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true` en producción
- [ ] `STRIPE_SECRET_KEY` está configurado en Supabase Secrets (producción)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` está configurado (clave de producción, no test)

---

### **27. Verificación: Stripe en Modo Producción** ✅

**Verificaciones:**
- [ ] Estás usando claves de **producción** (no test):
  - [ ] `pk_live_...` (no `pk_test_...`)
  - [ ] `sk_live_...` (no `sk_test_...`)
- [ ] Las tarjetas de prueba NO funcionan en producción
- [ ] Las tarjetas reales funcionan correctamente

---

### **28. Verificación: Webhooks de Stripe (Opcional)** ✅

**Si implementas webhooks:**

**Verificaciones:**
- [ ] Webhook configurado en Stripe Dashboard
- [ ] Endpoint de webhook funcionando
- [ ] Eventos se procesan correctamente

---

## 📊 **RESUMEN DE PRUEBAS**

### **Checklist Completo:**

- [ ] **Flujo Completo:** 5 pasos, pago exitoso, lead creado
- [ ] **Validaciones:** No avanzar sin pago, no crear lead sin pago
- [ ] **Errores:** Tarjeta rechazada, sin fondos, expirada
- [ ] **Hold:** $350 MXN retenido correctamente
- [ ] **Datos:** Payment Intent y Payment Method guardados en lead
- [ ] **Navegación:** Regresar, cerrar modal, múltiples intentos
- [ ] **Seguridad:** Tokens no expuestos, validaciones robustas
- [ ] **UX/UI:** Formulario claro, estados de carga, mensajes de error
- [ ] **Integración:** Edge Function, Supabase, Stripe
- [ ] **Responsividad:** Funciona en móvil
- [ ] **Rendimiento:** Tiempos de respuesta aceptables
- [ ] **Edge Cases:** Cerrar navegador, múltiples leads, cambios
- [ ] **Producción:** Feature flag, claves de producción, webhooks

---

## 🚀 **ORDEN DE PRUEBAS RECOMENDADO**

### **Fase 1: Pruebas Básicas (Críticas)**
1. ✅ Flujo completo con pago exitoso
2. ✅ Validación: No avanzar sin pago
3. ✅ Validación: No crear lead sin pago
4. ✅ Manejo de errores: Tarjeta rechazada

### **Fase 2: Pruebas de Integración**
5. ✅ Verificación: Hold de $350 MXN
6. ✅ Verificación: Datos de pago en lead
7. ✅ Integración: Edge Function
8. ✅ Integración: Stripe Dashboard

### **Fase 3: Pruebas de UX y Edge Cases**
9. ✅ Navegación y flujo
10. ✅ UI y responsividad
11. ✅ Edge cases

### **Fase 4: Preparación para Producción**
12. ✅ Verificación: Feature flag en producción
13. ✅ Verificación: Stripe en modo producción
14. ✅ Verificación: Webhooks (si aplica)

---

## ⚠️ **SEÑALES DE ALERTA (No Pasar a Producción Si...)**

- ❌ El lead se crea sin pasar por el pago
- ❌ El pago no se autoriza correctamente
- ❌ Los datos de pago no se guardan en el lead
- ❌ Hay errores en los logs de Edge Function
- ❌ El formulario de pago no se carga
- ❌ Los errores no se manejan correctamente
- ❌ Hay problemas de seguridad (tokens expuestos)

---

## ✅ **CRITERIOS DE APROBACIÓN PARA PRODUCCIÓN**

**Debe cumplir TODOS estos criterios:**

1. ✅ Flujo completo funciona end-to-end
2. ✅ El pago es obligatorio antes de crear el lead
3. ✅ Los errores se manejan correctamente
4. ✅ Los datos se guardan correctamente en Supabase
5. ✅ Los Payment Intents se crean correctamente en Stripe
6. ✅ No hay problemas de seguridad
7. ✅ La UX es clara y funcional
8. ✅ Funciona en móvil y desktop
9. ✅ Los tiempos de respuesta son aceptables
10. ✅ Feature flag y claves de producción configuradas

---

**Estado:** ✅ Checklist completo listo para ejecutar

**Tiempo Estimado:** 2-3 horas para completar todas las pruebas

**Prioridad:** Ejecutar Fase 1 (Pruebas Básicas) primero

