# 📋 Instrucciones: Insertar Servicios de Aire Acondicionado

## ✅ **PASO 1: Ejecutar en Supabase SQL Editor**

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase/migrations/insert-aire-acondicionado-services.sql`
5. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que aparezca el mensaje: "Success. Rows inserted: 13"

---

## ✅ **PASO 2: Verificar los Datos Insertados**

El script incluye una consulta de verificación al final que mostrará los servicios insertados:

**Resultado esperado:**
- 13 servicios de Aire Acondicionado insertados
- Servicios ordenados por precio (de menor a mayor)

---

## 📊 **Servicios Insertados**

### **1. MINISPLITS (Sistemas Split):**
- Instalación de Minisplit 1 Tonelada: $1,500 - $4,000
- Instalación de Minisplit 2 Toneladas: $3,500 - $5,500
- Instalación de Minisplit 3 Toneladas: $5,500 - $8,000

### **2. EQUIPOS CENTRALES (Sistemas más complejos):**
- Instalación de Equipo Central 3 Toneladas: $15,000 - $25,000
- Instalación de Sistema de Ductos Completo: $30,000 - $50,000

### **3. MANTENIMIENTO Y REPARACIONES:**
- Mantenimiento Preventivo (Limpieza): $800 (Incluye materiales)
- Recarga de Gas Refrigerante: Desde $1,200
- Reparación de Fuga de Refrigerante: Desde $1,500
- Cambio de Capacitor: $600
- Limpieza Profunda de Unidad Exterior: $1,000 (Incluye materiales)

### **4. SERVICIOS ESPECIALIZADOS:**
- Adecuación Eléctrica para Minisplit: Desde $2,000
- Instalación de Base/Soporte para Unidad Exterior: $800
- Reparación de Tablero Electrónico: Desde $2,500

---

## 📚 **Referencias de Precios**

Los precios están basados en:
- [Climas Sierra Madre - Precios de Instalación 2025](https://climassierramadre.com/instalacion-de-aire-acondicionado/)
- Precios promedio del mercado mexicano para CDMX/Área Metropolitana
- Incluyen solo mano de obra profesional garantizada

---

## 🎨 **Badges Visuales**

### **Servicios con badge "Solo MO" (amarillo):**
- 11 servicios mostrarán el badge "Solo MO" con tooltip informativo

### **Servicios con badge "Todo Incluido" (verde):**
- 2 servicios incluyen materiales:
  - Mantenimiento Preventivo (Limpieza): $800
  - Limpieza Profunda de Unidad Exterior: $1,000

---

## ⚠️ **IMPORTANTE**

- ✅ El script **elimina** servicios previos de aire acondicionado para evitar duplicados
- ✅ Solo **2 servicios** incluyen materiales (limpieza)
- ✅ Los demás servicios son **solo mano de obra**
- ✅ Los precios son **rangos** para instalaciones (varían según complejidad)
- ✅ Los cambios son inmediatos (no requiere recargar la página si ya está abierta)

---

## 🚀 **Siguiente Paso**

Después de ejecutar la migración:
1. Los servicios de Aire Acondicionado aparecerán en el catálogo
2. Los badges "Solo MO" se mostrarán automáticamente
3. El disclaimer será visible en la parte inferior

---

**Estado:** ✅ SQL listo para ejecutar

**Referencia:** [Climas Sierra Madre - Instalación de Aire Acondicionado](https://climassierramadre.com/instalacion-de-aire-acondicionado/)

