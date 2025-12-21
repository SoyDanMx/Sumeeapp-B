# Importación Completa de Productos Syscom

## Situación Actual

- **Productos en categoría "sistemas" en BD:** 2,255
- **Productos disponibles en Syscom API:** ~23,000+ productos

### Categorías Relevantes en Syscom

1. **Videovigilancia (ID: 22)**
   - ~8,200 productos
   - 137 páginas

2. **Redes e IT (ID: 26)**
   - ~8,600 productos
   - 144 páginas

3. **Energía / Herramientas (ID: 30)**
   - ~6,400 productos
   - 107 páginas

**Total estimado:** ~23,200 productos

## Script de Importación

### Script Principal

```bash
python3 scripts/import_all_syscom_products.py
```

Este script:
- ✅ Obtiene TODOS los productos de las 3 categorías relevantes
- ✅ Pagina automáticamente para obtener todos los productos
- ✅ Elimina duplicados por `producto_id`
- ✅ Verifica si el producto ya existe por `external_code`
- ✅ Mapea productos de Syscom al formato del marketplace
- ✅ Respeta el rate limit de Syscom (60 peticiones/minuto)

### Modo Dry-Run (Por Defecto)

```bash
python3 scripts/import_all_syscom_products.py
```

Muestra qué productos se importarían sin guardar cambios.

### Modo Producción

```bash
python3 scripts/import_all_syscom_products.py --execute
```

Importa todos los productos a la base de datos.

### Importar Solo una Categoría

```bash
# Solo Videovigilancia
python3 scripts/import_all_syscom_products.py --execute --category 22

# Solo Redes e IT
python3 scripts/import_all_syscom_products.py --execute --category 26

# Solo Energía / Herramientas
python3 scripts/import_all_syscom_products.py --execute --category 30
```

## Requisitos Previos

### 1. Migración de Base de Datos

**⚠️ IMPORTANTE:** Ejecutar primero la migración para agregar las columnas `external_code` y `sku`:

```sql
-- Ejecutar en Supabase SQL Editor o via migración
-- Archivo: supabase/migrations/20250121_add_external_code_to_products.sql
```

O ejecutar manualmente:

```sql
ALTER TABLE public.marketplace_products 
ADD COLUMN IF NOT EXISTS external_code TEXT;

ALTER TABLE public.marketplace_products 
ADD COLUMN IF NOT EXISTS sku TEXT;

CREATE INDEX IF NOT EXISTS idx_marketplace_products_external_code 
ON public.marketplace_products(external_code) 
WHERE external_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_products_sku 
ON public.marketplace_products(sku) 
WHERE sku IS NOT NULL;
```

### 2. Variables de Entorno

Asegurarse de que `.env.local` contenga:

```env
SYSCOM_CLIENT_ID=tu_client_id
SYSCOM_CLIENT_SECRET=tu_client_secret
NEXT_PUBLIC_SUPABASE_URL=tu_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Proceso de Importación

### Paso 1: Verificar Migración

```bash
# Verificar que la columna external_code existe
python3 -c "
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('.env.local')
supabase = create_client(
    os.environ.get('NEXT_PUBLIC_SUPABASE_URL'),
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
)

try:
    result = supabase.table('marketplace_products').select('external_code').limit(1).execute()
    print('✅ Columna external_code existe')
except Exception as e:
    print(f'❌ Error: {e}')
    print('💡 Ejecuta primero la migración')
"
```

### Paso 2: Probar con Dry-Run

```bash
python3 scripts/import_all_syscom_products.py
```

Esto mostrará:
- Cuántos productos se obtendrían
- Cuántos se importarían (nuevos)
- Cuántos se omitirían (ya existen)

### Paso 3: Importar una Categoría Pequeña Primero

Para probar, importar solo una categoría:

```bash
# Importar solo Energía / Herramientas (~6,400 productos)
python3 scripts/import_all_syscom_products.py --execute --category 30
```

### Paso 4: Importar Todas las Categorías

Una vez verificado que funciona:

```bash
python3 scripts/import_all_syscom_products.py --execute
```

**Tiempo estimado:** 
- ~388 páginas × 1.1 segundos = ~7 minutos solo para obtener datos
- Tiempo adicional para insertar en BD: depende del rendimiento

## Mapeo de Datos

### Campos Mapeados

| Syscom | Marketplace | Notas |
|--------|-------------|-------|
| `producto_id` | `external_code` | Código único de Syscom |
| `modelo` | `sku` | Modelo del producto |
| `titulo` | `title` | Nombre del producto |
| `descripcion` | `description` | Descripción + características |
| `img_portada` + `imagenes[]` | `images[]` | Array de URLs de imágenes |
| `precio.precio_especial` | `price` | Precio principal |
| `precio.precio_lista` | `original_price` | Precio original si hay descuento |
| - | `category_id` | Siempre "sistemas" |
| - | `status` | Siempre "active" |
| - | `condition` | Siempre "nuevo" |

### Nota sobre Precios

Los precios pueden venir como `null` en la API de Syscom. En ese caso:
- `price` = 0
- `original_price` = null

Los precios pueden actualizarse manualmente o mediante otro proceso.

## Rate Limiting

El script respeta el rate limit de Syscom:
- **Límite:** 60 peticiones por minuto
- **Delay entre peticiones:** 1.1 segundos
- **Tiempo total estimado:** ~7 minutos para obtener todos los productos

## Verificación Post-Importación

### Contar Productos Importados

```sql
-- Productos con external_code (de Syscom)
SELECT COUNT(*) 
FROM marketplace_products 
WHERE external_code IS NOT NULL 
AND category_id = (SELECT id FROM marketplace_categories WHERE slug = 'sistemas');
```

### Verificar Duplicados

```sql
-- Verificar si hay duplicados por external_code
SELECT external_code, COUNT(*) 
FROM marketplace_products 
WHERE external_code IS NOT NULL 
GROUP BY external_code 
HAVING COUNT(*) > 1;
```

### Verificar Productos Nuevos

```sql
-- Productos importados recientemente (últimas 24 horas)
SELECT COUNT(*) 
FROM marketplace_products 
WHERE external_code IS NOT NULL 
AND created_at > NOW() - INTERVAL '24 hours';
```

## Troubleshooting

### Error: "column external_code does not exist"

**Solución:** Ejecutar la migración primero:
```sql
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS external_code TEXT;
```

### Error: Rate Limit Exceeded

**Solución:** El script ya maneja esto con delays. Si ocurre, esperar unos minutos y reintentar.

### Error: Token Expired

**Solución:** El script renueva el token automáticamente. Si falla, verificar credenciales.

### Productos sin Precio

**Normal:** Los precios pueden venir como `null` desde Syscom. Se pueden actualizar manualmente o mediante otro proceso.

## Próximos Pasos

1. ✅ Ejecutar migración de `external_code` y `sku`
2. ✅ Probar script en modo dry-run
3. ✅ Importar una categoría pequeña primero
4. ✅ Importar todas las categorías
5. 🔄 Actualizar precios (si están disponibles)
6. 🔄 Sincronización periódica de productos nuevos

## Referencias

- [API de Syscom](https://developers.syscom.mx/docs)
- [Guía de API Syscom](./GUIA_API_SYSCOM.md)
- [Análisis Completo de API Syscom](./ANALISIS_API_SYSCOM_COMPLETO.md)

