# 🔍 Verificación de Precios Erróneos

**Fecha:** 2025-01-22  
**Problema:** Precios aún se muestran incorrectos después de la corrección

---

## ✅ Cambios Realizados

### 1. Inclusión de `external_code` en Consultas
Se aseguró que `external_code` se incluya en todas las consultas para que `ProductPrice` pueda detectar correctamente si un producto es de Syscom:

- ✅ `src/hooks/useMarketplacePagination.ts` - Agregado `external_code, sku` al select
- ✅ `src/components/marketplace/SmartSearch.tsx` - Agregado `external_code, sku` al select
- ✅ `src/components/services/MaterialSelector.tsx` - Agregado `external_code, sku` al select
- ✅ `src/app/marketplace/page.tsx` - Agregado `external_code, sku` al select (2 consultas)

### 2. Lógica de Conversión Corregida
- ✅ Solo convierte productos con `external_code` (Syscom)
- ✅ Productos sin `external_code` se muestran tal cual (ya están en MXN)

---

## 🔍 Posibles Causas de Precios Erróneos

### 1. Precios Ya Incorrectos en Base de Datos
**Problema:** Si los precios fueron convertidos incorrectamente antes, seguirán siendo incorrectos aunque el código esté bien.

**Solución:** Verificar y corregir precios en la BD:
```sql
-- Ver productos NO-Syscom con precios sospechosamente altos (> 50,000)
SELECT id, title, price, external_code
FROM marketplace_products
WHERE external_code IS NULL
  AND status = 'active'
  AND price > 50000
ORDER BY price DESC
LIMIT 20;
```

### 2. Caché del Navegador
**Problema:** El navegador puede estar mostrando código antiguo en caché.

**Solución:**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) o Cmd+Shift+R (Mac)
2. Limpiar caché del navegador completamente
3. Modo incógnito para verificar

### 3. Cambios No Desplegados
**Problema:** Los cambios están solo en local, no en producción.

**Solución:**
```bash
git add .
git commit -m "Corregir conversión de precios y asegurar external_code en consultas"
git push origin main
```

### 4. `external_code` No Disponible
**Problema:** Si `external_code` no está en el objeto `product`, todos los productos se tratarán como no-Syscom.

**Solución:** Ya corregido - se incluye `external_code` en todas las consultas.

---

## 🧪 Verificación Manual

### En el Navegador (DevTools):
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Filtra por "marketplace_products"
4. Abre una petición y verifica que `external_code` esté en la respuesta

### Verificar un Producto Específico:
```javascript
// En la consola del navegador
// Buscar un producto y verificar si tiene external_code
const product = /* producto del marketplace */;
console.log('external_code:', product.external_code);
console.log('price:', product.price);
console.log('exchangeRate:', /* verificar si hay exchangeRate */);
```

---

## 📊 Script de Verificación

Se creó `scripts/check_price_issues.py` para verificar precios en la BD, pero tiene un error de sintaxis de Supabase. Para verificar manualmente:

```sql
-- Productos NO-Syscom con precios sospechosos
SELECT 
    id, 
    title, 
    price, 
    external_code,
    CASE 
        WHEN external_code IS NULL AND price > 50000 THEN '⚠️ SOSPECHOSO'
        ELSE '✅ OK'
    END as status
FROM marketplace_products
WHERE status = 'active'
  AND price > 0
ORDER BY 
    CASE WHEN external_code IS NULL THEN 1 ELSE 0 END,
    price DESC
LIMIT 50;
```

---

## 🔧 Si los Precios en BD Están Incorrectos

Si los precios NO-Syscom fueron convertidos incorrectamente (multiplicados por ~17.5), necesitarás corregirlos:

```sql
-- ⚠️ CUIDADO: Esto dividirá precios de productos NO-Syscom por 17.5
-- Solo ejecutar si estás seguro de que fueron convertidos incorrectamente

UPDATE marketplace_products
SET price = price / 17.5,
    original_price = CASE 
        WHEN original_price IS NOT NULL THEN original_price / 17.5 
        ELSE NULL 
    END
WHERE external_code IS NULL
  AND status = 'active'
  AND price > 50000;  -- Solo productos con precios sospechosamente altos
```

**⚠️ IMPORTANTE:** Haz un backup antes de ejecutar este UPDATE.

---

## ✅ Checklist de Verificación

- [ ] `external_code` se incluye en todas las consultas
- [ ] `ProductPrice` verifica `external_code` antes de convertir
- [ ] Cambios desplegados en producción
- [ ] Caché del navegador limpiada
- [ ] Precios en BD verificados (no están incorrectos)

---

**Última actualización:** 2025-01-22

