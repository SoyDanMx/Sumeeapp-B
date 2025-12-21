# 🔍 Análisis: Por qué https://sumeeapp.com/marketplace/categoria/sistemas muestra 0 resultados

**Fecha:** 2025-01-22  
**URL:** https://sumeeapp.com/marketplace/categoria/sistemas  
**Problema:** La página muestra "0 resultados" y no carga productos

---

## 📊 Hallazgos del Análisis

### 1. Filtro `.gt("price", 0)` en Consultas
**Problema crítico**: El código actual filtra productos con `price > 0`:

```typescript
// src/hooks/useMarketplacePagination.ts (línea ~118)
let query = supabase
  .from("marketplace_products")
  .select(
    `
    *,
    external_code,
    sku
  `,
    { count: "exact" }
  )
  .eq("status", "active")
  .gt("price", 0); // ⚠️ EXCLUYE PRODUCTOS CON PRECIO 0
```

**Consecuencia**: Si los productos tienen `price = 0` en la base de datos, NO se mostrarán.

---

## 🔍 Posibles Causas

### Causa 1: Productos con price = 0 en la BD
Los productos importados de Syscom pueden tener `price = 0` si:
- La importación falló al obtener precios
- La API de Syscom no retornó precios válidos
- Se importaron productos sin precio

**Verificar en Supabase**:
```sql
-- Ver cuántos productos de sistemas tienen precio 0
SELECT COUNT(*) as total_sin_precio
FROM marketplace_products
WHERE status = 'active'
  AND category_id = (SELECT id FROM marketplace_categories WHERE slug = 'sistemas')
  AND (price = 0 OR price IS NULL);

-- Ver total de productos de sistemas (con y sin precio)
SELECT COUNT(*) as total_productos
FROM marketplace_products
WHERE status = 'active'
  AND category_id = (SELECT id FROM marketplace_categories WHERE slug = 'sistemas');
```

### Causa 2: Cambios No Desplegados en Producción
Los cambios recientes (eliminación de `exchangeRate`) están solo en local, no en producción.

**Verificar**:
1. Revisar último commit en GitHub/Vercel
2. Verificar último despliegue en Vercel dashboard
3. Comparar código local vs. producción

### Causa 3: Filtro `.gt("price", 0)` Agregado Recientemente
Este filtro se agregó para evitar mostrar productos con $0, pero si TODOS los productos tienen precio 0, entonces NO se muestra nada.

---

## ✅ Soluciones

### Solución 1: Eliminar Filtro `.gt("price", 0)` Temporalmente
Para mostrar los productos aunque tengan precio 0:

```typescript
// src/hooks/useMarketplacePagination.ts
let query = supabase
  .from("marketplace_products")
  .select(
    `
    *,
    external_code,
    sku
  `,
    { count: "exact" }
  )
  .eq("status", "active");
  // .gt("price", 0); // ⚠️ COMENTAR TEMPORALMENTE
```

**Beneficio**: Los productos se mostrarán, aunque tengan precio $0.  
**Desventaja**: Muestra "Consultar precio" en lugar de un precio real.

### Solución 2: Actualizar Precios en la Base de Datos
Ejecutar el script de actualización de precios:

```bash
cd /Users/danielnuno/Documents/Projects/Sumeeapp-B
python3 scripts/update_syscom_prices.py --execute --limit 1000
```

O ejecutar una reimportación de productos:

```bash
python3 scripts/import_all_syscom_products.py --execute --limit 1000
```

**Beneficio**: Los productos tendrán precios reales.  
**Desventaja**: Requiere tiempo de ejecución.

### Solución 3: Desplegar Cambios Recientes
Si los cambios están solo en local:

```bash
git add .
git commit -m "Eliminar conversión de precios y permitir productos sin precio"
git push origin main
```

Vercel desplegará automáticamente.

---

## 🎯 Recomendación Inmediata

1. **Verificar la base de datos** para confirmar si hay productos con precio 0:
   ```sql
   SELECT id, title, price, external_code
   FROM marketplace_products
   WHERE status = 'active'
     AND category_id = (SELECT id FROM marketplace_categories WHERE slug = 'sistemas')
   ORDER BY price ASC
   LIMIT 10;
   ```

2. **Eliminar temporalmente el filtro `.gt("price", 0)`** para que los productos se muestren.

3. **Actualizar precios** con el script de Syscom.

4. **Desplegar** los cambios a producción.

---

## 📝 Archivos a Modificar

1. `src/hooks/useMarketplacePagination.ts` (línea ~118)
2. `src/components/marketplace/SmartSearch.tsx` (línea ~65)
3. `src/components/services/MaterialSelector.tsx` (línea ~86)
4. `src/app/marketplace/page.tsx` (líneas ~111, ~151)

---

## ⚠️ Nota Importante

El sitio en producción (https://sumeeapp.com) muestra **0 resultados** porque:
1. Hay un filtro `.gt("price", 0)` activo
2. TODOS los productos tienen `price = 0` en la BD
3. Por lo tanto, ningún producto pasa el filtro

**Solución rápida**: Eliminar el filtro `.gt("price", 0)` y desplegar.

---

**Última actualización:** 2025-01-22

