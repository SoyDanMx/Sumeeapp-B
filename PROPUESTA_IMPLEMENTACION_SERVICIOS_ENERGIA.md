# 🚀 PROPUESTA: Implementación de Servicios de Energía Renovable

## 📋 **RESUMEN EJECUTIVO**

Integración de 2 nuevos servicios especializados de alto valor:
1. **Instalación de Cargadores Eléctricos** (para vehículos eléctricos)
2. **Instalación de Paneles Solares** (energía solar fotovoltaica)

**Enfoque:** Disciplinas independientes con IA especializada y sistema de aprendizaje de precios.

---

## 🎯 **SOLUCIÓN DE VANGUARDIA**

### **1. Arquitectura Modular y Escalable**

- ✅ **Disciplinas independientes** para mejor especialización
- ✅ **Prompts de IA especializados** para cada servicio
- ✅ **Sistema de aprendizaje de precios** automático
- ✅ **UI/UX diferenciada** con badges y colores distintivos
- ✅ **Certificaciones especiales** para profesionales

### **2. Características Premium**

- 🔹 **Evaluación previa inteligente** (opcional)
- 🔹 **Cálculo de ahorro energético** (paneles solares)
- 🔹 **Estimación de capacidad eléctrica** (cargadores)
- 🔹 **Información sobre permisos** y trámites
- 🔹 **Timeline realista** de instalación

---

## 📝 **PLAN DE IMPLEMENTACIÓN DETALLADO**

### **FASE 1: Frontend - Componentes UI**

#### **1.1 AISumeeAssistant.tsx**
- Agregar 2 nuevas opciones de disciplina
- Iconos: `faPlug` (cargadores) y `faSolarPanel` (paneles)
- Colores distintivos y gradientes
- Descripciones especializadas

#### **1.2 servicios/[slug]/page.tsx**
- Agregar páginas de servicio para cada uno
- Información detallada, beneficios, proceso
- Lista de servicios incluidos
- FAQ específico

#### **1.3 Otros componentes**
- Actualizar mapeos de disciplinas
- Agregar a sugerencias de servicios
- Actualizar filtros y búsquedas

### **FASE 2: Backend - Edge Function (IA)**

#### **2.1 classify-service/index.ts**
- Agregar prompts especializados
- Agregar palabras clave de clasificación
- Configurar rangos de precios iniciales
- Lógica de evaluación previa (opcional)

#### **2.2 Prompts Especializados**
- "Ingeniero en Carga Vehicular Eléctrica"
- "Ingeniero en Energía Solar Fotovoltaica"

### **FASE 3: Base de Datos (Opcional)**

#### **3.1 Certificaciones Especiales**
- Agregar campo `certificaciones_especiales` en profiles (opcional)
- Filtrar profesionales por certificaciones

### **FASE 4: Precios y Aprendizaje**

#### **4.1 Rangos Iniciales**
- Cargadores: $5,000 - $15,000 MXN (puede ser más alto para instalaciones complejas)
- Paneles Solares: $80,000 - $300,000 MXN

#### **4.2 Sistema de Aprendizaje**
- Automático con `pricing_model_data`
- Se ajusta según zona y complejidad

---

## 🎨 **ESPECIFICACIONES DE DISEÑO**

### **Cargadores Eléctricos:**
```typescript
{
  id: "cargadores-electricos",
  name: "Cargadores Eléctricos",
  icon: faPlug, // o faBolt
  role: "Ingeniero en Carga Vehicular Eléctrica",
  description: "Instalación de cargadores para vehículos eléctricos",
  gradient: "from-green-500 to-emerald-600",
  color: "text-green-600",
  badge: "⚡ Energía Limpia",
  priceRange: { min: 5000, max: 15000 }
}
```

### **Paneles Solares:**
```typescript
{
  id: "paneles-solares",
  name: "Paneles Solares",
  icon: faSolarPanel, // o faSun
  role: "Ingeniero en Energía Solar",
  description: "Instalación de sistemas fotovoltaicos y energía renovable",
  gradient: "from-yellow-400 to-orange-500",
  color: "text-yellow-600",
  badge: "☀️ Energía Renovable",
  priceRange: { min: 80000, max: 300000 }
}
```

---

## 🔧 **CÓDIGO A IMPLEMENTAR**

### **Archivos a Modificar:**

1. `src/components/client/AISumeeAssistant.tsx`
2. `src/app/servicios/[slug]/page.tsx`
3. `supabase/functions/classify-service/index.ts`
4. `src/components/client/RequestServiceModal.tsx` (si aplica)
5. `src/components/services/DisciplineAIHelper.tsx` (si aplica)

### **Archivos Nuevos (Opcionales):**

1. `src/components/services/EnergyServiceEvaluation.tsx` - Evaluación previa
2. `src/components/services/SolarSavingsCalculator.tsx` - Calculadora de ahorro

---

## 📊 **PALABRAS CLAVE PARA CLASIFICACIÓN IA**

### **Cargadores Eléctricos:**
- "cargador eléctrico", "cargador para auto eléctrico", "EV charger", "carga vehicular", "estación de carga", "cargador Tesla", "NEMA 14-50", "carga nivel 2", "carga nivel 3", "instalar cargador eléctrico"

### **Paneles Solares:**
- "paneles solares", "energía solar", "fotovoltaico", "sistema solar", "paneles fotovoltaicos", "instalación solar", "energía renovable", "ahorro energético", "interconexión CFE", "sistema fotovoltaico"

---

## 💰 **ESTRATEGIA DE PRECIOS**

### **Cargadores Eléctricos:**
- **Instalaciones básicas (poco cableado):** $5,000 MXN
- **Instalaciones comunes (~20m cable):** $13,000 - $15,000 MXN
- **Instalaciones complejas:** $15,000+ MXN
- **Factores:** Distancia al panel eléctrico, complejidad de instalación, calidad del equipo, tipo de cargador

### **Paneles Solares:**
- **Residencial (3-5 kW):** $80,000 - $150,000 MXN
- **Residencial (5-10 kW):** $150,000 - $250,000 MXN
- **Comercial (10+ kW):** $250,000 - $500,000+ MXN
- **Factores:** kW instalados, tipo de panel, inversor, baterías, complejidad de instalación

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Frontend:**
- [ ] Agregar disciplinas a `AISumeeAssistant.tsx`
- [ ] Agregar configuración a `servicios/[slug]/page.tsx`
- [ ] Actualizar mapeos de disciplinas
- [ ] Agregar iconos (instalar paquete si es necesario)
- [ ] Actualizar filtros y búsquedas

### **Backend:**
- [ ] Agregar prompts especializados a `classify-service`
- [ ] Agregar palabras clave de clasificación
- [ ] Configurar rangos de precios iniciales
- [ ] Actualizar prompt genérico con nuevas disciplinas

### **Testing:**
- [ ] Probar clasificación de IA
- [ ] Verificar precios sugeridos
- [ ] Probar flujo completo de creación de lead
- [ ] Verificar UI/UX en móvil y desktop

---

## 🚀 **PRÓXIMOS PASOS**

1. **Revisar y aprobar** esta propuesta
2. **Implementar cambios** en los archivos identificados
3. **Probar** clasificación y precios
4. **Desplegar** a producción
5. **Monitorear** adopción y ajustar según datos reales

---

**¿Proceder con la implementación completa?**

