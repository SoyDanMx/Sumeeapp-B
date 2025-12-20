# 📦 Ejecutar Chunks de Importación TRUPER

El archivo SQL ha sido dividido en **14 chunks** más pequeños que pueden ejecutarse en Supabase SQL Editor.

---

## 📁 Archivos Generados

Los chunks están en: `supabase/migrations/truper_chunks/`

- `20250120_import_truper_chunk_001.sql` (1000 productos)
- `20250120_import_truper_chunk_002.sql` (1000 productos)
- `20250120_import_truper_chunk_003.sql` (1000 productos)
- ... (hasta chunk 014 con 226 productos)

**Total: 13,226 productos**

---

## ✅ Método 1: Ejecutar Manualmente en SQL Editor (RECOMENDADO)

### Paso 1: Abrir SQL Editor
```
https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/sql
```

### Paso 2: Ejecutar Cada Chunk en Orden

1. Abre el primer chunk: `supabase/migrations/truper_chunks/20250120_import_truper_chunk_001.sql`
2. Copia TODO el contenido (Cmd+A, Cmd+C)
3. Pégalo en el SQL Editor
4. Ejecuta (Run o Cmd+Enter)
5. Espera a que termine
6. Repite con el siguiente chunk (002, 003, ... hasta 014)

### ⏱️ Tiempo Estimado
- Cada chunk: ~30-60 segundos
- Total: ~10-15 minutos para todos los chunks

---

## ✅ Método 2: Ejecutar con psql (Automático)

### Requisitos:
- `psql` instalado (viene con PostgreSQL)
- Password de la base de datos de Supabase

### Paso 1: Obtener Password
1. Ve a: https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/settings/database
2. Busca "Database Password" o "Connection String"
3. Copia la contraseña

### Paso 2: Configurar Variables
```bash
export SUPABASE_DB_PASSWORD='tu_password_aqui'
export SUPABASE_PROJECT_REF='jkdvrwmanmwoyyoixmnt'
```

### Paso 3: Ejecutar Script
```bash
python3 scripts/execute_chunks.py
```

Esto ejecutará todos los chunks automáticamente.

---

## ✅ Método 3: Ejecutar Chunks Individualmente con psql

```bash
# Configurar password
export DB_PASSWORD='tu_password'

# Ejecutar cada chunk
psql "postgresql://postgres:${DB_PASSWORD}@db.jkdvrwmanmwoyyoixmnt.supabase.co:5432/postgres" \
  -f supabase/migrations/truper_chunks/20250120_import_truper_chunk_001.sql

psql "postgresql://postgres:${DB_PASSWORD}@db.jkdvrwmanmwoyyoixmnt.supabase.co:5432/postgres" \
  -f supabase/migrations/truper_chunks/20250120_import_truper_chunk_002.sql

# ... y así sucesivamente hasta chunk_014
```

---

## 🔍 Verificación

Después de ejecutar todos los chunks, verifica la importación:

```sql
-- Total de productos importados
SELECT COUNT(*) as total_productos
FROM public.marketplace_products 
WHERE seller_id IS NULL AND contact_phone = '5636741156';

-- Productos con imágenes
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as con_imagenes
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
- Total productos: ~13,226
- Productos con imágenes: ~13,226

---

## ⚠️ Notas Importantes

1. **Ejecuta en orden:** Los chunks deben ejecutarse del 001 al 014 en orden
2. **No interrumpas:** Si interrumpes a la mitad, puedes continuar desde donde quedaste
3. **ON CONFLICT DO NOTHING:** El SQL usa `ON CONFLICT DO NOTHING`, así que puedes ejecutar chunks múltiples veces sin duplicar datos
4. **Verificación final:** El último chunk (014) incluye una verificación que mostrará el total importado

---

## 🐛 Solución de Problemas

### Error: "relation does not exist"
- **Causa:** Falta ejecutar migraciones previas
- **Solución:** Ejecuta primero:
  ```sql
  -- En Supabase SQL Editor
  \i supabase/migrations/20250120_normalize_marketplace_categories.sql
  ```

### Error: "duplicate key value"
- **Causa:** El producto ya existe
- **Solución:** Ignora el error, el SQL usa `ON CONFLICT DO NOTHING`

### Chunk muy lento
- **Causa:** Base de datos ocupada o conexión lenta
- **Solución:** Espera a que termine, o ejecuta en horarios de menor tráfico

---

## 📋 Checklist

- [ ] Chunks generados (14 archivos)
- [ ] Ejecutado chunk 001
- [ ] Ejecutado chunk 002
- [ ] ... (hasta chunk 014)
- [ ] Verificación ejecutada
- [ ] Productos visibles en `/marketplace`


