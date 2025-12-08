# 🗑️ Instrucciones: Eliminar Productos sin Imágenes Reales

## 📋 Objetivo

Eliminar todos los productos del marketplace que tienen la imagen placeholder genérica `/images/marketplace/placeholder-tool.jpg` o que no tienen imágenes.

## ⚠️ IMPORTANTE: Pasos a Seguir

### Paso 1: Verificación Previa

Antes de eliminar, ejecuta el script de verificación en el **Supabase SQL Editor**:

1. Ve a tu proyecto en Supabase Dashboard
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `VERIFICAR_PRODUCTOS_SIN_IMAGENES.sql`
4. Ejecuta el script
5. **Revisa los resultados** para confirmar cuántos productos se eliminarán

### Paso 2: Decidir Tipo de Eliminación

Tienes dos opciones:

#### Opción A: Soft Delete (RECOMENDADO) ✅
- Cambia el `status` a `'deleted'`
- Los productos se ocultan pero no se eliminan permanentemente
- Puedes recuperarlos si es necesario
- **Usa**: `ELIMINAR_PRODUCTOS_PLACEHOLDER.sql` (líneas sin comentar)

#### Opción B: Hard Delete (PERMANENTE) ⚠️
- Elimina los productos completamente de la base de datos
- **NO se puede deshacer**
- **Usa**: `ELIMINAR_PRODUCTOS_PLACEHOLDER.sql` (descomenta las líneas del DELETE)

### Paso 3: Ejecutar Eliminación

1. Abre el **Supabase SQL Editor**
2. Copia y pega el contenido de `ELIMINAR_PRODUCTOS_PLACEHOLDER.sql`
3. Si eliges Soft Delete, ejecuta tal cual está
4. Si eliges Hard Delete, descomenta las líneas del DELETE y comenta el UPDATE
5. Ejecuta el script
6. Verifica el resultado con el SELECT al final

## 📊 Qué Busca el Script

El script elimina productos que cumplen CUALQUIERA de estas condiciones:

1. **Sin imágenes**: `images IS NULL` o array vacío
2. **Solo placeholder**: Array con un solo elemento que es el placeholder
3. **Contiene placeholder**: Array que contiene el placeholder en cualquier posición

## 🔍 Verificación Post-Eliminación

Después de ejecutar, verifica que:

1. Los productos ya no aparecen en `/marketplace`
2. El contador de productos se actualizó correctamente
3. Solo quedan productos con imágenes reales

## 📝 Archivos Creados

- `VERIFICAR_PRODUCTOS_SIN_IMAGENES.sql` - Script de verificación
- `ELIMINAR_PRODUCTOS_PLACEHOLDER.sql` - Script de eliminación
- `supabase/migrations/20250121000000_remove_products_without_images.sql` - Migración (opcional)

## ⚡ Ejecución Rápida (Supabase SQL Editor)

```sql
-- Verificar primero
SELECT COUNT(*) as total_sin_imagen
FROM public.marketplace_products
WHERE status = 'active'
    AND (
        images IS NULL 
        OR array_length(images, 1) IS NULL
        OR array_length(images, 1) = 0
        OR (
            array_length(images, 1) = 1 
            AND images[1] = '/images/marketplace/placeholder-tool.jpg'
        )
        OR '/images/marketplace/placeholder-tool.jpg' = ANY(images)
    );

-- Eliminar (Soft Delete)
UPDATE public.marketplace_products
SET status = 'deleted', updated_at = NOW()
WHERE status = 'active'
    AND (
        images IS NULL 
        OR array_length(images, 1) IS NULL
        OR array_length(images, 1) = 0
        OR (
            array_length(images, 1) = 1 
            AND images[1] = '/images/marketplace/placeholder-tool.jpg'
        )
        OR '/images/marketplace/placeholder-tool.jpg' = ANY(images)
    );
```

---

**Recomendación**: Usa **Soft Delete** para poder recuperar productos si es necesario.

