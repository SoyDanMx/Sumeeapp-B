# 📋 Instrucciones: Actualizar Precios de Servicios

## ✅ **PASO 1: Ejecutar en Supabase SQL Editor**

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase/migrations/update-service-prices.sql`
5. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que aparezca el mensaje: "Success. Rows updated: 4"

---

## ✅ **PASO 2: Verificar los Cambios**

El script incluye una consulta de verificación al final que mostrará los precios actualizados:

**Resultado esperado:**
- Instalación de Contacto: $350.00
- Instalación de Apagador: $350.00
- Instalación de Lámpara: $500.00
- Instalación de Mufa: $1,200.00

---

## 📊 **Precios Actualizados**

| Servicio | Precio Anterior | Precio Nuevo |
|----------|----------------|--------------|
| Instalación de Contacto | $150 | **$350** |
| Instalación de Apagador | $200 | **$350** |
| Instalación de Lámpara | $350 | **$500** |
| Instalación de Mufa | $2,900 | **$1,200** |

---

## ⚠️ **IMPORTANTE**

- ✅ Solo se actualizan estos 4 servicios
- ✅ Los demás precios se mantienen igual
- ✅ El campo `updated_at` se actualiza automáticamente
- ✅ Los cambios son inmediatos (no requiere recargar la página si ya está abierta)

---

## 🚀 **Siguiente Paso**

Después de ejecutar la migración, los nuevos precios aparecerán automáticamente en el catálogo de servicios.

---

**Estado:** ✅ SQL listo para ejecutar

