# Sistema Completo de Precios desde Syscom API

## Resumen

Este documento describe el sistema completo para obtener, actualizar y renderizar precios desde la API de Syscom, específicamente el `precio_especial` y `precio_lista`.

## Arquitectura del Sistema

### 1. Obtención de Precios

#### API de Syscom
La API de Syscom retorna precios en esta estructura:

```typescript
precio: {
  precio_lista: number;      // Precio de lista (sin descuento)
  precio_especial: number;   // Precio especial (con descuento) - PRIORITARIO
  precio_descuento: number;  // Alias de precio_especial
} | null | number;
```

#### Lógica de Prioridad

1. **`precio_especial`** (o `precio_descuento`) es el precio principal
   - Si existe y es > 0, se usa como precio principal
   - Si `precio_lista` > `precio_especial`, entonces `precio_lista` es el precio original (tachado)

2. **`precio_lista`** es el precio de respaldo
   - Se usa solo si no hay `precio_especial`
   - Si hay `precio_especial`, `precio_lista` se usa como `original_price` si es mayor

### 2. Endpoints API

#### GET `/api/marketplace/price?external_code=123`
Obtiene precio de Syscom sin actualizar la BD.

**Respuesta:**
```json
{
  "price": 1500.00,
  "originalPrice": 2000.00,
  "source": "syscom_api",
  "currency": "MXN"
}
```

#### POST `/api/marketplace/price/sync`
Obtiene precio de Syscom Y actualiza la BD si se proporciona `product_id`.

**Request:**
```json
{
  "external_code": "123",
  "product_id": "uuid-del-producto" // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "price": 1500.00,
  "originalPrice": 2000.00,
  "synced": true,
  "source": "syscom_api",
  "currency": "MXN",
  "message": "Precio actualizado en base de datos"
}
```

### 3. Hooks React

#### `useProductPrice`
Hook para obtener precio dinámicamente (solo lectura, no actualiza BD).

```typescript
const { price, originalPrice, loading, error } = useProductPrice(
  externalCode,
  currentPrice,
  enabled
);
```

#### `useSyncProductPrice`
Hook para sincronizar precio y actualizar BD.

```typescript
const { syncPrice, loading, error } = useSyncProductPrice();

// Sincronizar y actualizar BD
const result = await syncPrice(externalCode, productId);
```

### 4. Componentes

#### `ProductPrice`
Componente reutilizable para mostrar precios.

```tsx
<ProductPrice 
  product={product} 
  exchangeRate={exchangeRate} 
  size="lg" 
/>
```

**Características:**
- Obtiene precio dinámicamente si `product.price === 0`
- Muestra loading state mientras obtiene precio
- Muestra precio original tachado si hay descuento
- Soporta conversión de moneda (USD → MXN)
- Muestra "Consultar precio" si no hay precio disponible

### 5. Scripts de Actualización Masiva

#### `update_syscom_prices.py`
Script para actualizar precios masivamente desde Syscom.

```bash
# Modo dry-run
python3 scripts/update_syscom_prices.py --limit 100

# Aplicar cambios
python3 scripts/update_syscom_prices.py --execute --limit 100
```

**Proceso:**
1. Obtiene productos con `price = 0` o `null` y `external_code` no null
2. Para cada producto:
   - Intenta obtener precio desde API de Syscom
   - Si falla, intenta web scraping de Syscom
   - Si falla, intenta buscar en Cyberpuerta
3. Actualiza `price` y `original_price` en la BD

## Flujo de Renderizado de Precios

### Caso 1: Producto con precio en BD
```
BD: price = 1500, original_price = 2000
→ Muestra: $1,500.00 (tachado: $2,000.00)
```

### Caso 2: Producto sin precio en BD pero con external_code
```
BD: price = 0, external_code = "123"
→ Hook useProductPrice obtiene precio de Syscom
→ Muestra: $1,500.00 (tachado: $2,000.00)
```

### Caso 3: Producto sin precio y sin external_code
```
BD: price = 0, external_code = null
→ Muestra: "Consultar precio"
```

### Caso 4: Precio dinámico obtenido
```
BD: price = 0
→ API obtiene precio_especial = 1500, precio_lista = 2000
→ Muestra: $1,500.00 (tachado: $2,000.00)
→ Opcional: Sincronizar a BD usando useSyncProductPrice
```

## Actualización Automática de Precios

### Opción 1: Sincronización Manual
El usuario puede sincronizar precios manualmente usando el hook:

```tsx
const { syncPrice, loading } = useSyncProductPrice();

// En un botón o acción
await syncPrice(product.external_code, product.id);
```

### Opción 2: Sincronización Automática
Se puede agregar lógica para sincronizar automáticamente cuando se obtiene un precio dinámico:

```tsx
const { price, originalPrice } = useProductPrice(...);

useEffect(() => {
  if (price && price > 0 && product.price === 0) {
    // Sincronizar automáticamente
    syncPrice(product.external_code, product.id);
  }
}, [price, product.price]);
```

### Opción 3: Script de Actualización Masiva
Ejecutar periódicamente el script de actualización:

```bash
# Cron job o tarea programada
python3 scripts/update_syscom_prices.py --execute --limit 1000
```

## Estructura de Base de Datos

```sql
marketplace_products:
  - id: uuid
  - price: decimal (precio principal, precio_especial si existe)
  - original_price: decimal (precio_lista si hay descuento)
  - external_code: text (ID de Syscom)
  - sku: text
```

## Ejemplos de Uso

### Ejemplo 1: Mostrar Precio en ProductCard
```tsx
<ProductPrice 
  product={product} 
  size="lg" 
/>
```

### Ejemplo 2: Sincronizar Precio Manualmente
```tsx
const { syncPrice, loading } = useSyncProductPrice();

<button 
  onClick={() => syncPrice(product.external_code, product.id)}
  disabled={loading}
>
  {loading ? "Sincronizando..." : "Actualizar Precio"}
</button>
```

### Ejemplo 3: Actualizar Precios Masivamente
```bash
# Actualizar 100 productos
python3 scripts/update_syscom_prices.py --execute --limit 100

# Actualizar todos los productos con precio 0
python3 scripts/update_syscom_prices.py --execute --limit 10000
```

## Mejores Prácticas

1. **Priorizar `precio_especial`**: Siempre usar `precio_especial` como precio principal
2. **Usar `precio_lista` como original**: Solo si `precio_lista` > `precio_especial`
3. **Actualizar BD periódicamente**: Ejecutar script de actualización masiva regularmente
4. **Manejar errores gracefully**: Mostrar "Consultar precio" en lugar de errores
5. **Rate limiting**: Respetar límites de la API de Syscom (60 req/min)

## Troubleshooting

### Precios no se actualizan
- Verificar que `external_code` esté correcto
- Verificar credenciales de Syscom API
- Verificar que el producto exista en Syscom

### Precios muestran 0
- Verificar que el producto tenga precio en Syscom
- Verificar que `precio_especial` o `precio_lista` existan
- Ejecutar script de actualización masiva

### Muchos 404 en logs
- Normal si productos no existen en Syscom
- El endpoint ahora retorna 200 con `price: null` para evitar errores

## Referencias

- [API de Syscom](https://developers.syscom.mx/)
- Script: `scripts/update_syscom_prices.py`
- Endpoint: `/api/marketplace/price`
- Endpoint Sync: `/api/marketplace/price/sync`
- Hook: `src/hooks/useProductPrice.ts`
- Hook Sync: `src/hooks/useSyncProductPrice.ts`
- Componente: `src/components/marketplace/ProductPrice.tsx`

