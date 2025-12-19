# 💡 Propuesta: Sistema de Formulario Inteligente para Servicios (Inspirado en AORA)

## 🎯 Objetivo

Implementar un sistema de formulario interactivo paso a paso para servicios de electricidad (y extensible a otros servicios) que:
1. Guía al usuario a través de preguntas específicas
2. Calcula precio estimado usando IA y productos del marketplace
3. Prellena automáticamente el registro de lead con toda la información

## 📊 Análisis del Competidor (AORA)

### Flujo Actual de AORA:
```
1. Usuario selecciona categoría (Electricidad)
   ↓
2. Ve subcategorías como botones (Interruptores, Contactos, Focos, etc.)
   ↓
3. Al hacer clic en "Interruptores", abre formulario interactivo:
   - ¿Qué necesitas? (Instalar / Reemplazar / Visita electricista)
   - ¿Cuántos? (1, 2, 3, 4, 5)
   - ¿Tienes los interruptores? (Sí / No)
   - ¿Ya existe contacto eléctrico? (Sí / No)
   - ¿Necesitas darnos más información? (Campo de texto)
   ↓
4. Muestra precio estimado en tiempo real
   ↓
5. Botón "Siguiente" para continuar
```

### Ventajas de AORA:
✅ **UX Guiada**: El usuario no se siente abrumado, paso a paso
✅ **Precio Transparente**: Muestra estimado antes de confirmar
✅ **Específico**: Preguntas relevantes para cada tipo de servicio
✅ **Visual**: Botones grandes y claros, fácil de usar en móvil

## 🚀 Propuesta de Valor para SuMee

### Diferenciadores Competitivos:

1. **IA Avanzada para Cotización**
   - Usa productos del marketplace para cotizar materiales
   - Considera ubicación, urgencia y complejidad
   - Aprende de leads históricos para mejorar precisión

2. **Integración con Marketplace**
   - Si el usuario no tiene materiales, se cotizan automáticamente
   - Precios reales del marketplace, no estimados genéricos
   - Opción de incluir materiales en el servicio

3. **Prellenado Inteligente**
   - Toda la información del formulario se prellena en el lead
   - Reduce fricción: usuario solo confirma y completa contacto
   - Mejor experiencia = mayor conversión

4. **Extensible a Todos los Servicios**
   - Sistema modular que se adapta a cualquier disciplina
   - Configuración por servicio (preguntas, opciones, precios)

## 🏗️ Arquitectura Técnica

### Componentes Principales:

#### 1. **ServiceDetailForm Component**
```typescript
interface ServiceDetailFormProps {
  serviceId: string; // "instalacion-contactos"
  serviceName: string; // "Instalación de contactos"
  onComplete: (formData: ServiceFormData) => void;
  onEstimate: (estimate: PriceEstimate) => void;
}

interface ServiceFormData {
  action: "instalar" | "reemplazar" | "visita";
  quantity: number;
  hasMaterials: boolean;
  hasExistingContact: boolean;
  additionalInfo?: string;
  materialsNeeded?: Product[];
}
```

#### 2. **PriceEstimationService**
```typescript
interface PriceEstimate {
  laborPrice: number;
  materialsPrice: number;
  totalPrice: number;
  breakdown: {
    labor: { hours: number; rate: number; total: number };
    materials: Array<{ product: Product; quantity: number; price: number }>;
  };
  confidence: "high" | "medium" | "low";
}
```

#### 3. **MarketplaceProductMatcher**
```typescript
// Busca productos relevantes en el marketplace
async function findRelevantProducts(
  serviceType: string,
  action: string,
  quantity: number
): Promise<Product[]> {
  // Busca productos como "contacto eléctrico", "interruptor", etc.
  // Filtra por categoría, precio, disponibilidad
  // Retorna productos ordenados por relevancia
}
```

#### 4. **AI Price Calculator**
```typescript
// Usa la Edge Function existente + productos del marketplace
async function calculateServicePrice(
  formData: ServiceFormData,
  location: string,
  urgency: string
): Promise<PriceEstimate> {
  // 1. Busca productos en marketplace
  // 2. Calcula precio de materiales
  // 3. Usa IA para estimar mano de obra
  // 4. Combina ambos para precio total
}
```

## 📋 Flujo Completo de Implementación

### Fase 0: Formulario de Necesidades (Ya analizado)
- ¿Qué necesitas? (Instalar/Reemplazar/Visita)
- ¿Cuántos?
- ¿Tienes los materiales?
- ¿Ya existe contacto eléctrico?
- Información adicional

### Fase 1: Estructura Base

1. **Crear página de servicio detallado**
   - `/servicios/electricidad/instalacion-contactos`
   - Componente `ServiceDetailForm`

2. **Configuración de servicios**
   - Base de datos o JSON con preguntas por servicio
   - Estructura flexible para agregar nuevos servicios

3. **Integración con RequestServiceModal**
   - Prellenar datos del formulario detallado
   - Mantener flujo existente de 4 pasos

### Fase 2: Cotización Inteligente

1. **Búsqueda de productos en marketplace**
   - API endpoint para buscar productos por keywords
   - Filtrado por categoría, precio, disponibilidad

2. **Cálculo de precio con IA**
   - Extender Edge Function `classify-service`
   - Incluir productos del marketplace en el cálculo
   - Retornar breakdown detallado

3. **Visualización de cotización**
   - Componente que muestra:
     - Precio de mano de obra
     - Precio de materiales (si aplica)
     - Precio total
     - Desglose detallado

### Fase 3: Formulario de Reserva Completo

1. **Sección de Cuenta**
   - Opción para usuarios nuevos: "Agregar datos personales"
   - Opción para usuarios existentes: "Ya tengo cuenta"
   - Integración con sistema de autenticación existente

2. **Sección de Ubicación**
   - Agregar nueva dirección
   - Seleccionar de direcciones guardadas
   - Autocompletado con Google Maps API
   - Validación de coordenadas

3. **Selector de Fecha y Hora**
   - Calendario interactivo
   - Horarios disponibles según profesionales cercanos
   - Sugerencias inteligentes de horarios

4. **Sistema de Cupones**
   - Validación en tiempo real
   - Descuentos promocionales
   - Cupones de primera vez
   - Programa de referidos

5. **Modal de Condiciones del Servicio**
   - Qué incluye el servicio base
   - Servicios adicionales disponibles
   - Garantía y términos
   - Checkbox de aceptación

6. **Resumen del Servicio (Panel Derecho)**
   - Desglose de precios
   - Precio final con descuentos
   - Botón de confirmación
   - Link a condiciones

### Fase 4: Prellenado y Registro

1. **Prellenado de RequestServiceModal**
   - Pasar datos del formulario detallado
   - Prellenar descripción con información recopilada
   - Prellenar servicio y disciplina

2. **Optimización de UX**
   - Mostrar resumen antes de enviar
   - Permitir edición antes de confirmar
   - Guardar borrador si el usuario abandona

## 🎨 Diseño UX/UI

### Página de Servicio Detallado:

```
┌─────────────────────────────────────┐
│  ← Electricidad                     │
│                                     │
│  Instalación de Contactos           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ¿Qué necesitas?               │ │
│  │ [Instalar] [Reemplazar]       │ │
│  │ [Visita electricista]         │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ¿Cuántos contactos?           │ │
│  │ [1] [2] [3] [4] [5]           │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ¿Tienes los contactos?        │ │
│  │ [Sí] [No]                     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ¿Ya existe contacto?          │ │
│  │ [Sí] [No]                     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Información adicional         │ │
│  │ [Campo de texto]              │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Precio Estimado               │ │
│  │ Mano de obra: $800            │ │
│  │ Materiales: $450 (2 contactos)│ │
│  │ Total: $1,250                 │ │
│  │                               │ │
│  │ [Pedir Servicio]              │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 💻 Implementación Técnica

### 1. Estructura de Datos

```typescript
// Configuración de servicios
interface ServiceConfig {
  id: string;
  name: string;
  discipline: string;
  questions: Question[];
  defaultMaterials?: string[]; // Keywords para buscar productos
}

interface Question {
  id: string;
  type: "single" | "multiple" | "number" | "text" | "boolean";
  label: string;
  options?: Option[];
  required: boolean;
  affectsPrice?: boolean; // Si la respuesta afecta el precio
}

interface Option {
  value: string;
  label: string;
  priceModifier?: number; // Modificador de precio (ej: +20%)
}
```

### 2. API Endpoints

```typescript
// GET /api/services/electricidad/instalacion-contactos
// Retorna configuración del formulario

// POST /api/services/estimate-price
// Calcula precio estimado
{
  serviceId: string;
  formData: ServiceFormData;
  location: string;
  urgency: string;
}
// Retorna: PriceEstimate

// GET /api/marketplace/products/search
// Busca productos relevantes
{
  keywords: string[];
  category?: string;
  maxPrice?: number;
  limit?: number;
}
// Retorna: Product[]
```

### 3. Integración con RequestServiceModal

```typescript
// Al completar el formulario detallado:
const handleServiceFormComplete = (formData: ServiceFormData) => {
  // Construir descripción detallada
  const description = buildServiceDescription(formData);
  
  // Abrir RequestServiceModal con datos prellenados
  router.push(`/dashboard/client?service=electricidad&serviceName=Instalación de contactos&description=${encodeURIComponent(description)}&formData=${encodeURIComponent(JSON.stringify(formData))}`);
};
```

## 📈 Métricas de Éxito

### KPIs a Monitorear:

1. **Tasa de Conversión**
   - % de usuarios que completan el formulario detallado
   - % de usuarios que llegan al registro de lead
   - % de leads que se convierten en trabajos

2. **Precisión de Cotización**
   - Diferencia entre precio estimado y precio final
   - Tasa de aceptación de cotizaciones

3. **Tiempo de Proceso**
   - Tiempo promedio para completar formulario
   - Tiempo desde formulario hasta lead registrado

4. **Satisfacción del Usuario**
   - Feedback sobre claridad del proceso
   - Facilidad de uso

## 🎁 Beneficios Esperados

### Para Clientes:
- ✅ **Transparencia**: Saben el precio antes de contratar
- ✅ **Facilidad**: Proceso guiado, sin confusión
- ✅ **Rapidez**: Cotización en minutos, no días
- ✅ **Confianza**: Precios basados en datos reales

### Para Profesionales:
- ✅ **Leads Mejor Calificados**: Información detallada desde el inicio
- ✅ **Menos Preguntas**: Todo está en la descripción
- ✅ **Precios Justos**: Basados en mercado real

### Para la Plataforma:
- ✅ **Mayor Conversión**: Menos fricción = más leads
- ✅ **Diferenciación**: Sistema único en el mercado
- ✅ **Datos Valiosos**: Información estructurada para ML
- ✅ **Escalabilidad**: Fácil agregar nuevos servicios

## 🔮 Roadmap de Implementación

### Sprint 1 (Semana 1-2):
- [ ] Crear estructura base de ServiceDetailForm
- [ ] Configuración de servicios en base de datos
- [ ] Página de servicio detallado básica

### Sprint 2 (Semana 3-4):
- [ ] Integración con búsqueda de productos
- [ ] Cálculo de precio con IA
- [ ] Visualización de cotización

### Sprint 3 (Semana 5-6):
- [ ] Prellenado de RequestServiceModal
- [ ] Optimización de UX
- [ ] Testing y refinamiento

### Sprint 4 (Semana 7-8):
- [ ] Extensión a otros servicios
- [ ] Analytics y métricas
- [ ] Documentación

## 🛠️ Archivos a Crear/Modificar

### Nuevos Archivos:
1. `src/components/services/ServiceDetailForm.tsx`
2. `src/components/services/PriceEstimateCard.tsx`
3. `src/lib/services/serviceConfig.ts`
4. `src/lib/services/priceCalculator.ts`
5. `src/app/api/services/estimate-price/route.ts`
6. `src/app/servicios/electricidad/[serviceId]/page.tsx`

### Archivos a Modificar:
1. `src/app/servicios/electricidad/page.tsx` - Agregar botones
2. `src/components/client/RequestServiceModal.tsx` - Prellenado
3. `src/app/api/marketplace/products/search/route.ts` - Nueva ruta
4. `supabase/functions/classify-service/index.ts` - Extender para productos

## 💡 Propuesta de Vanguardia Tecnológica

### 1. **Machine Learning para Precios**
- Entrenar modelo con leads históricos
- Mejorar precisión con el tiempo
- Ajustar precios por zona, temporada, demanda

### 2. **Recomendaciones Inteligentes**
- Sugerir productos complementarios
- Recomendar servicios relacionados
- Personalizar según historial del usuario

### 3. **Chatbot Integrado**
- Asistente virtual para dudas
- Guía durante el proceso
- Respuestas instantáneas

### 4. **Realidad Aumentada (Futuro)**
- Visualizar productos en el espacio
- Medir distancias automáticamente
- Preview del resultado final

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0 - Propuesta Inicial*

