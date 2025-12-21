# Análisis del Script de Sincronización Syscom

## 📋 Propósito
Script para sincronizar productos desde la API de Syscom hacia la base de datos de Supabase.

## ✅ Aspectos Positivos

1. **Autenticación OAuth2**: Correctamente implementada con client credentials
2. **Mapeo de categorías**: Bien estructurado el mapeo Syscom ID → Sumee slug
3. **Manejo de paginación**: Implementa paginación básica
4. **Detección de duplicados**: Intenta evitar duplicados por título

## ⚠️ Problemas Identificados

### 1. **Falta `external_code` y `sku`**
```python
# ❌ PROBLEMA: No guarda el ID de Syscom ni el modelo como SKU
payload = {
    "title": title[:150],
    # ... falta external_code y sku
}
```

**Solución**: Debe guardar:
- `external_code`: `p.get('producto_id')` o `p.get('id')`
- `sku`: `p.get('modelo')`

### 2. **Manejo de Precios Incompleto**
```python
# ❌ PROBLEMA: No maneja bien precio_especial cuando es 0 o null
raw_price = precios.get('precio_especial') or precios.get('precio_1') or precios.get('precio_lista') or "0"
price = float(raw_price)
```

**Problemas**:
- Si `precio_especial` es `0`, debería usar `precio_lista`
- No valida si el precio es válido antes de guardar
- No guarda `original_price` cuando hay descuento

**Solución**:
```python
precio_especial = precios.get('precio_especial')
precio_lista = precios.get('precio_lista')

if precio_especial and float(precio_especial) > 0:
    price = float(precio_especial)
    original_price = float(precio_lista) if precio_lista and float(precio_lista) > price else None
elif precio_lista and float(precio_lista) > 0:
    price = float(precio_lista)
    original_price = None
else:
    price = 0  # "Consultar precio"
```

### 3. **Límite de Páginas Muy Bajo**
```python
max_pages = 5  # ❌ Solo procesa 5 páginas por categoría
```

**Problema**: Deja muchos productos sin sincronizar.

**Solución**: Usar `data.get('paginas', 1)` para obtener el total de páginas real.

### 4. **Búsqueda de Duplicados Ineficiente**
```python
# ❌ PROBLEMA: Busca por título, que puede cambiar o tener variaciones
existing = supabase.table("marketplace_products").select("id").eq("title", title).eq("category_id", sistemas_uuid).execute()
```

**Problema**: 
- Los títulos pueden tener variaciones (mayúsculas, espacios, etc.)
- No usa `external_code` que es único

**Solución**: Buscar por `external_code`:
```python
external_code = str(p.get('producto_id') or p.get('id'))
existing = supabase.table("marketplace_products").select("id,price").eq("external_code", external_code).execute()
```

### 5. **Falta Manejo de Imágenes Múltiples**
```python
"images": [p_img] if p_img else [],  # ❌ Solo guarda una imagen
```

**Solución**: Si Syscom proporciona múltiples imágenes, guardarlas todas:
```python
images = []
if p_img:
    images.append(p_img)
# Si hay más imágenes en el objeto
if p.get('imagenes'):
    images.extend([img.get('url') for img in p.get('imagenes', []) if img.get('url')])
```

### 6. **Rate Limiting Insuficiente**
```python
time.sleep(0.5)  # ❌ Muy corto para Syscom API
```

**Problema**: Syscom tiene límite de 60 requests/minuto.

**Solución**: 
```python
time.sleep(1.1)  # Respeta límite de 60 req/min
```

### 7. **Falta Validación de Datos**
No valida:
- Títulos vacíos
- Precios negativos
- URLs de imágenes inválidas
- Categorías/subcategorías inexistentes

### 8. **No Maneja Errores de API Correctamente**
```python
except Exception as e:
    print(f"❌ Error syncing page {page}...")
    break  # ❌ Sale completamente, no reintenta
```

**Solución**: Implementar retry logic con backoff exponencial.

## 🔧 Mejoras Recomendadas

### 1. **Agregar Campos Faltantes**
```python
payload = {
    "title": title[:150],
    "description": description,
    "price": price,
    "original_price": original_price,  # ✅ NUEVO
    "condition": "nuevo",
    "category_id": sistemas_uuid,
    "subcategory_id": subcat_uuid,
    "seller_id": seller_id,
    "images": images,  # ✅ Múltiples imágenes
    "status": "active",
    "location_city": "CDMX",
    "location_zone": "Bodega Central",
    "external_code": str(p.get('producto_id')),  # ✅ NUEVO
    "sku": p.get('modelo'),  # ✅ NUEVO
}
```

### 2. **Mejorar Búsqueda de Duplicados**
```python
external_code = str(p.get('producto_id') or p.get('id'))
existing = supabase.table("marketplace_products").select("id,price").eq("external_code", external_code).execute()
```

### 3. **Procesar Todas las Páginas**
```python
total_pages = data.get('paginas', 1)
max_pages = min(total_pages, 100)  # Límite razonable pero procesa todas las disponibles
```

### 4. **Mejorar Manejo de Precios**
Usar la misma lógica que `import_all_syscom_products.py`:
```python
precio_data = p.get('precios', {})
precio_especial = precio_data.get('precio_especial')
precio_lista = precio_data.get('precio_lista')

if precio_especial and float(precio_especial) > 0:
    price = float(precio_especial)
    original_price = float(precio_lista) if precio_lista and float(precio_lista) > price else None
elif precio_lista and float(precio_lista) > 0:
    price = float(precio_lista)
    original_price = None
else:
    price = 0
    original_price = None
```

### 5. **Agregar Logging Mejorado**
```python
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
```

### 6. **Agregar Argumentos CLI**
```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--limit-pages', type=int, default=100)
parser.add_argument('--category', type=str, help='Sync only specific category')
parser.add_argument('--execute', action='store_true')
args = parser.parse_args()
```

## 📊 Comparación con `import_all_syscom_products.py`

El script existente (`import_all_syscom_products.py`) ya tiene:
- ✅ Manejo correcto de `external_code` y `sku`
- ✅ Lógica mejorada de precios
- ✅ Procesamiento de todas las páginas
- ✅ Búsqueda de duplicados por `external_code`
- ✅ Rate limiting apropiado
- ✅ Retry logic

**Recomendación**: Usar `import_all_syscom_products.py` como base y adaptar este script para que use la misma lógica.

## 🎯 Prioridades de Corrección

1. **ALTA**: Agregar `external_code` y `sku` al payload
2. **ALTA**: Mejorar búsqueda de duplicados por `external_code`
3. **MEDIA**: Mejorar manejo de precios (precio_especial vs precio_lista)
4. **MEDIA**: Procesar todas las páginas disponibles
5. **BAJA**: Agregar manejo de múltiples imágenes
6. **BAJA**: Mejorar logging y error handling

