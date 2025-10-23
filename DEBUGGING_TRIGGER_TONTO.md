# Debugging con Trigger "Tonto"

## 🎯 Estrategia de Debugging

Hemos implementado un "trigger tonto" para aislar exactamente dónde está el problema. Esta técnica nos permitirá determinar si el problema está en la lógica o en los permisos fundamentales.

## 🔧 Trigger "Tonto" Implementado

### **Características del Trigger Tonto:**
- ✅ **Ignora completamente** los datos del frontend (`raw_user_meta_data`)
- ✅ **Inserta valores fijos** ("hardcodeados") para todos los campos
- ✅ **Sin lógica condicional** - solo INSERT básico
- ✅ **Objetivo único**: Ver si una operación INSERT básica puede tener éxito

### **Valores Hardcodeados:**
```sql
INSERT INTO public.profiles (
  user_id, 
  full_name, 
  email,
  membership_status,
  role
)
VALUES (
  NEW.id,
  'Test User', -- Hardcoded value
  NEW.email,
  'free',      -- Hardcoded value
  'client'     -- Hardcoded value
);
```

## 🚀 Pasos de Implementación

### **Paso 1: Ejecutar el Script del Trigger Tonto**

1. **Ve a tu dashboard de Supabase**
2. **Navega a SQL Editor**
3. **Haz clic en "+ New query"**
4. **Copia y pega el siguiente código COMPLETO:**

```sql
-- Step 1: Drop the existing trigger to remove the dependency.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Replace the function with a "dumb" version for debugging.
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
    membership_status,
    role
  )
  VALUES (
    NEW.id,
    'Test User', -- Hardcoded value
    NEW.email,
    'free',      -- Hardcoded value
    'client'     -- Hardcoded value
  );
  RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger to point to the new "dumb" function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. **Haz clic en el botón verde "RUN"**

### **Paso 2: Verificar que el Script se Ejecutó Correctamente**

El script debería ejecutarse sin errores. Si hay algún error, verifica que:
- ✅ **No hay usuarios activos** en el proceso de registro
- ✅ **La tabla `profiles` existe** y tiene la estructura correcta
- ✅ **Los permisos de la base de datos** están configurados correctamente

### **Paso 3: Realizar el Test de Debugging**

1. **Eliminar cualquier usuario de prueba** de Authentication
2. **Ir a la página `/join-as-pro`**
3. **Registrarse con un email y contraseña nuevos**
4. **No importa lo que pongas en los campos de "Nombre" o "Profesión"** - serán ignorados
5. **Observar el resultado**

## 🔍 Análisis de Resultados

### **CASO A: El registro tiene éxito ✅**

**Diagnóstico:** ¡Buenas noticias! Esto confirma que:
- ✅ **No hay un problema de permisos fundamental**
- ✅ **El error está en nuestra lógica anterior**
- ✅ **Específicamente en cómo accedemos a `NEW.raw_user_meta_data`**

**Siguiente Paso:** Volveremos a la función "inteligente", pero accederemos a los datos de una forma ligeramente diferente.

### **CASO B: El registro VUELVE A FALLAR ❌**

**Diagnóstico:** Esto es muy raro e indicaría:
- ❌ **Un problema de permisos grave** en tu proyecto de Supabase
- ❌ **Conflicto con alguna otra política** o restricción
- ❌ **Problema a nivel de permisos del rol postgres** sobre el esquema public

**Siguiente Paso:** La solución más rápida sería contactar al soporte de Supabase o revisar los permisos del rol postgres sobre el esquema public.

## 📋 Logs Esperados

### **Si el Trigger Tonto Funciona:**

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

### **Si el Trigger Tonto Falla:**

```javascript
🚀 INICIANDO REGISTRO PROFESIONAL...
📋 Datos del formulario: {...}
🔗 URL de redirección: http://localhost:3010/auth/callback
📤 Enviando metadatos a Supabase: {...}
🔍 Verificación de datos críticos: {...}
❌ Error al crear usuario: Database error saving new user
```

## 🔍 Verificación en la Base de Datos

### **Si el Trigger Tonto Funciona:**

```sql
-- Verificar que el perfil se creó con valores hardcodeados
SELECT 
    id, 
    user_id, 
    full_name, 
    email, 
    role, 
    membership_status
FROM public.profiles 
WHERE email = 'tu-email@ejemplo.com';

-- Debería mostrar:
-- full_name = 'Test User'
-- role = 'client'
-- membership_status = 'free'
```

### **Si el Trigger Tonto Falla:**

```sql
-- Verificar que NO se creó el perfil
SELECT COUNT(*) FROM public.profiles 
WHERE email = 'tu-email@ejemplo.com';

-- Debería mostrar: 0
```

## 🎯 Próximos Pasos Según el Resultado

### **Si CASO A (Funciona):**

1. **El problema está en la lógica** de acceso a `raw_user_meta_data`
2. **Volveremos a la función inteligente** con acceso mejorado a los datos
3. **Implementaremos logging detallado** para ver exactamente qué datos llegan
4. **Corregiremos la lógica** de asignación de roles

### **Si CASO B (Falla):**

1. **El problema está en los permisos fundamentales**
2. **Contactar soporte de Supabase** para revisar permisos del rol postgres
3. **Revisar políticas RLS** en la tabla profiles
4. **Considerar solución alternativa** sin triggers

## 📝 Archivos de la Solución

1. **`dumb-trigger-debug.sql`** - Script del trigger tonto
2. **`DEBUGGING_TRIGGER_TONTO.md`** - Esta guía

## ✅ Checklist de Verificación

- [ ] **Script del trigger tonto ejecutado** sin errores
- [ ] **Trigger activo** (1 fila en consulta de triggers)
- [ ] **Función con SECURITY DEFINER** (security_type = 'DEFINER')
- [ ] **Test de registro realizado** con email nuevo
- [ ] **Resultado analizado** (CASO A o CASO B)
- [ ] **Próximos pasos definidos** según el resultado

El trigger "tonto" es una herramienta de debugging muy efectiva que nos permitirá identificar exactamente dónde está el problema y cómo solucionarlo.
