# Limpieza Final de Triggers Duplicados

## 🎯 Problema Identificado

Tienes **triggers duplicados** que están causando conflictos:
- `on_auth_user_created` (nuestro trigger)
- `create_profile_after_user_insert` (trigger duplicado)

El error `cannot drop function... because other objects depend on it` confirma que hay dependencias entre triggers y funciones.

## 🛠️ Solución Definitiva

### **Paso 1: Asegurar Permisos de Administrador**

1. **Cierra sesión** en tu cuenta actual de Supabase
2. **Vuelve a iniciar sesión** asegurándote de que estás usando la cuenta de propietario (Owner)
3. **Verifica** que tienes permisos completos para modificar la base de datos

### **Paso 2: Ejecutar Script de Limpieza Completo**

1. **Ve al SQL Editor** en tu dashboard de Supabase
2. **Crea una nueva consulta**
3. **Copia y pega el siguiente script COMPLETO:**

```sql
-- ========= SCRIPT DE LIMPIEZA Y REINSTALACIÓN DE TRIGGER DE PERFIL =========

-- PASO 1: Eliminar AMBOS triggers existentes en la tabla auth.users para evitar conflictos.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_after_user_insert ON auth.users;

-- PASO 2: Ahora que los triggers han sido eliminados, podemos borrar las funciones asociadas sin errores.
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user;
DROP FUNCTION IF EXISTS public.create_profile_after_user_insert;

-- PASO 3: Crear nuestra ÚNICA función, correcta y robusta.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    profession,
    membership_status,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'profession',
    'free',
    CASE
      WHEN NEW.raw_user_meta_data->>'profession' IS NOT NULL AND TRIM(NEW.raw_user_meta_data->>'profession') <> ''
      THEN 'profesional'
      ELSE 'client'
    END
  );
  RETURN NEW;
END;
$$;

-- PASO 4: Crear nuestro ÚNICO trigger, vinculándolo a nuestra función correcta.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. **Haz clic en el botón verde "RUN"**

### **Paso 3: Verificar que la Limpieza fue Exitosa**

Ejecuta estas consultas para verificar que todo esté correcto:

```sql
-- 1. Verificar que solo existe un trigger
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Debería mostrar 1 fila con nuestro trigger

-- 2. Verificar que solo existe una función
SELECT 
    routine_name, 
    security_type, 
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
  AND routine_schema = 'public';

-- Debería mostrar 1 fila con security_type = 'DEFINER'

-- 3. Verificar que no queden funciones duplicadas
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%profile%';

-- Debería mostrar solo 'handle_new_user'
```

### **Paso 4: Probar el Registro Final**

1. **Abrir consola del navegador** (F12)
2. **Navegar a `/join-as-pro`**
3. **Completar formulario** con datos válidos
4. **Enviar formulario**
5. **Verificar logs** en consola

## 🔍 Logs Esperados

### **En la Consola del Navegador:**
```javascript
🚀 INICIANDO REGISTRO PROFESIONAL...
📋 Datos del formulario: {...}
🔗 URL de redirección: http://localhost:3010/auth/callback
📤 Enviando metadatos a Supabase: {...}
🔍 Verificación de datos críticos: {...}
📥 Respuesta completa de Supabase: {...}
✅ Usuario creado exitosamente: {...}
🔧 El trigger creará el perfil automáticamente con los metadatos enviados
```

### **En la Base de Datos:**
```sql
-- Verificar que el perfil se creó correctamente
SELECT 
    id, 
    user_id, 
    full_name, 
    email, 
    role, 
    profession,
    membership_status
FROM public.profiles 
WHERE email = 'tu-email@ejemplo.com';

-- Debería mostrar:
-- role = 'profesional'
-- membership_status = 'free'
-- full_name = 'Nombre del Usuario'
```

## ✅ Resultado Esperado

Después de ejecutar el script de limpieza:

1. ✅ **Solo un trigger** - `on_auth_user_created`
2. ✅ **Solo una función** - `handle_new_user`
3. ✅ **Sin conflictos** - Triggers duplicados eliminados
4. ✅ **Registro funciona** - Sin errores de base de datos
5. ✅ **Perfil se crea** - Automáticamente con role correcto

## 🆘 Solución de Problemas

### **Si el Script Falla:**

1. **Verificar permisos** - Asegúrate de estar logueado como propietario
2. **Verificar dependencias** - Ejecutar las consultas de verificación
3. **Contactar soporte** - Si persisten los problemas de permisos

### **Si los Triggers No se Eliminan:**

1. **Verificar nombres exactos** - Usar los nombres de los errores
2. **Ejecutar uno por uno** - Eliminar triggers individualmente
3. **Verificar funciones** - Eliminar funciones antes de triggers

## 📝 Archivos de la Solución

1. **`final-cleanup-and-install.sql`** - Script de limpieza completo
2. **`LIMPIEZA_FINAL_TRIGGERS.md`** - Esta guía

## ✅ Checklist de Verificación

- [ ] **Permisos de propietario** confirmados
- [ ] **Script de limpieza ejecutado** sin errores
- [ ] **Solo un trigger** existe (on_auth_user_created)
- [ ] **Solo una función** existe (handle_new_user)
- [ ] **Sin funciones duplicadas** en la base de datos
- [ ] **Registro funciona** sin errores de base de datos
- [ ] **Perfil se crea** automáticamente
- [ ] **Role se asigna** correctamente ('profesional')

La limpieza final eliminará todos los conflictos y dejará tu base de datos en un estado perfecto para el registro de profesionales.
