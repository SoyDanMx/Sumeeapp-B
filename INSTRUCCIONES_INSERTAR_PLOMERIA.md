# 📋 Instrucciones: Insertar Servicios de Plomería

## ✅ **PASO 1: Ejecutar en Supabase SQL Editor**

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase/migrations/insert-plomeria-services.sql`
5. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que aparezca el mensaje: "Success. Rows inserted: 13"

---

## ✅ **PASO 2: Verificar los Datos Insertados**

El script incluye una consulta de verificación al final que mostrará los servicios insertados:

**Resultado esperado:**
- 13 servicios de Plomería insertados
- Servicios ordenados por precio (de menor a mayor)

---

## 📊 **Servicios Insertados**

### **1. EQUIPOS MAYORES (Tinacos y Calentadores):**
- Instalación de Tinaco (Azotea): Desde $2,200
- Lavado y Desinfección de Tinaco: $850 (Incluye materiales)
- Instalación de Boiler (Paso/Depósito): Desde $1,100
- Instalación de Calentador Solar: Desde $3,500

### **2. BOMBAS Y PRESIÓN:**
- Cambio de Bomba de Agua (Periférica/Centrífuga): Desde $950
- Instalación de Presurizador (Bajo Tinaco): Desde $1,200
- Automatización (Electroniveles): Desde $950

### **3. BAÑOS Y GRIFERÍA:**
- Cambio de WC (Taza de Baño): $800
- Instalación de Mezcladora (Lavabo/Fregadero): $450
- Instalación de Regadera/Monomando: Desde $650

### **4. REPARACIONES (Urgencias):**
- Destape de Drenaje (Con Máquina): Desde $950
- Reparación de Fuga Visible (Tubo): Desde $550
- Cambio de Herrajes de WC (Sapo/Válvula): $450

---

## 🎨 **Mejoras de UI Implementadas**

### **Badges Visuales:**
- ✅ **"Todo Incluido"** (verde): Si `includes_materials = true`
- 🛠️ **"Solo MO"** (amarillo): Si `includes_materials = false`

### **Tooltip Informativo:**
- Al hacer hover sobre el badge "Solo MO", se muestra:
  > "El precio cubre el trabajo profesional. Los materiales (tubos, llaves, el equipo nuevo) los compra el cliente o se cotizan aparte."

### **Disclaimer Sticky:**
- Nota visible al final del catálogo:
  > "Precios de referencia para CDMX/Área Metropolitana. La mayoría de los servicios incluyen solo mano de obra profesional garantizada. Los materiales (tubos, llaves, equipos) se compran aparte o se cotizan por separado."

---

## ⚠️ **IMPORTANTE**

- ✅ El script **elimina** servicios previos de plomería para evitar duplicados
- ✅ Solo **1 servicio** incluye materiales: "Lavado y Desinfección de Tinaco"
- ✅ Los demás servicios son **solo mano de obra**
- ✅ Los cambios son inmediatos (no requiere recargar la página si ya está abierta)

---

## 🚀 **Siguiente Paso**

Después de ejecutar la migración:
1. Los servicios de Plomería aparecerán en el catálogo
2. Los badges "Solo MO" se mostrarán automáticamente
3. El disclaimer será visible en la parte inferior

---

**Estado:** ✅ SQL listo para ejecutar

