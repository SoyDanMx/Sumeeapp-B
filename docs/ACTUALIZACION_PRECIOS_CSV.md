# Actualización de Precios desde CSV

## Descripción

Este documento describe cómo usar un archivo CSV para actualizar precios y SKUs en la base de datos del marketplace.

## Formato del CSV

El archivo CSV debe tener las siguientes columnas:

### Formato Mínimo (Requerido)
```csv
sku,precio
ABC-123,1500.00
XYZ-456,2000.00
DEF-789,3000.00
```

### Formato Completo (Con Precio Original)
```csv
sku,precio,precio_original
ABC-123,1500.00,2000.00
XYZ-456,2000.00,
DEF-789,3000.00,3500.00
```

### Variaciones de Nombres de Columnas

El script acepta variaciones en los nombres de columnas (case-insensitive):

- **SKU**: `sku`, `SKU`, `Sku`, `codigo`, `código`, `modelo`
- **Precio**: `precio`, `Precio`, `price`, `precio_venta`, `precio_final`
- **Precio Original**: `precio_original`, `precio_lista`, `original_price`, `precio_antes`

### Ejemplo de CSV

```csv
sku,precio,precio_original
RTX-5070-TI,16089.00,18000.00
AMD-RYZEN-7-7800X3D,7739.00,
GIGABYTE-GP-UD750GM,1699.00,1899.00
XPG-INVADER-X-BTF,1799.00,
```

## Uso del Script

### Modo Dry-Run (Solo Muestra Resultados)

```bash
python3 scripts/update_prices_from_csv.py --file productos.csv
```

Este modo:
- Lee el CSV
- Busca productos en la BD por SKU
- Muestra qué productos se actualizarían
- **NO actualiza la base de datos**

### Modo Execute (Aplica Cambios)

```bash
python3 scripts/update_prices_from_csv.py --file productos.csv --execute
```

Este modo:
- Lee el CSV
- Busca productos en la BD por SKU
- **Actualiza precios en la base de datos**

## Proceso de Actualización

1. **Lectura del CSV**
   - Detecta automáticamente el delimitador (coma o punto y coma)
   - Normaliza nombres de columnas (case-insensitive)
   - Valida y convierte precios

2. **Búsqueda en BD**
   - Obtiene todos los productos con SKU de la BD
   - Crea un índice por SKU para búsqueda rápida
   - Normaliza SKUs (mayúsculas, sin espacios) para comparación

3. **Actualización**
   - Para cada producto del CSV:
     - Busca el producto en BD por SKU
     - Si existe, actualiza `price` y `original_price` (si se proporciona)
     - Si no existe, lo marca como "no encontrado"

4. **Estadísticas**
   - Muestra resumen de productos actualizados
   - Lista productos no encontrados
   - Reporta errores

## Validaciones

### SKU
- No puede estar vacío
- Se normaliza (mayúsculas, sin espacios) para búsqueda
- Debe existir en la BD para actualizar

### Precio
- Debe ser un número válido
- Puede incluir símbolos: `$`, comas, espacios (se limpian automáticamente)
- Debe ser mayor que 0

### Precio Original
- Opcional
- Debe ser mayor que el precio principal para ser usado
- Si es menor o igual, se ignora

## Ejemplos

### Ejemplo 1: CSV Simple

**Archivo: `precios.csv`**
```csv
sku,precio
ABC-123,1500.00
XYZ-456,2000.00
```

**Comando:**
```bash
python3 scripts/update_prices_from_csv.py --file precios.csv --execute
```

**Resultado:**
```
✅ Actualizados: 2
⚠️  No encontrados: 0
❌ Errores: 0
```

### Ejemplo 2: CSV con Precio Original

**Archivo: `precios_con_descuento.csv`**
```csv
sku,precio,precio_original
ABC-123,1500.00,2000.00
XYZ-456,2000.00,
```

**Comando:**
```bash
python3 scripts/update_prices_from_csv.py --file precios_con_descuento.csv --execute
```

### Ejemplo 3: Verificar Antes de Actualizar

**Paso 1: Dry-run**
```bash
python3 scripts/update_prices_from_csv.py --file productos.csv
```

**Paso 2: Si los resultados son correctos, ejecutar**
```bash
python3 scripts/update_prices_from_csv.py --file productos.csv --execute
```

## Manejo de Errores

### SKU No Encontrado
Si un SKU del CSV no existe en la BD:
- Se marca como "no encontrado"
- No se actualiza ningún producto
- Se muestra en el resumen final

### Precio Inválido
Si un precio no es válido:
- Se omite esa fila
- Se muestra un mensaje de advertencia
- Se continúa con el siguiente producto

### Productos Duplicados
Si hay múltiples productos con el mismo SKU:
- Se actualiza el primero encontrado
- Se recomienda limpiar duplicados antes de actualizar

## Mejores Prácticas

1. **Siempre hacer dry-run primero**
   ```bash
   python3 scripts/update_prices_from_csv.py --file productos.csv
   ```

2. **Verificar formato del CSV**
   - Asegúrate de que las columnas se llamen `sku` y `precio`
   - Verifica que los precios sean números válidos

3. **Backup de la BD**
   - Antes de actualizar masivamente, considera hacer un backup

4. **Probar con pocos productos primero**
   - Crea un CSV pequeño con 5-10 productos
   - Verifica que funciona correctamente
   - Luego procesa el CSV completo

5. **Validar SKUs**
   - Asegúrate de que los SKUs en el CSV coincidan con los de la BD
   - El script normaliza SKUs (mayúsculas, sin espacios) para comparación

## Limitaciones

1. **SKU debe existir en BD**: El script no crea productos nuevos, solo actualiza existentes
2. **Búsqueda exacta**: Los SKUs deben coincidir exactamente (después de normalización)
3. **Un SKU por producto**: Si hay múltiples productos con el mismo SKU, se actualiza el primero encontrado

## Troubleshooting

### Error: "No se encontró columna 'sku'"
- Verifica que el CSV tenga una columna llamada `sku` (case-insensitive)
- Revisa el delimitador (debe ser coma o punto y coma)

### Error: "Precio inválido"
- Verifica que los precios sean números válidos
- Asegúrate de que no haya caracteres especiales además de `$`, comas y espacios

### Muchos "No encontrados"
- Verifica que los SKUs en el CSV coincidan con los de la BD
- El script normaliza SKUs (mayúsculas, sin espacios)
- Compara manualmente algunos SKUs para verificar

## Referencias

- Script: `scripts/update_prices_from_csv.py`
- Tabla: `marketplace_products`
- Campos: `sku`, `price`, `original_price`

