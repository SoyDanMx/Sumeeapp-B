# Solución al Error "Database error saving new user"

## 🔍 Diagnóstico del Problema

El error `AuthApiError: Database error saving new user` indica que hay un problema con el trigger de la base de datos al intentar crear un nuevo usuario. Esto puede deberse a:

1. **Trigger no existe o no está activo**
2. **Tablas no existen o tienen estructura incorrecta**
3. **Permisos insuficientes**
4. **Error en la lógica del trigger**
5. **Políticas RLS bloqueando la inserción**

## 🛠️ Solución Paso a Paso

### **Paso 1: Diagnosticar el Estado de la Base de Datos**

Ejecuta el script de diagnóstico en el SQL Editor de Supabase:

```sql
-- Ejecutar el contenido de diagnose-database.sql
-- Esto verificará el estado de las tablas, triggers y permisos
```

### **Paso 2: Aplicar el Trigger Simplificado**

Si el diagnóstico muestra problemas, aplica el trigger simplificado:

```sql
-- Ejecutar el contenido de simple-handle-new-user.sql
-- Este trigger es más robusto y menos propenso a errores
```

### **Paso 3: Verificar que las Tablas Existan**

Asegúrate de que las tablas tengan la estructura correcta:

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

### **Paso 4: Verificar el Trigger**

```sql
-- Verificar que el trigger existe
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar que la función existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';
```

### **Paso 5: Probar el Registro**

1. **Abrir la consola del navegador** (F12)
2. **Navegar a `/join-as-pro`**
3. **Completar el formulario** con datos válidos
4. **Enviar el formulario**
5. **Verificar los logs** en la consola del navegador

### **Paso 6: Verificar Logs de Supabase**

En el dashboard de Supabase, ve a **Logs** y busca errores relacionados con `handle_new_user`.

## 🔧 Soluciones Alternativas

### **Opción A: Trigger Simplificado (Recomendado)**

Si el trigger complejo falla, usa el trigger simplificado:

```sql
-- Contenido de simple-handle-new-user.sql
-- Este trigger es más simple y robusto
```

### **Opción B: Trigger de Debug**

Si necesitas más información de debugging:

```sql
-- Contenido de debug-handle-new-user.sql
-- Este trigger incluye logging detallado
```

### **Opción C: Crear Perfil Manualmente**

Si el trigger sigue fallando, puedes crear el perfil manualmente en el frontend:

```typescript
// Después de signUp exitoso, crear perfil manualmente
const { data: authData, error: authError } = await supabase.auth.signUp({...});

if (authData.user && !authError) {
  // Crear perfil manualmente
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: authData.user.id,
      role: 'profesional',
      full_name: formData.fullName,
      email: formData.email
    });
    
  if (profileError) {
    console.error('Error creando perfil:', profileError);
  }
}
```

## 🚨 Soluciones de Emergencia

### **Si el Trigger Sigue Fallando:**

1. **Deshabilitar el trigger temporalmente:**
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

2. **Crear perfiles manualmente en el frontend:**
```typescript
// En el componente de registro, después de signUp exitoso
const createProfile = async (user: User, formData: any) => {
  const { error } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      role: 'profesional',
      full_name: formData.fullName,
      email: user.email
    });
    
  if (error) {
    console.error('Error creando perfil:', error);
    throw error;
  }
};
```

3. **Usar un endpoint de API:**
```typescript
// Crear un endpoint en /api/create-profile
// que maneje la creación de perfiles
```

## 📋 Checklist de Verificación

- [ ] **Tablas existen** (profiles, profesionales)
- [ ] **Trigger está activo** (on_auth_user_created)
- [ ] **Función existe** (handle_new_user)
- [ ] **Permisos correctos** (RLS policies)
- [ ] **Logs de Supabase** no muestran errores
- [ ] **Consola del navegador** muestra logs detallados
- [ ] **Registro funciona** sin errores

## 🔍 Debugging Avanzado

### **Logs en el Navegador:**
```javascript
// El componente ahora incluye logs detallados:
console.log("🚀 INICIANDO REGISTRO PROFESIONAL...");
console.log("📋 Datos del formulario:", {...});
console.log("📤 Enviando metadatos a Supabase:", {...});
console.log("📥 Respuesta completa de Supabase:", {...});
```

### **Logs en Supabase:**
```sql
-- El trigger incluye logging detallado:
RAISE LOG '=== INICIANDO REGISTRO DE USUARIO ===';
RAISE LOG 'User ID: %', NEW.id;
RAISE LOG 'Email: %', user_email;
RAISE LOG 'Role asignado: %', user_role;
```

## ✅ Resultado Esperado

Después de aplicar la solución:

1. **El registro funciona** sin errores de base de datos
2. **El usuario se crea** en `auth.users`
3. **El perfil se crea** en `profiles` con role 'profesional'
4. **Los datos específicos se crean** en `profesionales`
5. **El email de confirmación se envía** correctamente
6. **La redirección funciona** después del registro

## 🆘 Si el Problema Persiste

Si después de seguir todos los pasos el error persiste:

1. **Verificar la configuración de Supabase** (URL, keys)
2. **Revisar las políticas RLS** en las tablas
3. **Verificar los permisos** del usuario anónimo
4. **Contactar soporte de Supabase** si es necesario

La solución está diseñada para ser robusta y manejar la mayoría de casos de error comunes.
