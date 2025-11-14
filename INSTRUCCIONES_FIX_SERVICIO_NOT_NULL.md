# 🔧 Instrucciones para Corregir el Error de `servicio` NOT NULL

## ❌ Error Actual
```
Error: null value in column "servicio" of relation "leads" violates not-null constraint
```

## 🔍 Problema
La columna `servicio` en la tabla `leads` tiene una restricción `NOT NULL`, pero la función `create_lead` está intentando insertar un valor `NULL` cuando `servicio_in` es `NULL` o vacío.

## ✅ Solución

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre el **Editor SQL** de Supabase (https://supabase.com/dashboard/project/[TU_PROJECT_ID]/sql/new)
2. Copia y pega el contenido completo del archivo:
   ```
   src/lib/supabase/fix-create-lead-servicio-not-null.sql
   ```
3. Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### Paso 2: Verificar la Ejecución

El script debería mostrar:
- ✅ La firma de la función `create_lead` actualizada
- ✅ Mensajes de confirmación sobre el manejo de `servicio`

### Paso 3: Probar la Creación de Leads

Después de ejecutar el script, prueba crear un lead desde el asistente SUMEE AI:
1. Abre http://localhost:3001
2. Ve al dashboard del cliente
3. Haz clic en "Agendar Proyecto Pro"
4. Completa el flujo del asistente
5. Envía la solicitud

## 📋 Lo que hace el script

1. **Elimina todas las versiones antiguas** de `create_lead`

2. **Crea la nueva función** `create_lead` que:
   - Determina el valor de `servicio` con prioridad:
     - Si `servicio_in` está presente → usa `servicio_in`
     - Si `disciplina_ia_in` está presente → usa `disciplina_ia_in`
     - Si ambos son NULL → usa `'General'` como valor por defecto
   - Inserta en ambas columnas `servicio` (NOT NULL) y `servicio_solicitado` (por compatibilidad)
   - Mantiene la conversión de `urgencia_ia` a INTEGER

3. **Otorga permisos** necesarios a `authenticated`, `anon`, y `service_role`

4. **Verifica** que todo se creó correctamente

## 🎯 Resultado Esperado

Después de ejecutar el script, deberías poder:
- ✅ Crear leads sin el error de `servicio` NULL
- ✅ El servicio siempre tendrá un valor (nunca NULL)
- ✅ Si no se proporciona servicio, se usará la disciplina o "General" por defecto

## ⚠️ Nota

Si el script falla porque la tabla no tiene la columna `servicio` pero sí tiene `servicio_solicitado`, el script intentará insertar en ambas. Si solo existe una de las dos, ajusta el script según tu esquema real.

Si el script falla con algún error, comparte el mensaje de error completo para poder ayudarte a resolverlo.

