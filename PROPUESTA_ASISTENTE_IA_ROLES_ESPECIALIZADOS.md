# 🎯 Propuesta: Asistente IA con Roles Especializados por Disciplina

## 📋 Resumen Ejecutivo

Implementar una **pantalla de selección previa de disciplinas** que permite al asistente adoptar un **rol especializado** según la disciplina elegida, mejorando significativamente la precisión y el contexto de las respuestas.

---

## 🎨 Diseño de la Solución

### **Fase 1: Pantalla de Selección de Disciplinas**

**Antes de abrir el chat**, mostrar una **grid visual de disciplinas** con:
- Iconos grandes y reconocibles
- Colores distintivos por disciplina
- Animaciones al hover
- Diseño tipo "card" moderno y responsive

### **Fase 2: Roles Especializados**

Cada disciplina activa un **rol específico del asistente**:

| Disciplina | Rol del Asistente | Especialización |
|------------|-------------------|-----------------|
| **Electricidad** | 🎓 Ingeniero Eléctrico | Instalaciones, cableado, tableros, seguridad eléctrica |
| **Plomería** | 🎓 Ingeniero Hidráulico | Sistemas de agua, drenaje, presión, fugas |
| **CCTV** | 🎓 Ingeniero en Sistemas - Especialista en CCTV | Cámaras, monitoreo, seguridad electrónica |
| **Albañilería/Construcción** | 🎓 Arquitecto Constructor | Obras, estructuras, acabados, permisos |
| **Jardinería** | 🎓 Especialista en Jardinería y Gardening | Diseño paisajístico, plantas, riego, mantenimiento |
| **Aire Acondicionado** | 🎓 Ingeniero en HVAC | Climatización, refrigeración, eficiencia energética |
| **Carpintería** | 🎓 Maestro Carpintero | Muebles, estructuras de madera, acabados |
| **Pintura** | 🎓 Arquitecto Especialista en Acabados | Pintura, impermeabilización, acabados arquitectónicos |
| **Limpieza** | 🎓 Especialista en Limpieza Profesional | Limpieza residencial, comercial, industrial |
| **WiFi/Redes** | 🎓 Ingeniero en Redes y Ciberseguridad | Redes, WiFi, seguridad informática |
| **Fumigación** | 🎓 Especialista en Control de Plagas | Fumigación, control integrado de plagas |
| **Cerrajería** | 🎓 Especialista en Seguridad Física | Cerraduras, sistemas de seguridad, acceso |

---

## 🧠 Sistema de Prompts Especializados

### **Estructura del Prompt por Rol:**

```typescript
const ROLE_PROMPTS = {
  electricidad: {
    role: "Ingeniero Eléctrico Certificado",
    expertise: "Instalaciones eléctricas residenciales, comerciales e industriales",
    focus: "Seguridad eléctrica, código eléctrico, eficiencia energética",
    questions: [
      "¿Qué tipo de instalación necesitas? (residencial/comercial/industrial)",
      "¿Es una instalación nueva o reparación?",
      "¿Tienes el diagrama o plano eléctrico?",
      "¿Qué voltaje requiere? (110V/220V)"
    ]
  },
  plomeria: {
    role: "Ingeniero Hidráulico",
    expertise: "Sistemas de agua potable, drenaje, presión y calentamiento",
    focus: "Presión de agua, códigos de plomería, eficiencia hídrica",
    questions: [
      "¿Es una fuga, instalación nueva o mantenimiento?",
      "¿Qué tipo de sistema? (agua fría/caliente/drenaje)",
      "¿Qué presión de agua tienes actualmente?",
      "¿Es para uso residencial o comercial?"
    ]
  },
  // ... más roles
}
```

---

## 💡 Ventajas de la Solución

### **1. Precisión Mejorada**
- ✅ El asistente conoce el contexto desde el inicio
- ✅ Hace preguntas más específicas y relevantes
- ✅ Clasificación más precisa (ej: "lámpara" → Electricidad automáticamente)

### **2. Experiencia de Usuario**
- ✅ Flujo más intuitivo: primero elige disciplina, luego describe
- ✅ El asistente habla como un experto en esa área
- ✅ Respuestas más técnicas y profesionales

### **3. Calibración Automática**
- ✅ No necesita "adivinar" la disciplina
- ✅ El prompt ya está optimizado para esa área
- ✅ Menos errores de clasificación

---

## 🚀 Implementación Propuesta

### **Componente: `DisciplineSelector.tsx`**
- Grid de disciplinas con diseño moderno
- Animaciones suaves
- Responsive (mobile-first)

### **Modificaciones en `AISumeeAssistant.tsx`**
- Estado `selectedDiscipline` y `assistantRole`
- Prompt dinámico según disciplina
- Mensaje de bienvenida personalizado por rol

### **Actualización de `classify-service` Edge Function**
- Recibir `discipline` como parámetro
- Usar prompt especializado según disciplina
- Mejorar clasificación con contexto previo

---

## 📊 Flujo de Usuario Mejorado

```
1. Usuario hace clic en "Agendar Proyecto Pro"
   ↓
2. Se abre modal con grid de disciplinas
   ↓
3. Usuario selecciona "Electricidad"
   ↓
4. Asistente adopta rol: "Ingeniero Eléctrico"
   ↓
5. Mensaje de bienvenida personalizado:
   "¡Hola! Soy tu Ingeniero Eléctrico especialista. 
   Cuéntame sobre tu proyecto eléctrico..."
   ↓
6. Usuario describe: "Deseo instalar una lámpara"
   ↓
7. Asistente ya sabe que es Electricidad (contexto previo)
   ↓
8. Hace preguntas específicas:
   "¿Qué tipo de lámpara? ¿Necesitas nuevo cableado?"
   ↓
9. Clasificación precisa: Electricidad (100% seguro)
   ↓
10. Crea lead con disciplina correcta
```

---

## 🎯 Resultado Esperado

- ✅ **100% de precisión** en clasificación (no más "Otros" incorrectos)
- ✅ **Respuestas más técnicas** y profesionales
- ✅ **Mejor experiencia** del usuario
- ✅ **Menos errores** de clasificación
- ✅ **Asistente más inteligente** y contextualizado

