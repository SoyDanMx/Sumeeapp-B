# Ejemplos de Renderizado de Precios

## Casos de Uso

### Caso 1: Producto con precio_especial y precio_lista (con descuento)

**API Syscom retorna:**
```json
{
  "precio": {
    "precio_especial": 1500.00,
    "precio_lista": 2000.00
  }
}
```

**Base de Datos:**
```sql
price = 1500.00
original_price = 2000.00
```

**Renderizado:**
```
┌─────────────────────┐
│   $1,500.00         │  ← precio_especial (principal)
│   $2,000.00         │  ← precio_lista (tachado)
└─────────────────────┘
```

**Código:**
```tsx
<ProductPrice product={product} size="lg" />
```

---

### Caso 2: Producto solo con precio_lista (sin descuento)

**API Syscom retorna:**
```json
{
  "precio": {
    "precio_lista": 2000.00,
    "precio_especial": null
  }
}
```

**Base de Datos:**
```sql
price = 2000.00
original_price = null
```

**Renderizado:**
```
┌─────────────────────┐
│   $2,000.00         │  ← precio_lista (único precio)
└─────────────────────┘
```

---

### Caso 3: Producto sin precio en BD, pero con external_code

**Base de Datos:**
```sql
price = 0
external_code = "123456"
```

**Flujo:**
1. `useProductPrice` detecta `price === 0` y `external_code` existe
2. Hace petición a `/api/marketplace/price?external_code=123456`
3. API obtiene precio de Syscom: `precio_especial = 1500, precio_lista = 2000`
4. Componente muestra precio dinámicamente

**Renderizado (mientras carga):**
```
┌─────────────────────┐
│   ⏳ Obteniendo...  │
└─────────────────────┘
```

**Renderizado (después de obtener):**
```
┌─────────────────────┐
│   $1,500.00         │
│   $2,000.00         │  ← tachado
└─────────────────────┘
```

**Código:**
```tsx
<ProductPrice product={product} autoSync={true} />
```

Si `autoSync={true}`, también actualiza la BD automáticamente.

---

### Caso 4: Producto sin precio y sin external_code

**Base de Datos:**
```sql
price = 0
external_code = null
```

**Renderizado:**
```
┌─────────────────────┐
│ Consultar precio    │  ← Badge gris
└─────────────────────┘
```

---

### Caso 5: Precio con conversión de moneda (USD → MXN)

**Base de Datos:**
```sql
price = 100.00  (USD)
```

**Con exchangeRate:**
```tsx
const exchangeRate = { rate: 17.5 }; // USD a MXN

<ProductPrice 
  product={product} 
  exchangeRate={exchangeRate} 
/>
```

**Renderizado:**
```
┌─────────────────────┐
│   $1,750.00 MXN     │  ← 100 * 17.5
└─────────────────────┘
```

---

## Ejemplos de Código

### Ejemplo 1: ProductCard básico
```tsx
<ProductPrice 
  product={product} 
  size="lg" 
/>
```

### Ejemplo 2: Con sincronización automática
```tsx
<ProductPrice 
  product={product} 
  size="lg"
  autoSync={true}  // Actualiza BD automáticamente
/>
```

### Ejemplo 3: Sincronización manual
```tsx
const { syncPrice, loading } = useSyncProductPrice();

<button 
  onClick={() => syncPrice(product.external_code, product.id)}
  disabled={loading}
>
  {loading ? "Actualizando..." : "Actualizar Precio"}
</button>
```

### Ejemplo 4: Con conversión de moneda
```tsx
const { exchangeRate } = useExchangeRate();

<ProductPrice 
  product={product} 
  exchangeRate={exchangeRate}
  size="lg"
/>
```

---

## Estados Visuales

### Loading State
```
┌─────────────────────┐
│ ⏳ Obteniendo...    │
└─────────────────────┘
```

### Precio con Descuento
```
┌─────────────────────┐
│ $1,500.00           │  ← Indigo, bold
│ $2,000.00           │  ← Gris, tachado
└─────────────────────┘
```

### Precio sin Descuento
```
┌─────────────────────┐
│ $2,000.00           │  ← Indigo, bold
└─────────────────────┘
```

### Sin Precio
```
┌─────────────────────┐
│ Consultar precio    │  ← Gris, badge
└─────────────────────┘
```

---

## Tamaños Disponibles

- `size="sm"`: Texto base (16px)
- `size="md"`: Texto XL (20px) - **Por defecto**
- `size="lg"`: Texto 2XL (24px)

---

## Propiedades del Componente

```typescript
interface ProductPriceProps {
  product: {
    id?: string;              // ID del producto (necesario para autoSync)
    price: number;            // Precio en BD
    original_price?: number | null;  // Precio original en BD
    external_code?: string | number | null;  // ID de Syscom
  };
  exchangeRate?: { rate: number } | null;  // Para conversión USD → MXN
  size?: "sm" | "md" | "lg";  // Tamaño del texto
  showOriginal?: boolean;     // Mostrar precio original tachado
  className?: string;          // Clases CSS adicionales
  autoSync?: boolean;          // Sincronizar automáticamente a BD
}
```

