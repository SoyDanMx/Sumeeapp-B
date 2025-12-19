# 📋 Instrucciones para Verificar Precios en Desarrollo Local

## ✅ Verificación Rápida

### Paso 1: Verificar si las Migraciones se Ejecutaron

**Opción A: Supabase Dashboard**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Abre "SQL Editor"
3. Ejecuta el script de verificación: `scripts/verificar-precios-plomeria.sql`
4. Revisa los resultados

**Opción B: Verificar Directamente en la Base de Datos**
```sql
-- Verificar un servicio específico
SELECT * FROM public.service_catalog 
WHERE discipline = 'plomeria' 
AND service_name = 'Reparación de Fuga de Agua';
```

### Paso 2: Verificar en el Frontend

1. **Abre tu navegador** en `http://localhost:3000`
2. **Ve a la sección de Plomería**: `http://localhost:3000/servicios/plomeria`
3. **Selecciona un servicio** (ej: "Reparación de Fugas")
4. **Verifica que el precio se muestre correctamente**

### Paso 3: Verificar en la Consola del Navegador

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Busca mensajes como:
   - `✅ Servicio encontrado: Reparación de Fuga de Agua`
   - `🔍 Precio: $500 - $2,000 MXN`

---

## 🔍 Cómo Funciona el Sistema de Precios

### Flujo de Datos:

1. **Base de Datos** (`service_catalog`)
   - Los precios se almacenan en la tabla `service_catalog`
   - Cada servicio tiene: `min_price`, `max_price`, `price_type`

2. **Frontend** (`ServiceFormBase.tsx`)
   - El componente hace un `fetch` a Supabase cuando se carga
   - Query: `SELECT * FROM service_catalog WHERE discipline = 'plomeria' AND service_name = '...'`
   - Los precios se muestran dinámicamente según el tipo:
     - `fixed`: `$500 MXN`
     - `range`: `$500 - $2,000 MXN`
     - `starting_at`: `Desde $500 MXN`

3. **Cache del Navegador**
   - Los datos se obtienen en tiempo real desde Supabase
   - No hay cache local, siempre consulta la BD

---

## 🚨 Si los Precios NO se Ven Actualizados

### Problema 1: Las Migraciones No se Ejecutaron

**Solución:**
```bash
# Ejecutar migraciones en Supabase Dashboard
# O usar Supabase CLI:
supabase db push
```

### Problema 2: El Servicio No Existe en la BD

**Solución:**
- Verifica que el `service_name` en `plomeria.ts` coincida exactamente con el de la BD
- Ejecuta los scripts SQL de nuevo

### Problema 3: Cache del Navegador

**Solución:**
- Haz un **Hard Refresh**: `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
- O abre en **Modo Incógnito**

### Problema 4: El Servidor de Desarrollo No Está Conectado a la BD Correcta

**Solución:**
- Verifica las variables de entorno en `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=tu_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
  ```
- Reinicia el servidor: `npm run dev`

---

## 📊 Servicios que Deberían Mostrar Precios Actualizados

### Precios Actualizados (Rangos):
- ✅ **Reparación de Fugas**: $500 - $2,000 MXN
- ✅ **Destape de Drenaje**: $800 - $2,500 MXN
- ✅ **Cambio de Llaves/Grifos**: $600 - $2,000 MXN
- ✅ **Instalación de Sanitarios**: $1,500 - $3,500 MXN
- ✅ **Instalación de Lavabos**: $1,200 - $2,800 MXN
- ✅ **Instalación de Regaderas/Tinas**: $3,000 - $7,000 MXN
- ✅ **Instalación de Calentadores**: $3,000 - $8,000 MXN
- ✅ **Instalación de Tinacos**: $1,500 - $3,500 MXN

### Servicios Nuevos:
- ✅ **Instalación y Mantenimiento de Línea de Gas**: $588 - $883 MXN
- ✅ **Reparación de Fugas en Llaves o Lavabos**: $1,150 - $1,725 MXN
- ✅ **Cambio de Tubería (por metro)**: $300 - $700 MXN
- ✅ **Lavado y Desinfección de Cisternas**: $2,000 - $3,500 MXN

---

## 🧪 Prueba Rápida

### Test 1: Verificar Precio de Reparación de Fugas
1. Ve a: `http://localhost:3000/servicios/plomeria/reparacion-de-fugas`
2. Deberías ver: **$500 - $2,000 MXN** (no $550 o precio fijo)

### Test 2: Verificar Precio de Instalación de Sanitarios
1. Ve a: `http://localhost:3000/servicios/plomeria/instalacion-de-sanitarios`
2. Deberías ver: **$1,500 - $3,500 MXN** (no $800)

### Test 3: Verificar Servicio Nuevo (Línea de Gas)
1. Busca en el catálogo de servicios
2. Deberías ver: **Instalación y Mantenimiento de Línea de Gas: $588 - $883 MXN**

---

## 📝 Notas Importantes

- ⚠️ **Los precios se obtienen en tiempo real** desde Supabase
- ⚠️ **No hay cache local**, siempre consulta la BD
- ⚠️ **Los nombres deben coincidir exactamente** entre `plomeria.ts` y la BD
- ⚠️ **Si cambias precios en la BD**, se reflejan inmediatamente (sin reiniciar servidor)

---

## 🔧 Debugging

Si los precios no se ven, revisa la consola del navegador:

```javascript
// Mensajes esperados:
✅ "Servicio encontrado: Reparación de Fuga de Agua"
✅ "Precio: $500 - $2,000 MXN"

// Mensajes de error:
❌ "Servicio no encontrado: Reparación de Fuga de Agua"
❌ "Error fetching service data: ..."
```

Si ves errores, verifica:
1. Conexión a Supabase
2. Que el servicio exista en la BD
3. Que el nombre coincida exactamente

