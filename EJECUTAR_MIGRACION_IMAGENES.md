# 🖼️ Ejecutar Migración de Imágenes de Productos Truper

## 📋 Instrucciones para Ejecutar la Migración

La migración actualiza las rutas de imágenes de 435 productos del marketplace con las imágenes descargadas de Truper.

### 🎯 Opción 1: Ejecutar en Supabase SQL Editor (Recomendado)

1. **Abre Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Inicia sesión con tu cuenta
   - Selecciona tu proyecto **Sumee App**

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, haz clic en **"SQL Editor"**
   - Haz clic en el botón **"New query"**

3. **Copia y Ejecuta el Script**
   - Abre el archivo: `supabase/migrations/20251207150000_update_product_images_final.sql`
   - **Copia TODO el contenido** del archivo (64 KB, ~2177 líneas)
   - Pega el contenido en el editor SQL de Supabase
   - Haz clic en el botón **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)

4. **Verifica el Resultado**
   - Deberías ver mensajes de éxito para cada UPDATE
   - Verifica que se actualizaron 435 productos

### 🎯 Opción 2: Ejecutar desde Terminal (Si tienes acceso a psql)

```bash
# Conectarte a la base de datos de Supabase
psql "postgresql://postgres:[PASSWORD]@db.jkdvrwmanmwoyyoixmnt.supabase.co:5432/postgres"

# Ejecutar el script
\i supabase/migrations/20251207150000_update_product_images_final.sql
```

### 📊 Resumen de la Migración

- **Archivo**: `supabase/migrations/20251207150000_update_product_images_final.sql`
- **Tamaño**: 64 KB
- **Líneas**: ~2,177 líneas
- **UPDATE statements**: 435
- **Imágenes disponibles**: 431 imágenes en `public/images/marketplace/truper/`

### ✅ Verificación Post-Migración

Después de ejecutar la migración, verifica que las imágenes se actualizaron correctamente:

```sql
-- Verificar productos con imágenes actualizadas
SELECT 
  COUNT(*) as total_productos,
  COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as productos_con_imagenes
FROM marketplace_products;

-- Ver algunos ejemplos
SELECT title, images 
FROM marketplace_products 
WHERE images IS NOT NULL 
LIMIT 10;
```

### 🔍 Notas Importantes

- La migración actualiza productos donde el título coincide con el SKU de Truper
- Algunos productos pueden no tener imágenes si el SKU no se encontró en el banco de imágenes de Truper
- Las imágenes están almacenadas en: `/images/marketplace/truper/[SKU].jpg`

