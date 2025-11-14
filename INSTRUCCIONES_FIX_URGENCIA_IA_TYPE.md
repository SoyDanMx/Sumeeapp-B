# 🔧 Instrucciones para Corregir el Error de Tipo de `urgencia_ia`

## ❌ Error Actual
```
Error: column "urgencia_ia" is of type integer but expression is of type text
```

## 🔍 Problema
La columna `urgencia_ia` en la tabla `leads` es de tipo `INTEGER`, pero la función `create_lead` está intentando insertar un valor de tipo `TEXT`. Necesitamos convertir el valor a `INTEGER` antes de insertarlo.

## ✅ Solución

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre el **Editor SQL** de Supabase (https://supabase.com/dashboard/project/[TU_PROJECT_ID]/sql/new)
2. Copia y pega el contenido completo del archivo:
   ```
   src/lib/supabase/fix-create-lead-urgencia-ia-type.sql
   ```
3. Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### Paso 2: Verificar la Ejecución

El script debería mostrar:
- ✅ La firma de la función `create_lead` actualizada
- ✅ Mensajes de confirmación sobre la conversión de tipos

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
   - Acepta `urgencia_ia_in` como `TEXT` (para compatibilidad con el frontend)
   - Convierte el valor a `INTEGER` antes de insertarlo usando `::INTEGER`
   - Maneja errores de conversión con un bloque `EXCEPTION` que usa valor por defecto `5` si la conversión falla
   - Prioriza `urgencia_ia_in` sobre `urgencia_in` si ambos están presentes

3. **Otorga permisos** necesarios a `authenticated`, `anon`, y `service_role`

4. **Verifica** que todo se creó correctamente

## 🎯 Resultado Esperado

Después de ejecutar el script, deberías poder:
- ✅ Crear leads sin el error de tipo de dato
- ✅ La urgencia se guardará correctamente como INTEGER en la base de datos
- ✅ Si el valor no es numérico, se usará el valor por defecto `5`

## ⚠️ Nota

Si el script falla con algún error, comparte el mensaje de error completo para poder ayudarte a resolverlo.

