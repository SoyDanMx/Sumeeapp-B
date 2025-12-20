# 🗺️ Roadmap: Mejoras del Formulario de Servicios

## 🎯 Objetivo

Implementar mejoras al formulario de servicios basadas en el análisis de AORA, priorizando las áreas de mayor impacto.

## 📅 Timeline de Implementación

### **Sprint 1 (Semana 1-2): Quick Wins** 🚀

#### 1.1 Resumen Visual del Servicio
**Prioridad**: ⭐⭐⭐ Alta
**Esfuerzo**: 2-3 días
**Archivos**:
- `src/components/services/ServiceSummaryPanel.tsx` (nuevo)
- `src/components/services/ServiceDetailForm.tsx` (modificar)

**Características**:
- Panel lateral que muestra resumen del servicio configurado
- Lista de respuestas del formulario anterior
- Link a condiciones del servicio
- Diseño responsive

#### 1.2 Badge Promocional Destacado
**Prioridad**: ⭐⭐⭐ Alta
**Esfuerzo**: 1 día
**Archivos**:
- `src/components/services/PromotionalBadge.tsx` (nuevo)
- `src/components/services/ServiceSummaryCard.tsx` (modificar)

**Características**:
- Badge circular con "20% OFF" o similar
- Animación sutil (pulse)
- Visible en el resumen del servicio
- Configurable por servicio

#### 1.3 Precio Final Destacado
**Prioridad**: ⭐⭐⭐ Alta
**Esfuerzo**: 1-2 días
**Archivos**:
- `src/components/services/PriceEstimateCard.tsx` (modificar)

**Características**:
- Precio grande y destacado
- Desglose detallado (mano de obra, materiales, descuentos)
- Visualización clara del precio final
- Responsive

### **Sprint 2 (Semana 3-4): Layout y Cupones** 💳

#### 2.1 Layout de Dos Columnas
**Prioridad**: ⭐⭐ Media
**Esfuerzo**: 2-3 días
**Archivos**:
- `src/app/servicios/electricidad/[serviceId]/page.tsx` (modificar)
- `src/components/services/ServiceBookingForm.tsx` (nuevo)

**Características**:
- Grid responsive (1 columna móvil, 2 columnas desktop)
- Formulario a la izquierda (2/3 del ancho)
- Resumen fijo a la derecha (1/3 del ancho)
- Sticky summary en scroll

#### 2.2 Sistema de Cupones Visible
**Prioridad**: ⭐⭐⭐ Alta
**Esfuerzo**: 3-4 días
**Archivos**:
- `src/components/services/CouponInput.tsx` (nuevo)
- `src/app/api/coupons/validate/route.ts` (nuevo)
- `supabase/migrations/create_coupons_table.sql` (nuevo)

**Características**:
- Campo de entrada con botón "Utilizar"
- Validación en tiempo real
- Aplicación de descuento automática
- Mensajes de éxito/error claros
- Tipos de cupones: primera vez, promocional, referido

#### 2.3 Link a Condiciones del Servicio
**Prioridad**: ⭐ Baja
**Esfuerzo**: 1 día
**Archivos**:
- `src/components/services/ServiceConditionsModal.tsx` (ya existe, mejorar)
- `src/components/services/ServiceSummaryPanel.tsx` (modificar)

**Características**:
- Link visible en el resumen
- Modal con condiciones detalladas
- Checkbox de aceptación
- Diseño mejorado

### **Sprint 3 (Semana 5-6): Validación y UX** ✨

#### 3.1 Selección de Fecha/Hora Mejorada
**Prioridad**: ⭐⭐ Media
**Esfuerzo**: 3-4 días
**Archivos**:
- `src/components/services/DateTimeSelector.tsx` (mejorar)
- `src/app/api/services/available-slots/route.ts` (nuevo)

**Características**:
- Campos separados (fecha y hora)
- Validación de disponibilidad
- Horarios disponibles según profesionales cercanos
- Sugerencias inteligentes de horarios

#### 3.2 Validación en Tiempo Real
**Prioridad**: ⭐⭐ Media
**Esfuerzo**: 2-3 días
**Archivos**:
- `src/components/services/ServiceBookingForm.tsx` (modificar)
- `src/lib/validations/serviceBooking.ts` (nuevo)

**Características**:
- Validación de cupones mientras se escribe
- Validación de dirección antes de continuar
- Validación de fecha/hora disponibles
- Mensajes de error claros y útiles

#### 3.3 Guardado de Progreso
**Prioridad**: ⭐ Baja
**Esfuerzo**: 2-3 días
**Archivos**:
- `src/lib/services/draftService.ts` (nuevo)
- `src/components/services/ServiceBookingForm.tsx` (modificar)

**Características**:
- Guardar borrador en localStorage
- Permitir continuar más tarde
- Recordatorios automáticos (opcional)

## 📊 Estructura de Base de Datos

### Nueva Tabla: `coupons`

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'first_time', 'promotional', 'referral'
  discount_percentage NUMERIC(5, 2) NOT NULL,
  discount_amount NUMERIC(10, 2), -- Si es descuento fijo
  min_purchase_amount NUMERIC(10, 2),
  max_discount_amount NUMERIC(10, 2),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER, -- Número máximo de usos
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_from, valid_until);
```

### Nueva Tabla: `coupon_usage`

```sql
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES profiles(user_id),
  lead_id UUID REFERENCES leads(id),
  discount_applied NUMERIC(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
```

## 🎨 Componentes a Crear

### 1. ServiceSummaryPanel
```typescript
// Muestra resumen del servicio configurado
<ServiceSummaryPanel
  serviceName="Instalación de Contactos"
  formData={formData}
  onShowConditions={() => setShowConditions(true)}
/>
```

### 2. PromotionalBadge
```typescript
// Badge de descuento destacado
<PromotionalBadge
  discount={20}
  type="first_time"
  animated
/>
```

### 3. CouponInput
```typescript
// Campo de cupón con validación
<CouponInput
  onCouponApplied={(discount) => setDiscount(discount)}
  onCouponInvalid={(error) => setError(error)}
/>
```

### 4. ServiceBookingForm (Principal)
```typescript
// Formulario completo de reserva
<ServiceBookingForm
  serviceId="instalacion-contactos"
  formData={initialFormData}
  priceEstimate={priceEstimate}
  onComplete={handleComplete}
/>
```

## 📈 Métricas de Éxito

### KPIs a Monitorear:

1. **Tasa de Conversión**
   - Antes: X%
   - Meta: +25-35%
   - Métrica: Leads completados / Visitas al formulario

2. **Tiempo de Completado**
   - Antes: X minutos
   - Meta: -20%
   - Métrica: Tiempo promedio para completar formulario

3. **Tasa de Abandono**
   - Antes: X%
   - Meta: -30%
   - Métrica: Usuarios que abandonan / Usuarios que inician

4. **Uso de Cupones**
   - Meta: 30-40% de usuarios usan cupón
   - Métrica: Cupones aplicados / Formularios completados

5. **Satisfacción del Usuario**
   - Meta: 4.5+ / 5.0
   - Métrica: Encuesta post-servicio

## 🚀 Próximos Pasos Inmediatos

### Esta Semana:
1. ✅ Crear `ServiceSummaryPanel` component
2. ✅ Crear `PromotionalBadge` component
3. ✅ Mejorar `PriceEstimateCard` con desglose

### Próxima Semana:
4. ✅ Implementar layout de dos columnas
5. ✅ Crear sistema de cupones básico
6. ✅ Agregar link a condiciones

### Semana 3-4:
7. ✅ Mejorar selector de fecha/hora
8. ✅ Implementar validación en tiempo real
9. ✅ Testing y refinamiento

## 💡 Notas de Implementación

### Consideraciones Técnicas:

1. **Responsive Design**:
   - Móvil: Una columna, resumen al final
   - Tablet: Dos columnas, resumen sticky
   - Desktop: Dos columnas, resumen fijo

2. **Performance**:
   - Lazy loading de componentes pesados
   - Debounce en validaciones
   - Caché de cupones válidos

3. **Accesibilidad**:
   - Labels claros en todos los campos
   - Navegación por teclado
   - Screen reader friendly
   - Contraste adecuado

4. **SEO**:
   - Meta tags en páginas de servicio
   - Structured data para servicios
   - URLs amigables

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0 - Roadmap de Mejoras*


