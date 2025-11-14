# 🔧 Instrucciones para Corregir el Error de `imagen_url` en `create_lead`

## ❌ Error Actual
```
Error: column "imagen_url" of relation "leads" does not exist
```

## 🔍 Problema
La función `create_lead` está intentando insertar datos en las columnas `imagen_url` y `photos_urls`, pero estas columnas no existen en la tabla `leads` de Supabase.

## ✅ Solución

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre el **Editor SQL** de Supabase (https://supabase.com/dashboard/project/[TU_PROJECT_ID]/sql/new)
2. Copia y pega el contenido completo del archivo:
   ```
   src/lib/supabase/fix-create-lead-imagen-url.sql
   ```
3. Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### Paso 2: Verificar la Ejecución

El script debería mostrar:
- ✅ Mensajes de confirmación sobre las columnas agregadas
- ✅ La firma de la función `create_lead` actualizada
- ✅ Las columnas `imagen_url` y `photos_urls` verificadas

### Paso 3: Probar la Creación de Leads

Después de ejecutar el script, prueba crear un lead desde el asistente SUMEE AI:
1. Abre http://localhost:3001
2. Ve al dashboard del cliente
3. Haz clic en "Agendar Proyecto Pro"
4. Completa el flujo del asistente
5. Envía la solicitud

## 📋 Lo que hace el script

1. **Verifica y agrega columnas faltantes**: 
   - `imagen_url TEXT` (para una sola imagen)
   - `photos_urls TEXT[]` (para múltiples imágenes)

2. **Elimina todas las versiones antiguas** de `create_lead`

3. **Crea la nueva función** `create_lead` que:
   - Acepta `imagen_url_in` y `photos_urls_in` como parámetros
   - Inserta correctamente en las columnas `imagen_url` y `photos_urls`
   - Mantiene compatibilidad con `urgencia_in` pero usa `urgencia_ia` en la BD

4. **Otorga permisos** necesarios a `authenticated`, `anon`, y `service_role`

5. **Verifica** que todo se creó correctamente

## 🎯 Resultado Esperado

Después de ejecutar el script, deberías poder:
- ✅ Crear leads sin el error de `imagen_url`
- ✅ Guardar URLs de imágenes en los leads (cuando se implemente)
- ✅ Guardar múltiples fotos en `photos_urls` (cuando se implemente)

## ⚠️ Nota

Si el script falla con algún error, comparte el mensaje de error completo para poder ayudarte a resolverlo.

