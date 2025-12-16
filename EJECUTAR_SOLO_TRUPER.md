# 🎯 Ejecutar Solo la Migración del Catálogo TRUPER

## ⚠️ Problema Actual

Hay un error en una migración anterior (`20250120000000_complete_leads_rls_policies.sql`) que está bloqueando la ejecución de todas las migraciones.

## ✅ Solución: Ejecutar Solo el SQL de TRUPER

### Opción 1: Ejecutar Manualmente en SQL Editor (MÁS RÁPIDO)

1. **Abre Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/sql
   ```

2. **Ejecuta primero este SQL para arreglar el error:**
   ```sql
   -- Arreglar política duplicada
   DROP POLICY IF EXISTS "clients_can_update_own_pending_leads" ON public.leads;
   ```

3. **Luego ejecuta el SQL completo de TRUPER:**
   - Abre: `supabase/migrations/20250120_import_truper_full_catalog.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Ejecuta (Run)

### Opción 2: Ejecutar con psql

```bash
# 1. Arreglar política duplicada
psql 'postgresql://postgres:[PASSWORD]@db.jkdvrwmanmwoyyoixmnt.supabase.co:5432/postgres' \
  -c "DROP POLICY IF EXISTS \"clients_can_update_own_pending_leads\" ON public.leads;"

# 2. Ejecutar SQL de TRUPER
psql 'postgresql://postgres:[PASSWORD]@db.jkdvrwmanmwoyyoixmnt.supabase.co:5432/postgres' \
  -f supabase/migrations/20250120_import_truper_full_catalog.sql
```

## 📊 Resultado Esperado

Después de ejecutar:
- ✅ 13,226 productos con imágenes importados
- ✅ Productos visibles en `/marketplace`
- ✅ Mensaje: "✅ Importación completada: X productos de TRUPER importados"

