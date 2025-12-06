# 🔒 Instrucciones: Habilitar RLS en `pricing_model_data`

## ⚠️ Problema Detectado

Supabase ha detectado que la tabla `public.pricing_model_data` no tiene Row Level Security (RLS) habilitado. Esto es un problema de seguridad porque la tabla está expuesta públicamente sin protección.

## ✅ Solución

Se ha creado un script SQL para habilitar RLS y crear políticas de seguridad apropiadas.

## 📋 Pasos para Ejecutar

### 1. Abrir Supabase SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**

### 2. Ejecutar el Script

1. Abre el archivo `supabase/migrations/enable-rls-pricing-model-data.sql`
2. Copia todo el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### 3. Verificar la Ejecución

Deberías ver un mensaje de éxito:
```
✅ RLS habilitado y políticas creadas para pricing_model_data
```

## 🔐 Políticas Creadas

El script crea las siguientes políticas de seguridad:

1. **Lectura Pública** (`SELECT`): Cualquiera puede leer los datos de precios agregados
   - Permite que Edge Functions y consultas públicas accedan a los datos
   - Los datos son agregados y no contienen información sensible

2. **Inserción Autenticada** (`INSERT`): Solo usuarios autenticados pueden insertar
   - Permite que las funciones SQL autenticadas inserten nuevos datos
   - Protege contra inserciones no autorizadas

3. **Actualización Autenticada** (`UPDATE`): Solo usuarios autenticados pueden actualizar
   - Permite que las funciones SQL autenticadas actualicen datos existentes
   - Protege contra modificaciones no autorizadas

4. **Eliminación Service Role** (`DELETE`): Solo el servicio puede eliminar
   - Solo el `service_role` puede eliminar datos
   - Protege contra eliminaciones accidentales o maliciosas

## 🧪 Verificación Post-Ejecución

Después de ejecutar el script, puedes verificar que RLS está habilitado ejecutando:

```sql
-- Verificar que RLS está habilitado
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'pricing_model_data';

-- Ver las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'pricing_model_data';
```

## 📝 Notas Importantes

- **No afecta funcionalidad existente**: Las políticas permiten el acceso necesario para que las Edge Functions y funciones SQL sigan funcionando
- **Datos públicos**: Los datos de precios agregados son públicos por diseño, ya que se usan para mostrar información de mercado
- **Seguridad mejorada**: Ahora la tabla está protegida contra inserciones, actualizaciones y eliminaciones no autorizadas

## 🚨 Si Encuentras Problemas

Si después de ejecutar el script encuentras problemas:

1. **Verifica que la tabla existe**:
   ```sql
   SELECT * FROM public.pricing_model_data LIMIT 1;
   ```

2. **Verifica las políticas**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'pricing_model_data';
   ```

3. **Si necesitas deshabilitar RLS temporalmente** (solo para debugging):
   ```sql
   ALTER TABLE public.pricing_model_data DISABLE ROW LEVEL SECURITY;
   ```
   ⚠️ **No olvides volver a habilitarlo después**

## ✅ Resultado Esperado

Después de ejecutar el script, el error de seguridad en Supabase debería desaparecer y la tabla estará protegida con RLS.

