# Solución Manual para el Error de Registro

## 🚨 Problema Identificado

El error `Database error saving new user` indica que el trigger de la base de datos está fallando. La solución es deshabilitar el trigger problemático y manejar la creación de perfiles manualmente en el frontend.

## 🛠️ Solución Paso a Paso

### **Paso 1: Deshabilitar el Trigger Problemático**

1. **Abrir el SQL Editor en Supabase**
2. **Ejecutar el script de deshabilitación:**

```sql
-- Contenido de disable-trigger.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

3. **Verificar que el trigger esté deshabilitado:**

```sql
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado:** 0 filas (el trigger ya no existe)

### **Paso 2: Verificar que las Tablas Existan**

```sql
-- Verificar tabla profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Verificar tabla profesionales
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profesionales' AND table_schema = 'public';
```

### **Paso 3: Probar el Registro**

1. **Abrir la consola del navegador** (F12)
2. **Navegar a `/join-as-pro`**
3. **Completar el formulario** con datos válidos
4. **Enviar el formulario**
5. **Verificar los logs** en la consola

### **Paso 4: Verificar que los Datos se Crearon**

```sql
-- Verificar que el perfil se creó
SELECT * FROM public.profiles 
WHERE email = 'tu-email@ejemplo.com';

-- Verificar que los datos de profesional se crearon
SELECT * FROM public.profesionales 
WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'tu-email@ejemplo.com');
```

## 🔧 Cómo Funciona la Solución Manual

### **Flujo del Registro:**

1. **Usuario completa el formulario** y hace clic en "Registrarse"
2. **Se llama a `supabase.auth.signUp()`** con los datos del formulario
3. **Supabase crea el usuario** en `auth.users` (sin trigger)
4. **Se ejecuta `createUserProfile()`** manualmente:
   - Crea perfil base en `profiles` con role 'profesional'
   - Crea datos específicos en `profesionales`
5. **Se muestra mensaje de éxito** y redirección

### **Ventajas de la Solución Manual:**

- ✅ **No depende del trigger** problemático
- ✅ **Control total** sobre la creación de perfiles
- ✅ **Logging detallado** para debugging
- ✅ **Manejo de errores** robusto
- ✅ **Funciona inmediatamente** sin configuración adicional

### **Logs Esperados en la Consola:**

```javascript
🚀 INICIANDO REGISTRO PROFESIONAL...
📋 Datos del formulario: {...}
🔗 URL de redirección: http://localhost:3010/auth/callback
📤 Enviando metadatos a Supabase: {...}
📥 Respuesta completa de Supabase: {...}
✅ Usuario creado exitosamente: {...}
🔧 Creando perfil manualmente para usuario: uuid
✅ Perfil base creado: {...}
✅ Datos de profesional creados: {...}
🎉 Perfil creado exitosamente de forma manual
```

## 🚨 Solución de Problemas

### **Si el Registro Sigue Fallando:**

1. **Verificar que el trigger esté deshabilitado:**
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

2. **Verificar permisos RLS:**
```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'profesionales') 
  AND schemaname = 'public';
```

3. **Verificar que las tablas existan:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'profesionales');
```

### **Si los Perfiles No se Crean:**

1. **Verificar logs en la consola** del navegador
2. **Verificar que el usuario esté autenticado** después del registro
3. **Verificar permisos** en las tablas
4. **Crear perfil manualmente** si es necesario

## 📋 Checklist de Verificación

- [ ] **Trigger deshabilitado** (0 filas en consulta de triggers)
- [ ] **Tablas existen** (profiles, profesionales)
- [ ] **Permisos RLS correctos** (políticas activas)
- [ ] **Registro funciona** sin errores de base de datos
- [ ] **Perfil se crea** en tabla profiles
- [ ] **Datos de profesional se crean** en tabla profesionales
- [ ] **Logs aparecen** en consola del navegador
- [ ] **Redirección funciona** después del registro

## 🔄 Alternativas si la Solución Manual Fallan

### **Opción A: Endpoint de API**

Crear un endpoint en `/api/create-profile` que maneje la creación de perfiles:

```typescript
// pages/api/create-profile.ts
export default async function handler(req, res) {
  const { user_id, formData } = req.body;
  
  // Crear perfil base
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id,
      role: 'profesional',
      full_name: formData.fullName,
      email: formData.email
    });
    
  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }
  
  // Crear datos de profesional
  const { error: profesionalError } = await supabase
    .from('profesionales')
    .insert({
      user_id,
      profession: formData.profession,
      whatsapp: formData.phone
    });
    
  res.status(200).json({ success: true });
}
```

### **Opción B: Función de Supabase**

Crear una función de Supabase que maneje la creación de perfiles:

```sql
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_profession TEXT,
  p_whatsapp TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Crear perfil base
  INSERT INTO public.profiles (user_id, role, full_name, email)
  VALUES (p_user_id, 'profesional', p_full_name, p_email);
  
  -- Crear datos de profesional
  INSERT INTO public.profesionales (user_id, profession, whatsapp)
  VALUES (p_user_id, p_profession, p_whatsapp);
  
  RETURN json_build_object('success', true);
END;
$$;
```

## ✅ Resultado Esperado

Después de implementar la solución manual:

1. ✅ **El registro funciona** sin errores de base de datos
2. ✅ **El usuario se crea** en `auth.users`
3. ✅ **El perfil se crea** en `profiles` con role 'profesional'
4. ✅ **Los datos específicos se crean** en `profesionales`
5. ✅ **El email de confirmación se envía** correctamente
6. ✅ **La redirección funciona** después del registro
7. ✅ **Los logs aparecen** en la consola del navegador

La solución manual es **robusta, confiable y no depende de triggers problemáticos**.
