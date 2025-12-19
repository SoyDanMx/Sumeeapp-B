# 📋 Plan de Implementación: Formulario Inteligente de Servicios

## 🎯 Objetivo

Implementar un sistema de formulario interactivo similar a AORA para servicios de electricidad, con cotización inteligente usando IA y productos del marketplace.

## 📊 Análisis del Competidor AORA

### URL Analizada:
- **Categoría**: https://aoramx.aoraservicios.com/category/41?name=HOGAR+%26+OFICINA
- **Servicio Específico**: Interruptores (Contactos Eléctricos)

### Flujo Identificado:

1. **Página de Categoría**: Muestra subcategorías como botones
   - Interruptores
   - Contactos
   - Focos
   - Lámparas
   - Ventiladores
   - Regadera Eléctrica

2. **Formulario Interactivo** (al hacer clic en un servicio):
   ```
   Paso 1: ¿Qué necesitas?
   - [Instalar] [Reemplazar] [Visita electricista]
   
   Paso 2: ¿Cuántos?
   - [1] [2] [3] [4] [5]
   
   Paso 3: ¿Tienes los interruptores?
   - [Sí] [No]
   
   Paso 4: ¿Ya existe contacto eléctrico?
   - [Sí] [No]
   
   Paso 5: ¿Necesitas darnos más información?
   - [Campo de texto libre]
   ```

3. **Cotización en Tiempo Real**:
   - Muestra precio estimado mientras el usuario completa el formulario
   - Descuento visible (ej: "20% OFF")
   - Botón "Siguiente >" para continuar

## 🚀 Implementación para SuMee

### Fase 1: Estructura Base (Sprint 1)

#### 1.1 Crear Página de Servicio Detallado

**Archivo**: `src/app/servicios/electricidad/[serviceId]/page.tsx`

```typescript
// Ejemplo: /servicios/electricidad/instalacion-contactos
export default function ServiceDetailPage({ params }: { params: { serviceId: string } }) {
  return (
    <div>
      <ServiceDetailForm 
        serviceId={params.serviceId}
        onComplete={handleComplete}
      />
    </div>
  );
}
```

#### 1.2 Componente ServiceDetailForm

**Archivo**: `src/components/services/ServiceDetailForm.tsx`

```typescript
interface ServiceDetailFormProps {
  serviceId: string;
  serviceName: string;
  onComplete: (data: ServiceFormData) => void;
  onEstimate?: (estimate: PriceEstimate) => void;
}

interface ServiceFormData {
  action: "instalar" | "reemplazar" | "visita";
  quantity: number;
  hasMaterials: boolean;
  hasExistingContact: boolean;
  additionalInfo?: string;
}
```

**Características**:
- Formulario paso a paso con preguntas específicas
- Validación en tiempo real
- Cálculo de precio estimado mientras el usuario completa
- Diseño responsive y mobile-first

#### 1.3 Configuración de Servicios

**Archivo**: `src/lib/services/serviceConfig.ts`

```typescript
export const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  "instalacion-contactos": {
    id: "instalacion-contactos",
    name: "Instalación de Contactos",
    discipline: "electricidad",
    questions: [
      {
        id: "action",
        type: "single",
        label: "¿Qué necesitas?",
        options: [
          { value: "instalar", label: "Instalar", priceModifier: 0 },
          { value: "reemplazar", label: "Reemplazar", priceModifier: -0.1 },
          { value: "visita", label: "Visita electricista", priceModifier: 0.2 },
        ],
        required: true,
        affectsPrice: true,
      },
      {
        id: "quantity",
        type: "number",
        label: "¿Cuántos contactos?",
        min: 1,
        max: 10,
        required: true,
        affectsPrice: true,
      },
      {
        id: "hasMaterials",
        type: "boolean",
        label: "¿Tienes los contactos?",
        required: true,
        affectsPrice: true,
      },
      {
        id: "hasExistingContact",
        type: "boolean",
        label: "¿Ya existe contacto eléctrico instalado?",
        required: true,
        affectsPrice: true,
      },
      {
        id: "additionalInfo",
        type: "text",
        label: "¿Necesitas darnos más información?",
        required: false,
        affectsPrice: false,
      },
    ],
    defaultMaterials: ["contacto eléctrico", "interruptor", "apagador"],
  },
  // Más servicios...
};
```

### Fase 2: Cotización Inteligente (Sprint 2)

#### 2.1 Búsqueda de Productos en Marketplace

**Archivo**: `src/lib/services/marketplaceProductMatcher.ts`

```typescript
export async function findRelevantProducts(
  serviceType: string,
  keywords: string[],
  quantity: number
): Promise<Product[]> {
  // Buscar productos en el marketplace
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .or(keywords.map(k => `title.ilike.%${k}%,description.ilike.%${k}%`).join(","))
    .eq("is_active", true)
    .order("price", { ascending: true })
    .limit(5);

  if (error) throw error;
  return data || [];
}
```

#### 2.2 API de Cotización

**Archivo**: `src/app/api/services/estimate-price/route.ts`

```typescript
export async function POST(request: Request) {
  const { serviceId, formData, location, urgency } = await request.json();

  // 1. Buscar productos si no tiene materiales
  let materialsPrice = 0;
  let materials: Product[] = [];
  
  if (!formData.hasMaterials) {
    const config = SERVICE_CONFIGS[serviceId];
    materials = await findRelevantProducts(
      serviceId,
      config.defaultMaterials || [],
      formData.quantity
    );
    materialsPrice = materials.reduce((sum, p) => sum + p.price, 0) * formData.quantity;
  }

  // 2. Calcular precio de mano de obra con IA
  const laborEstimate = await calculateLaborPrice({
    serviceId,
    action: formData.action,
    quantity: formData.quantity,
    hasExistingContact: formData.hasExistingContact,
    location,
    urgency,
  });

  // 3. Calcular precio total
  const totalPrice = laborEstimate.price + materialsPrice;

  return NextResponse.json({
    laborPrice: laborEstimate.price,
    materialsPrice,
    totalPrice,
    materials,
    breakdown: {
      labor: laborEstimate.breakdown,
      materials: materials.map(m => ({
        product: m,
        quantity: formData.quantity,
        price: m.price * formData.quantity,
      })),
    },
    confidence: laborEstimate.confidence,
  });
}
```

#### 2.3 Componente de Visualización de Cotización

**Archivo**: `src/components/services/PriceEstimateCard.tsx`

```typescript
export function PriceEstimateCard({ estimate }: { estimate: PriceEstimate }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Precio Estimado</h3>
        {estimate.confidence === "high" && (
          <span className="text-green-600 text-sm">✓ Preciso</span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Mano de obra:</span>
          <span className="font-semibold">${estimate.laborPrice.toLocaleString()}</span>
        </div>
        
        {estimate.materialsPrice > 0 && (
          <div className="flex justify-between">
            <span>Materiales:</span>
            <span className="font-semibold">${estimate.materialsPrice.toLocaleString()}</span>
          </div>
        )}
        
        <div className="border-t pt-3 flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span className="text-purple-600">${estimate.totalPrice.toLocaleString()}</span>
        </div>
      </div>
      
      {estimate.materials.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Materiales incluidos:</p>
          <ul className="space-y-1">
            {estimate.materials.map((m, i) => (
              <li key={i} className="text-sm">
                • {m.title} - ${m.price.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Fase 3: Integración con RequestServiceModal (Sprint 3)

#### 3.1 Prellenado de Datos

**Modificar**: `src/components/client/RequestServiceModal.tsx`

```typescript
// Agregar nueva prop
interface RequestServiceModalProps {
  // ... props existentes
  serviceFormData?: ServiceFormData; // Datos del formulario detallado
  priceEstimate?: PriceEstimate; // Cotización calculada
}

// En el componente, prellenar con los datos
useEffect(() => {
  if (serviceFormData) {
    // Construir descripción detallada
    const description = buildServiceDescription(serviceFormData);
    
    setFormData(prev => ({
      ...prev,
      servicio: "electricidad",
      descripcion: description,
    }));
    
    // Si hay cotización, mostrarla
    if (priceEstimate) {
      // Mostrar precio estimado en el modal
    }
  }
}, [serviceFormData, priceEstimate]);
```

#### 3.2 Función para Construir Descripción

```typescript
function buildServiceDescription(formData: ServiceFormData): string {
  const parts = [];
  
  parts.push(`Servicio: ${formData.action === "instalar" ? "Instalación" : formData.action === "reemplazar" ? "Reemplazo" : "Visita"} de contactos eléctricos`);
  parts.push(`Cantidad: ${formData.quantity} contacto(s)`);
  parts.push(`Materiales: ${formData.hasMaterials ? "Cliente proporciona" : "Necesario cotizar"}`);
  parts.push(`Contacto existente: ${formData.hasExistingContact ? "Sí" : "No"}`);
  
  if (formData.additionalInfo) {
    parts.push(`Información adicional: ${formData.additionalInfo}`);
  }
  
  return parts.join(". ") + ".";
}
```

#### 3.3 Redirección desde Página de Servicio

```typescript
// En ServiceDetailForm
const handleComplete = async (formData: ServiceFormData) => {
  // Calcular cotización
  const estimate = await calculatePriceEstimate(formData);
  
  // Redirigir a dashboard con datos prellenados
  const params = new URLSearchParams({
    service: "electricidad",
    serviceName: "Instalación de contactos",
    formData: JSON.stringify(formData),
    estimate: JSON.stringify(estimate),
  });
  
  router.push(`/dashboard/client?${params.toString()}`);
};
```

### Fase 4: Actualizar Página de Electricidad (Sprint 1)

#### 4.1 Modificar Página Principal

**Archivo**: `src/app/servicios/electricidad/page.tsx` (crear si no existe)

```typescript
export default function ElectricidadPage() {
  const services = [
    {
      id: "instalacion-contactos",
      name: "Instalación de contactos",
      icon: faPlug,
      description: "Instalación profesional de contactos eléctricos",
    },
    {
      id: "instalacion-interruptores",
      name: "Instalación de interruptores",
      icon: faLightbulb,
      description: "Instalación y reparación de interruptores",
    },
    // Más servicios...
  ];

  return (
    <div>
      <h1>Servicios de Electricidad</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {services.map(service => (
          <Link
            key={service.id}
            href={`/servicios/electricidad/${service.id}`}
            className="service-card"
          >
            <FontAwesomeIcon icon={service.icon} />
            <h3>{service.name}</h3>
            <p>{service.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## 📊 Estructura de Base de Datos

### Nueva Tabla: `service_forms`

```sql
CREATE TABLE service_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  config JSONB NOT NULL, -- Configuración del formulario
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_service_forms_service_id ON service_forms(service_id);
CREATE INDEX idx_service_forms_discipline ON service_forms(discipline);
```

### Nueva Tabla: `service_estimates`

```sql
CREATE TABLE service_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  service_id TEXT NOT NULL,
  form_data JSONB NOT NULL,
  labor_price NUMERIC(10, 2) NOT NULL,
  materials_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  materials JSONB, -- Array de productos cotizados
  confidence TEXT NOT NULL, -- "high", "medium", "low"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_service_estimates_lead_id ON service_estimates(lead_id);
CREATE INDEX idx_service_estimates_service_id ON service_estimates(service_id);
```

## 🧪 Testing

### Casos de Prueba:

1. **Formulario Completo**:
   - Usuario completa todos los pasos
   - Verificar que se calcula precio correctamente
   - Verificar que se redirige con datos prellenados

2. **Búsqueda de Productos**:
   - Usuario no tiene materiales
   - Verificar que se buscan productos relevantes
   - Verificar que se calcula precio de materiales

3. **Prellenado de Lead**:
   - Verificar que descripción incluye toda la información
   - Verificar que servicio y disciplina están correctos
   - Verificar que cotización se guarda

## 📈 Métricas a Monitorear

1. **Tasa de Conversión**:
   - % usuarios que completan formulario
   - % usuarios que llegan a registro de lead
   - % leads que se convierten en trabajos

2. **Precisión de Cotización**:
   - Diferencia promedio entre estimado y precio final
   - Tasa de aceptación de cotizaciones

3. **Tiempo de Proceso**:
   - Tiempo promedio para completar formulario
   - Tiempo desde formulario hasta lead registrado

## 🚀 Próximos Pasos

1. **Crear estructura base** (Sprint 1)
2. **Implementar búsqueda de productos** (Sprint 2)
3. **Integrar con IA para cotización** (Sprint 2)
4. **Conectar con RequestServiceModal** (Sprint 3)
5. **Testing y refinamiento** (Sprint 4)
6. **Extender a otros servicios** (Sprint 5+)

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0 - Plan de Implementación*

