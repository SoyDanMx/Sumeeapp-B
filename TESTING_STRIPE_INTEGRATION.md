# 🧪 Testing de Integración de Stripe - Guía Completa

**Fecha:** 2025-11-23  
**Estado:** Listo para testing

---

## ✅ **Pre-requisitos Verificados**

- ✅ `@stripe/react-stripe-js` instalado
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada
- ✅ `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT` no configurado (por defecto `false`)
- ✅ Todos los archivos necesarios existen
- ✅ Build exitoso

---

## 📋 **TEST 1: Flujo Actual (Feature Flag Desactivado)**

### **Objetivo:**
Verificar que el flujo actual funciona igual que antes, sin cambios.

### **Pasos:**

1. **Verificar configuración:**
   ```bash
   # Asegúrate de que NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT NO esté en .env.local
   # O configúralo como: NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=false
   ```

2. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

3. **Abrir navegador:**
   - URL: `http://localhost:3000`
   - Abre DevTools (F12) → Console

4. **Probar flujo completo:**
   - Inicia sesión como cliente
   - Abre el modal de "Solicitar Servicio"
   - **Paso 1:** Selecciona un servicio (ej: Plomería)
   - **Paso 2:** Escribe descripción (mínimo 20 caracteres)
   - **Paso 3:** Ingresa WhatsApp y dirección
   - **Paso 4:** Confirma y envía
   - **Verifica:** NO debe aparecer paso de pago

5. **Verificar en consola:**
   - Busca: `🔍 handleFreeRequestSubmit - Iniciando proceso simplificado`
   - Busca: `✅ ¡ÉXITO! Lead creado con ID:`
   - NO debe aparecer: `💳 Autorizando fondos en Stripe...`

6. **Verificar en Supabase:**
   - Ve a tabla `leads`
   - El lead creado NO debe tener:
     - `payment_method_id`
     - `payment_intent_id`
     - `payment_status`

### **Resultado Esperado:**
✅ Flujo funciona igual que antes, sin paso de pago.

---

## 📋 **TEST 2: Nuevo Flujo con Pago (Feature Flag Activado)**

### **Objetivo:**
Verificar que el nuevo flujo con Stripe funciona correctamente.

### **Pasos:**

1. **Activar feature flag:**
   ```bash
   # Agrega a .env.local:
   echo "NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true" >> .env.local
   ```

2. **Reiniciar servidor:**
   ```bash
   # Detén el servidor (Ctrl+C) y reinicia:
   npm run dev
   ```

3. **Abrir navegador:**
   - URL: `http://localhost:3000`
   - Abre DevTools (F12) → Console y Network

4. **Probar flujo completo:**
   - Inicia sesión como cliente
   - Abre el modal de "Solicitar Servicio"
   - **Paso 1:** Selecciona un servicio (ej: Plomería)
   - **Paso 2:** Escribe descripción (mínimo 20 caracteres)
   - **Paso 3:** Ingresa WhatsApp y dirección
   - **Paso 4:** 💳 **PAGO (NUEVO)**
     - Debe aparecer formulario de Stripe
     - Usa tarjeta de prueba: `4242 4242 4242 4242`
     - Fecha: Cualquier fecha futura (ej: 12/25)
     - CVC: Cualquier 3 dígitos (ej: 123)
     - Código postal: Cualquier código (ej: 12345)
     - Haz clic en "Guardar Tarjeta y Continuar"
   - **Paso 5:** Confirma y envía
     - Debe mostrar: "Tarjeta guardada (Pre-autorización $350 MXN)"

5. **Verificar en consola:**
   - Busca: `💳 Inicializando SetupIntent para guardar tarjeta...`
   - Busca: `✅ SetupIntent creado, clientSecret obtenido`
   - Busca: `✅ PaymentMethod obtenido: pm_xxxx`
   - Busca: `💳 Autorizando fondos en Stripe...`
   - Busca: `✅ Fondos retenidos exitosamente. Payment Intent: pi_xxxx`
   - Busca: `✅ ¡ÉXITO! Lead creado con ID: ... y pago autorizado`

6. **Verificar en Network (DevTools):**
   - Debe haber llamada a: `stripe-service` con `action: 'create-setup-intent'`
   - Debe haber llamada a: `stripe-service` con `action: 'authorize-hold'`
   - Ambas deben retornar `success: true`

7. **Verificar en Supabase:**
   - Ve a tabla `leads`
   - El lead creado DEBE tener:
     - `payment_method_id`: `pm_xxxx` (ID de método de pago)
     - `payment_intent_id`: `pi_xxxx` (ID de Payment Intent)
     - `payment_status`: `authorized` (retención exitosa)

8. **Verificar en Stripe Dashboard:**
   - Ve a: https://dashboard.stripe.com/test/payments
   - Busca el Payment Intent con ID `pi_xxxx`
   - Debe tener:
     - Status: `Requires capture` (retención, no cobrado aún)
     - Amount: $350.00 MXN
     - Capture method: `Manual`

### **Resultado Esperado:**
✅ Flujo completo funciona con pago, hold autorizado, y datos guardados correctamente.

---

## 📋 **TEST 3: Manejo de Errores**

### **Objetivo:**
Verificar que los errores se manejan correctamente.

### **Pasos:**

1. **Tarjeta Rechazada:**
   - Usa tarjeta de prueba: `4000 0000 0000 0002`
   - Debe mostrar error: "Tu tarjeta fue rechazada..."

2. **Sin Fondos:**
   - Usa tarjeta de prueba: `4000 0000 0000 9995`
   - Debe mostrar error relacionado con fondos insuficientes

3. **Error de Conexión:**
   - Desconecta internet temporalmente
   - Intenta completar el pago
   - Debe mostrar error de conexión

### **Resultado Esperado:**
✅ Errores se muestran correctamente y no bloquean la aplicación.

---

## 📋 **TEST 4: Edge Cases**

### **Objetivo:**
Verificar casos límite.

### **Pasos:**

1. **Cerrar modal durante pago:**
   - Llega al paso 4 (Pago)
   - Cierra el modal
   - Abre el modal de nuevo
   - Verifica que no hay estados residuales

2. **Navegar atrás desde paso de pago:**
   - Llega al paso 4 (Pago)
   - Haz clic en "Anterior"
   - Vuelve al paso 4
   - Verifica que se reinicializa el SetupIntent

3. **Múltiples intentos:**
   - Intenta crear un lead con pago
   - Si falla, intenta de nuevo
   - Verifica que no hay estados bloqueados

### **Resultado Esperado:**
✅ Edge cases se manejan correctamente.

---

## 🐛 **Troubleshooting**

### **Problema: "No se pudo cargar el sistema de pagos"**
- **Causa:** Edge Function no está deployada o `STRIPE_SECRET_KEY` no está configurada
- **Solución:** 
  1. Verifica que `stripe-service` esté deployada en Supabase
  2. Verifica que `STRIPE_SECRET_KEY` esté en Supabase Secrets

### **Problema: "Stripe no está inicializado"**
- **Causa:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` no está configurada
- **Solución:** Agrega la clave a `.env.local`

### **Problema: "No se ha proporcionado un método de pago válido"**
- **Causa:** El usuario avanzó al paso 5 sin completar el paso 4
- **Solución:** Verifica que el botón "Siguiente" esté deshabilitado en paso 4 hasta completar el pago

### **Problema: Build falla**
- **Causa:** Errores de TypeScript o imports faltantes
- **Solución:** Ejecuta `npm run build` y corrige los errores

---

## ✅ **Checklist Final**

- [ ] TEST 1: Flujo actual funciona igual (feature flag desactivado)
- [ ] TEST 2: Nuevo flujo con pago funciona (feature flag activado)
- [ ] TEST 3: Manejo de errores funciona
- [ ] TEST 4: Edge cases funcionan
- [ ] Verificación en Supabase: Datos de pago guardados correctamente
- [ ] Verificación en Stripe Dashboard: Payment Intent creado correctamente

---

**Una vez completados todos los tests, la integración está lista para producción.**

