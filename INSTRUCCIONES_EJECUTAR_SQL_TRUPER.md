# 🚀 Instrucciones para Ejecutar el SQL de Importación TRUPER

## 📊 Estado del Archivo SQL

- **Archivo:** `supabase/migrations/20250120_import_truper_full_catalog.sql`
- **Tamaño:** 449,714 líneas
- **Productos:** 13,226 productos con imágenes listos para importar
- **Total productos:** 15,758 productos

---

## ✅ Opción 1: Ejecutar en Supabase SQL Editor (RECOMENDADO)

### Paso 1: Abrir SQL Editor
1. Ve a: https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/sql
2. O navega: Dashboard → Tu Proyecto → SQL Editor → New Query

### Paso 2: Cargar el Archivo SQL
1. Abre el archivo: `supabase/migrations/20250120_import_truper_full_catalog.sql`
2. **Copia TODO el contenido** (Cmd+A, Cmd+C)
3. Pégalo en el SQL Editor de Supabase (Cmd+V)

### Paso 3: Ejecutar
1. Haz clic en el botón **"Run"** (o presiona `Cmd+Enter` / `Ctrl+Enter`)
2. Espera a que termine la ejecución (puede tardar varios minutos)
3. Verifica el mensaje de éxito al final

### ⚠️ Notas Importantes:
- El archivo es muy grande, pero el SQL Editor de Supabase puede manejarlo
- La ejecución puede tardar 5-15 minutos dependiendo del tamaño
- Verás mensajes `NOTICE` al final confirmando la importación

---

## ✅ Opción 2: Ejecutar con psql (Si tienes credenciales)

### Requisitos:
- `psql` instalado
- Credenciales de conexión de Supabase (Database Password)

### Comando:
```bash
psql 'postgresql://postgres:[TU_PASSWORD]@db.jkdvrwmanmwoyyoixmnt.supabase.co:5432/postgres' \
  -f supabase/migrations/20250120_import_truper_full_catalog.sql
```

### Obtener Password:
1. Ve a: https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/settings/database
2. Busca "Database Password" o "Connection String"
3. Copia la contraseña

---

## ✅ Opción 3: Ejecutar con Supabase CLI

### Si la migración aún no se ha ejecutado:
```bash
cd /Users/danielnuno/Documents/Projects/Sumeeapp-B
supabase db push
```

**Nota:** Esto ejecutará TODAS las migraciones pendientes, no solo esta.

### Para ejecutar solo esta migración:
```bash
# Primero, verificar migraciones ejecutadas
supabase migration list

# Luego ejecutar solo esta si no está en la lista
supabase db push
```

---

## 🔍 Verificación Post-Importación

Después de ejecutar el SQL, verifica que se importaron correctamente:

```sql
-- Verificar total de productos importados
SELECT COUNT(*) as total_productos
FROM public.marketplace_products 
WHERE seller_id IS NULL AND contact_phone = '5636741156';

-- Verificar productos con imágenes
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as con_imagenes,
  COUNT(CASE WHEN images IS NULL OR array_length(images, 1) = 0 THEN 1 END) as sin_imagenes
FROM public.marketplace_products 
WHERE seller_id IS NULL AND contact_phone = '5636741156';

-- Ver algunos ejemplos
SELECT title, price, images 
FROM public.marketplace_products 
WHERE seller_id IS NULL 
  AND images IS NOT NULL 
  AND array_length(images, 1) > 0
LIMIT 10;
```

**Resultado esperado:**
- Total productos: ~13,226 con imágenes
- Total productos: ~15,758 en total (incluyendo sin imágenes)

---

## 🐛 Solución de Problemas

### Error: "policy already exists"
- **Causa:** Otra migración ya creó la política
- **Solución:** Ignora el error, continúa la ejecución

### Error: "relation does not exist"
- **Causa:** Falta ejecutar migraciones previas
- **Solución:** Ejecuta primero:
  ```sql
  -- En Supabase SQL Editor
  \i supabase/migrations/20250120_normalize_marketplace_categories.sql
  ```

### Error: "timeout" o "connection lost"
- **Causa:** El SQL es muy grande y tarda mucho
- **Solución:** 
  - Ejecuta en partes más pequeñas
  - O aumenta el timeout en Supabase Dashboard → Settings → Database

### El SQL no se ejecuta completamente
- **Causa:** Límite de tamaño o timeout
- **Solución:** Divide el archivo SQL en partes más pequeñas usando el script:
  ```bash
  python3 scripts/split_sql_file.py
  ```

---

## 📋 Checklist

- [ ] Archivo SQL generado correctamente
- [ ] Verificado que tiene 13,226 productos con imágenes
- [ ] Ejecutado en Supabase SQL Editor
- [ ] Verificado importación con queries de verificación
- [ ] Productos visibles en `/marketplace`

---

## 🎯 Resultado Esperado

Después de ejecutar el SQL:
- ✅ 13,226 productos con imágenes importados
- ✅ Productos visibles en la página `/marketplace`
- ✅ Búsqueda y filtros funcionando
- ✅ Imágenes cargando correctamente desde `/images/marketplace/truper/`

---

## 💡 Próximos Pasos

1. **Verificar productos en la app:**
   - Ve a `/marketplace`
   - Verifica que los productos se muestran correctamente

2. **Si faltan productos:**
   - Ejecuta: `python3 scripts/download_truper_from_bank.py`
   - Regenera SQL: `python3 scripts/import_truper_fast.py`
   - Ejecuta el nuevo SQL

3. **Optimizar rendimiento:**
   - Los índices ya están creados en `20250120_marketplace_search_indexes.sql`
   - La búsqueda debería ser rápida


