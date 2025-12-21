# Web Scraping de Cyberpuerta.mx para Precios

## Descripción

Este documento describe cómo funciona el web scraping de Cyberpuerta.mx para obtener precios de productos por SKU y actualizar la base de datos.

## Estructura de Cyberpuerta.mx

### URL de Búsqueda

```
https://www.cyberpuerta.mx/Buscar/?q=SKU
```

Donde `SKU` es el código del producto a buscar (URL-encoded).

### Estructura HTML

Cyberpuerta usa una estructura típica de e-commerce:

- **Contenedores de productos**: `article.product`, `div.product`, `li.product-item`
- **Precios**: `.price`, `.precio`, `.product-price`, `[data-price]`
- **Precios originales (descuentos)**: `.price-original`, `del`, `s` (tachado)

### Ejemplo de Estructura

```html
<article class="product">
  <div class="product-title">Nombre del Producto</div>
  <div class="price">$1,699.00</div>
  <del class="price-original">$1,899.00</del>
</article>
```

## Script: `update_prices_from_cyberpuerta.py`

### Funcionalidad

1. **Búsqueda por SKU**: Busca productos en Cyberpuerta usando el SKU
2. **Extracción de precios**: Extrae precio actual y precio original (si hay descuento)
3. **Actualización de BD**: Actualiza los precios en la base de datos

### Uso

```bash
# Modo dry-run (solo muestra resultados, no actualiza)
python3 scripts/update_prices_from_cyberpuerta.py --limit 50

# Aplicar cambios a la base de datos
python3 scripts/update_prices_from_cyberpuerta.py --limit 50 --execute
```

### Parámetros

- `--limit`: Número máximo de productos a procesar (default: 100)
- `--execute`: Aplicar cambios a la base de datos (sin esto, solo muestra resultados)

### Proceso

1. Obtiene productos de la BD con SKU y precio = 0 o null
2. Para cada producto:
   - Busca en Cyberpuerta usando el SKU
   - Extrae precio actual y precio original (si existe)
   - Actualiza la base de datos (si `--execute` está activo)
3. Respeta rate limits (2 segundos entre requests)

### Selectores CSS Utilizados

#### Productos
- `article.product`
- `div.product`
- `li.product-item`
- `.product-list-item`
- `[data-product-id]`
- `.product-card`
- `.item-product`

#### Precios
- `.price`
- `.precio`
- `.product-price`
- `[data-price]`
- `.price-current`
- `.precio-actual`
- `span[class*="price"]`
- `div[class*="price"]`

#### Precios Originales (Descuentos)
- `.price-original`
- `.precio-original`
- `.price-before`
- `del`
- `s`
- `[class*="original"]`

### Algoritmo de Búsqueda

1. **Búsqueda inicial**: Busca productos usando selectores CSS comunes
2. **Filtrado por relevancia**: Calcula un score de relevancia basado en:
   - SKU exacto en el texto del producto
   - SKU en atributos (`data-sku`, `data-product-id`, etc.)
   - SKU en enlaces del producto
3. **Selección del mejor match**: Selecciona el producto con mayor score
4. **Extracción de precio**: Busca precio usando múltiples selectores y patrones regex

### Manejo de Errores

- **Errores de conexión**: Se registran pero no detienen el proceso
- **Productos no encontrados**: Se marca como "sin precio" y continúa
- **Precios inválidos**: Se valida que estén en rango razonable (10 - 1,000,000)

### Rate Limiting

El script respeta los rate limits de Cyberpuerta:
- **2 segundos** entre cada request
- Headers de navegador para simular tráfico real

### Logs

El script muestra:
- Progreso cada 10 productos
- SKU buscado
- Precio encontrado
- Estado de actualización
- Resumen final con estadísticas

## Integración con Sistema Multi-Fuente

Este script complementa el sistema multi-fuente de precios:

1. **API de Syscom** (prioridad 1)
2. **Web scraping de Syscom** (prioridad 2)
3. **Web scraping de Cyberpuerta** (prioridad 3) ← Este script

## Limitaciones

1. **Dependencia de estructura HTML**: Si Cyberpuerta cambia su estructura, los selectores pueden fallar
2. **Rate limiting**: Cyberpuerta puede bloquear requests si son muy frecuentes
3. **SKUs no coincidentes**: Si el SKU en nuestra BD no coincide con el de Cyberpuerta, no se encontrará el producto
4. **Productos sin stock**: Algunos productos pueden no aparecer en búsquedas si están agotados

## Mejoras Futuras

1. **Cache de resultados**: Guardar resultados de búsquedas para evitar requests repetidos
2. **Búsqueda por título**: Si no se encuentra por SKU, intentar búsqueda por título
3. **Selenium para contenido dinámico**: Si Cyberpuerta usa JavaScript para cargar precios, considerar Selenium
4. **Validación de precios**: Comparar precios encontrados con rangos esperados por categoría

## Referencias

- [Cyberpuerta.mx](https://www.cyberpuerta.mx/)
- Script: `scripts/update_prices_from_cyberpuerta.py`
- Script relacionado: `scripts/update_syscom_prices.py`

