# 🔧 Instrucciones para Corregir el Error de create_lead

## Problema
La función `create_lead` está intentando insertar en una columna `urgencia` que no existe en la tabla `leads`. La tabla solo tiene `urgencia_ia`.

## Solución

### Paso 1: Ejecutar el Script SQL en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido completo del archivo: `src/lib/supabase/fix-create-lead-urgencia.sql`
5. Ejecuta el script (Run)

### Paso 2: Verificar que se ejecutó correctamente

El script debería mostrar:
- ✅ Mensaje de éxito
- La firma de la función `create_lead` actualizada

### Paso 3: Probar nuevamente

Después de ejecutar el script, intenta crear una solicitud nuevamente desde el asistente IA.

## Archivo SQL a ejecutar

El archivo está en: `src/lib/supabase/fix-create-lead-urgencia.sql`

Este script:
- Elimina todas las versiones antiguas de `create_lead`
- Crea una nueva versión que NO intenta insertar en `urgencia`
- Solo usa `urgencia_ia` para guardar la urgencia

