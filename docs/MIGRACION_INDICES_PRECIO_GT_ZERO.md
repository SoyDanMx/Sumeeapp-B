# Migración: Optimización de Índices para Productos con Precio > 0

**Fecha:** 2025-01-22  
**Archivo:** `supabase/migrations/20250122_optimize_price_gt_zero_indexes.sql`

---

## 📋 Descripción

Esta migración crea índices parciales optimizados para las consultas del marketplace que excluyen productos con precio 0. Los índices parciales solo incluyen filas que cumplen la condición `status = 'active' AND price > 0`, lo que los hace más eficientes y ocupan menos espacio.

---

## 🎯 Objetivo

Optimizar el rendimiento de las consultas que ya implementan el filtro `.gt("price", 0)` en el código, mejorando:
- Velocidad de búsquedas
- Rendimiento de filtros por categoría
- Consultas de rango de precio
- Búsquedas de texto completo

---

## 📊 Índices Creados

### 1. `idx_marketplace_products_active_price_gt_zero`
- **Campos:** `category_id, price, created_at DESC`
- **Condición:** `status = 'active' AND price > 0`
- **Uso:** Consultas principales del marketplace por categoría

### 2. `idx_marketplace_products_title_description_price_gt_zero_trgm`
- **Tipo:** GIN (búsqueda de texto)
- **Campos:** `title || ' ' || description`
- **Condición:** `status = 'active' AND price > 0`
- **Uso:** Búsquedas de texto en SmartSearch y MaterialSelector

### 3. `idx_marketplace_products_price_range_active_gt_zero`
- **Campos:** `price`
- **Condición:** `status = 'active' AND price > 0`
- **Uso:** Filtros de rango de precio (minPrice, maxPrice)

### 4. `idx_marketplace_products_category_price_active_gt_zero`
- **Campos:** `category_id, price, views_count DESC, likes_count DESC`
- **Condición:** `status = 'active' AND price > 0`
- **Uso:** Consultas por categoría con ordenamiento por popularidad

### 5. `idx_marketplace_products_condition_price_active_gt_zero`
- **Campos:** `condition, price`
- **Condición:** `status = 'active' AND price > 0`
- **Uso:** Filtros de condición (nuevo, usado, etc.)

### 6. `idx_marketplace_products_external_code_sku_price_gt_zero`
- **Campos:** `external_code, sku`
- **Condición:** `status = 'active' AND price > 0 AND (external_code IS NOT NULL OR sku IS NOT NULL)`
- **Uso:** Búsquedas por SKU o código externo

---

## ✅ Cómo Ejecutar

### Opción 1: Supabase SQL Editor (Recomendado)

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase/migrations/20250122_optimize_price_gt_zero_indexes.sql`
5. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que aparezca el mensaje: "Success. No rows returned"

### Opción 2: Supabase CLI

```bash
cd /Users/danielnuno/Documents/Projects/Sumeeapp-B
supabase db push
```

---

## 🔍 Verificación

Para verificar que los índices se crearon correctamente, ejecuta en el SQL Editor:

```sql
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'marketplace_products' 
    AND (indexname LIKE '%price_gt_zero%' OR indexname LIKE '%gt_zero%')
ORDER BY indexname;
```

**Resultado esperado:** 6 índices listados

---

## 📈 Beneficios

1. **Rendimiento mejorado:** Las consultas que excluyen productos con precio 0 serán más rápidas
2. **Menor uso de espacio:** Los índices parciales solo incluyen filas relevantes
3. **Mejor escalabilidad:** A medida que crezca la base de datos, el rendimiento se mantendrá
4. **Optimización automática:** PostgreSQL usará estos índices automáticamente cuando sean relevantes

---

## ⚠️ Notas Importantes

- ✅ Esta migración **NO modifica** datos existentes
- ✅ Esta migración **NO afecta** productos con precio 0 (solo los excluye de los índices)
- ✅ Los índices son **compatibles** con el código existente que ya filtra por `price > 0`
- ✅ Los índices parciales son **más eficientes** que índices completos porque solo indexan filas relevantes

---

## 🔄 Reversión

Si necesitas eliminar estos índices (no recomendado), ejecuta:

```sql
DROP INDEX IF EXISTS idx_marketplace_products_active_price_gt_zero;
DROP INDEX IF EXISTS idx_marketplace_products_title_description_price_gt_zero_trgm;
DROP INDEX IF EXISTS idx_marketplace_products_price_range_active_gt_zero;
DROP INDEX IF EXISTS idx_marketplace_products_category_price_active_gt_zero;
DROP INDEX IF EXISTS idx_marketplace_products_condition_price_active_gt_zero;
DROP INDEX IF EXISTS idx_marketplace_products_external_code_sku_price_gt_zero;
```

---

## 📝 Relación con Cambios de Código

Esta migración complementa los cambios realizados en:
- `src/hooks/useMarketplacePagination.ts` (filtro `.gt("price", 0)`)
- `src/components/marketplace/SmartSearch.tsx` (filtro `.gt("price", 0)`)
- `src/components/services/MaterialSelector.tsx` (filtro `.gt("price", 0)`)
- `src/app/marketplace/page.tsx` (múltiples consultas con filtro `.gt("price", 0)`)

Los índices optimizarán automáticamente estas consultas.

