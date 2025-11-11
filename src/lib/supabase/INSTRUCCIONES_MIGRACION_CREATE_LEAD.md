# Instrucciones para Migración de create_lead con IA

## Problema Detectado
Existen **4 versiones** de la función `create_lead` en la base de datos con diferentes firmas, lo que causa el error:
```
ERROR: 42725: function name "public.create_lead" is not unique
```

## Solución en 3 Pasos

### Paso 1: Eliminar TODAS las versiones existentes (MÉTODO MEJORADO)
Ejecuta en el SQL Editor de Supabase:
```bash
src/lib/supabase/force-drop-all-create-lead.sql
```

Este script usa un método automático que:
- ✅ Detecta todas las versiones por su OID único
- ✅ Las elimina una por una usando CASCADE
- ✅ Verifica que no quede ninguna

✅ **Resultado esperado:** 
```
✅✅✅ ÉXITO: Todas las versiones de create_lead eliminadas
✅ Limpio - Listo para crear la nueva función
```

---

### Paso 2: Crear la nueva versión única con campos de IA
Ejecuta en el SQL Editor de Supabase:
```bash
src/lib/supabase/update-create-lead-with-ia.sql
```

✅ **Resultado esperado:**
```
✅ Función create_lead actualizada exitosamente (1 versión única)
```

---

### Paso 3: Agregar columnas de IA a la tabla leads
Ejecuta en el SQL Editor de Supabase:
```bash
src/lib/supabase/add-disciplina-ia-column.sql
```

✅ **Resultado esperado:**
```
✅ Columnas de IA agregadas exitosamente
```

---

## Verificación Final

Ejecuta este query en Supabase SQL Editor para verificar:

```sql
-- Verificar que solo existe UNA versión de create_lead
SELECT 
  routine_name as nombre,
  pg_get_function_arguments(p.oid) as argumentos,
  pg_get_function_result(p.oid) as retorno
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';
```

**Debe mostrar solo 1 fila** con estos argumentos:
```
nombre_cliente_in text, 
whatsapp_in text, 
descripcion_proyecto_in text, 
ubicacion_lat_in numeric, 
ubicacion_lng_in numeric, 
servicio_in text DEFAULT NULL, 
urgencia_in text DEFAULT NULL, 
ubicacion_direccion_in text DEFAULT NULL, 
imagen_url_in text DEFAULT NULL, 
photos_urls_in text[] DEFAULT NULL, 
disciplina_ia_in text DEFAULT NULL, 
urgencia_ia_in text DEFAULT NULL, 
diagnostico_ia_in text DEFAULT NULL
```

---

## Verificar columnas en la tabla leads

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name IN ('disciplina_ia', 'urgencia_ia', 'diagnostico_ia');
```

**Debe mostrar 3 filas:**
- `disciplina_ia` | text | YES
- `urgencia_ia` | text | YES
- `diagnostico_ia` | text | YES

---

## Troubleshooting

### Si después del Paso 1 aún quedan versiones:

Identifica las versiones restantes:
```sql
SELECT p.oid::regprocedure
FROM pg_proc p
WHERE p.proname = 'create_lead'
  AND p.pronamespace = 'public'::regnamespace;
```

Elimina manualmente cada una (reemplaza `oid` con el valor obtenido):
```sql
DROP FUNCTION oid CASCADE;
```

---

## Orden de Ejecución Correcto

1. ✅ `drop-all-create-lead-versions.sql` (Limpieza)
2. ✅ `add-disciplina-ia-column.sql` (Estructura de tabla)
3. ✅ `update-create-lead-with-ia.sql` (Nueva función)

---

## Después de la Migración

Una vez completados los 3 pasos, el frontend (`RequestServiceModal.tsx`) podrá:
- Llamar a la Edge Function `classify-service` para obtener sugerencias de IA
- Guardar `disciplina_ia`, `urgencia_ia` y `diagnostico_ia` en cada lead
- Mostrar la sugerencia automática al usuario en tiempo real

No se requieren cambios adicionales en el código del frontend.

