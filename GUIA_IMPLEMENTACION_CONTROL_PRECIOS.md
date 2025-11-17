# ✅ GUÍA: Implementación de Control de Precios y Prevención de Guerra de Precios

## 📋 **RESUMEN**

Se ha implementado exitosamente el sistema de control de precios que previene la guerra de precios destructiva, garantiza calidad del servicio y protege el margen de los profesionales mediante precios sugeridos por IA y validación de rangos.

---

## 🗄️ **FASE 1: BASE DE DATOS**

### **Scripts SQL ejecutados:**
1. ✅ `supabase/migrations/add-price-control-columns.sql` - Agregar columnas
2. ✅ `supabase/migrations/update-create-lead-with-price-suggestion.sql` - Actualizar función RPC

### **Columnas agregadas:**
- `leads.ai_suggested_price_min` - Precio mínimo sugerido por IA
- `leads.ai_suggested_price_max` - Precio máximo sugerido por IA
- `profiles.pro_tier` - Tier del profesional (ENUM: verified_express, certified_pro, premium_elite)

### **Verificación:**
- ✅ ENUM `pro_tier_type` creado con 3 valores
- ✅ Columnas en `leads` creadas
- ✅ Columna en `profiles` creada
- ✅ Índices creados
- ✅ Constraint de validación creada

---

## 🧠 **FASE 2: EDGE FUNCTION (classify-service)**

### **Archivo modificado:**
- `supabase/functions/classify-service/index.ts`

### **Cambios implementados:**
1. ✅ Función `getPriceEstimationPrompt()` creada
2. ✅ Prompt mejorado con contexto mexicano y ciudad
3. ✅ Validación de precios sugeridos (rango $100-$50,000 MXN)
4. ✅ Respuesta JSON extendida con `precio_estimado_min`, `precio_estimado_max`, `justificacion_precio`
5. ✅ Integración con prompt principal del sistema

### **Características:**
- Considera ubicación (ciudad) para ajustar precios
- Considera urgencia en el cálculo
- Valida que precios estén en rango razonable
- Invierte min/max si están al revés

---

## 💰 **FASE 3: INTERFAZ PROFESIONAL**

### **Archivo modificado:**
- `src/components/dashboard/ConfirmAgreementModal.tsx`

### **Características implementadas:**
1. ✅ **Visualización del rango sugerido:**
   - Banner destacado mostrando rango sugerido por IA
   - Muestra rango permitido según `pro_tier`
   - Indica flexibilidad disponible

2. ✅ **Validación de rango controlado:**
   - Calcula rango permitido basado en precio sugerido ± flexibilidad
   - Flexibilidad según tier:
     - `verified_express`: ±10%
     - `certified_pro`: ±15%
     - `premium_elite`: ±20%
   - Mensajes de error claros si precio está fuera de rango

3. ✅ **Feedback visual:**
   - Indicador si precio está dentro del rango sugerido
   - Advertencia si precio está cerca de límites
   - Preview del acuerdo antes de confirmar

### **Lógica de validación:**
```typescript
const minAllowed = aiPriceMin ? aiPriceMin * (1 - flexibility) : MIN_PRICE;
const maxAllowed = aiPriceMax ? aiPriceMax * (1 + flexibility) : MAX_PRICE;
const isValidPrice = priceValue >= minAllowed && priceValue <= maxAllowed;
```

---

## ⚠️ **FASE 4: ALERTA CLIENTE**

### **Archivo modificado:**
- `src/components/client/AgreementNotificationBanner.tsx`

### **Características implementadas:**
1. ✅ **Cálculo de diferencia de precio:**
   - Compara `agreed_price` con `ai_suggested_price_min`
   - Calcula porcentaje de diferencia

2. ✅ **Alertas por niveles:**
   - **Amarillo (20-40% bajo):** Precio bajo, verificar alcance
   - **Rojo (>40% bajo):** Precio significativamente bajo, advertencia fuerte

3. ✅ **Mensajes educativos:**
   - Explica riesgos de precios muy bajos
   - Sugiere verificar calidad de materiales
   - Sugiere verificar alcance completo

---

## 🔗 **FASE 5: INTEGRACIÓN COMPLETA**

### **Archivos modificados:**

1. **`src/types/supabase.ts`:**
   - Agregado `ai_suggested_price_min`, `ai_suggested_price_max` a `Lead`
   - Agregado `pro_tier` a `Profile`

2. **`src/components/client/AISumeeAssistant.tsx`:**
   - Actualizado `AIClassification` interface con campos de precio
   - Agregado envío de `city` a Edge Function
   - Agregado `ai_suggested_price_min_in` y `ai_suggested_price_max_in` a `create_lead` RPC

3. **`src/components/dashboard/ConfirmAgreementModal.tsx`:**
   - Validación de rango de precio
   - Visualización de rango sugerido
   - Flexibilidad según `pro_tier`

4. **`src/components/client/AgreementNotificationBanner.tsx`:**
   - Alerta de precio bajo
   - Comparación con precio sugerido

---

## 🔄 **FLUJO COMPLETO**

### **1. Cliente crea lead:**
```
AISumeeAssistant → classify-service (con city) → 
  Gemini sugiere precio → 
  create_lead RPC guarda ai_suggested_price_min/max →
  Lead creado con rango de precio
```

### **2. Profesional ve lead:**
```
LeadCard → Muestra rango sugerido (si existe) →
  Botón "Confirmar Acuerdo Final" →
  ConfirmAgreementModal → 
  Valida precio en rango permitido (±flexibilidad según tier) →
  Guarda acuerdo
```

### **3. Cliente recibe notificación:**
```
AgreementNotificationBanner → 
  Compara agreed_price con ai_suggested_price_min →
  Muestra alerta si precio es 20%+ menor →
  Educa sobre riesgos
```

---

## ✅ **VERIFICACIÓN**

### **Checklist de pruebas:**

1. **Base de datos:**
   - [x] Columnas creadas en `leads`
   - [x] Columna creada en `profiles`
   - [x] ENUM `pro_tier_type` creado
   - [x] Función RPC `create_lead` actualizada

2. **Edge Function:**
   - [ ] Desplegar `classify-service` actualizada
   - [ ] Verificar que Gemini sugiere precios
   - [ ] Validar que precios están en rango razonable

3. **Dashboard Profesional:**
   - [ ] Verificar que se muestra rango sugerido
   - [ ] Verificar que validación funciona
   - [ ] Verificar que flexibilidad según tier funciona
   - [ ] Probar con diferentes tiers

4. **Dashboard Cliente:**
   - [ ] Verificar que alerta aparece cuando precio es bajo
   - [ ] Verificar niveles de alerta (amarillo/rojo)
   - [ ] Verificar mensajes educativos

---

## 🚀 **DESPLEGAR EDGE FUNCTION**

### **Opción 1: Supabase CLI**
```bash
supabase functions deploy classify-service
```

### **Opción 2: Supabase Dashboard**
1. Ve a **Edge Functions** → **classify-service**
2. Copia el contenido de `supabase/functions/classify-service/index.ts`
3. Pega en el editor
4. Haz clic en **"Deploy"**

### **Verificar variables de entorno:**
- `GEMINI_API_KEY` debe estar configurada en Supabase Secrets

---

## 📝 **NOTAS IMPORTANTES**

1. **Flexibilidad de precio:**
   - `verified_express`: ±10% del rango sugerido
   - `certified_pro`: ±15% del rango sugerido
   - `premium_elite`: ±20% del rango sugerido

2. **Validación de precios:**
   - Rango mínimo: $100 MXN
   - Rango máximo: $1,000,000 MXN
   - Precios sugeridos por IA: $100 - $50,000 MXN

3. **Alertas al cliente:**
   - 20-40% bajo: Alerta amarilla
   - >40% bajo: Alerta roja

4. **Fallback:**
   - Si IA no sugiere precios, se permite rango completo ($100-$1M)
   - Si no hay rango sugerido, validación usa límites generales

---

## 🐛 **TROUBLESHOOTING**

### **Problema: IA no sugiere precios**
- Verificar que `GEMINI_API_KEY` está configurada
- Verificar que Edge Function está desplegada
- Revisar logs de Edge Function en Supabase Dashboard
- Verificar que el prompt incluye solicitud de precios

### **Problema: Validación no funciona**
- Verificar que `ai_suggested_price_min/max` están en el lead
- Verificar que `pro_tier` está en el perfil del profesional
- Revisar consola para errores de cálculo

### **Problema: Alerta no aparece**
- Verificar que `negotiation_status = 'acuerdo_confirmado'`
- Verificar que `agreed_price` y `ai_suggested_price_min` existen
- Verificar cálculo de diferencia (debe ser >= 20%)

---

## 🎯 **PRÓXIMOS PASOS (Futuro)**

1. **Aprendizaje de precios:**
   - Tabla `price_history` para aprender de acuerdos exitosos
   - Ajustar sugerencias basado en datos históricos

2. **Tiering dinámico:**
   - Promover profesionales a tier superior
   - Basado en calificaciones, volumen, certificaciones

3. **Comparación de mercado:**
   - Mostrar precio promedio del mercado
   - Validar que sugerencia está en línea

4. **Descuentos controlados:**
   - Permitir descuentos promocionales (ej: 10% off)
   - Requerir aprobación para descuentos >15%

---

**Fecha de implementación:** 2024
**Estado:** ✅ COMPLETADO

