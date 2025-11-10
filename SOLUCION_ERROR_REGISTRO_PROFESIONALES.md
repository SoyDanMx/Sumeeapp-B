# 🐛 SOLUCIÓN: Error al Registrar Profesionales

## 🚨 **PROBLEMA IDENTIFICADO**

```
Error al crear usuario: Error en la base de datos. 
Verifica que el trigger esté configurado correctamente.
```

**Contexto**:
- Usuario intenta registrarse como profesional en `/join-as-pro`
- Formulario completado correctamente
- Error ocurre al hacer click en "Registrarse como Profesional"

**Captura de pantalla**:
- Formulario con todos los campos llenos
- Mensaje de error en rojo
- Profesión: Plomero
- Bio completa sobre servicios

---

## 🔍 **CAUSA RAÍZ**

El trigger `handle_new_user` que creamos anteriormente **NO ESTÁ APLICADO** en Supabase.

### **Scripts que creamos pero NO ejecutamos**:
1. ✅ `update-trigger-handle-new-user-location.sql` (creado pero no ejecutado)
2. ✅ `migrate-professionals-location.sql` (creado pero no ejecutado)

**Resultado**: El trigger anterior (sin soporte de ubicación) sigue activo, o peor, NO hay trigger.

---

## ✅ **SOLUCIÓN INMEDIATA**

### **PASO 1: Ejecutar Script de Fix** (5 min)

Ve a Supabase Dashboard y ejecuta este script:

**Archivo**: `fix-trigger-profesionales-completo.sql`

#### **¿Qué hace este script?**:
```sql
1. DROP TRIGGER IF EXISTS on_auth_user_created
   → Elimina trigger anterior
   
2. DROP FUNCTION IF EXISTS handle_new_user()
   → Elimina función anterior
   
3. CREATE FUNCTION handle_new_user()
   → Crea función COMPLETA con:
     • Soporte para profesionales
     • Soporte para clientes
     • Ubicacion_lat y ubicacion_lng
     • Work_zones
     • Bio
     • Manejo robusto de errores
     • Logs detallados (RAISE NOTICE)
     
4. CREATE TRIGGER on_auth_user_created
   → Crea trigger en auth.users
   
5. GRANT EXECUTE
   → Da permisos necesarios
   
6. Verificación automática
   → Confirma que se creó correctamente
```

#### **Instrucciones**:
```
1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto: sumeeapp
3. Click en "SQL Editor" (menú izquierdo)
4. Click "New Query"
5. Copiar contenido completo de: fix-trigger-profesionales-completo.sql
6. Pegar en el editor
7. Click "Run" (o Ctrl+Enter)
8. Verificar output:
   ✅ "Trigger y función creados exitosamente"
   ✅ Debe mostrar tabla con Trigger y Función
```

---

## 🧪 **VERIFICACIÓN**

### **Test 1: Verificar que el trigger existe**

```sql
-- En Supabase SQL Editor:
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Resultado esperado:
-- trigger_name          | event_object_table | action_timing | event_manipulation
-- on_auth_user_created | users              | AFTER         | INSERT
```

### **Test 2: Verificar que la función existe**

```sql
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- Resultado esperado:
-- routine_name    | routine_type | security_type
-- handle_new_user | FUNCTION     | DEFINER
```

### **Test 3: Intentar registro de nuevo**

```
1. Ir a: https://sumeeapp.com/join-as-pro
2. Completar formulario:
   - Nombre: Juan Pérez
   - Email: test@example.com
   - Password: test1234
   - WhatsApp: 5512345678
   - Profesión: Plomero
   - Ciudad: Ciudad de México
   - Bio: "Plomero con 10 años de experiencia..."
3. Click "Registrarse como Profesional"
4. Resultado esperado:
   ✅ Registro exitoso
   ✅ Email de confirmación enviado
   ✅ Redirect a página de confirmación
```

### **Test 4: Verificar en Supabase**

```sql
-- Ver último usuario creado
SELECT 
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'profession' as profession
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- Ver perfil correspondiente
SELECT 
  email,
  full_name,
  profession,
  role,
  whatsapp,
  city,
  ubicacion_lat,
  ubicacion_lng
FROM profiles
WHERE email = 'test@example.com';

-- Resultado esperado:
-- ✅ Usuario existe en auth.users
-- ✅ Perfil existe en profiles
-- ✅ role = 'profesional'
-- ✅ profession = 'Plomero'
-- ✅ whatsapp = '5512345678'
```

---

## 📊 **DIAGNÓSTICO ADICIONAL**

Si el problema persiste después de ejecutar el fix, usa estos queries:

### **Query 1: Ver todos los triggers en auth.users**
```sql
SELECT * FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

### **Query 2: Ver logs de errores**
```sql
-- Si tienes acceso a logs de Postgres
SELECT * FROM pg_stat_statements
WHERE query LIKE '%handle_new_user%'
ORDER BY last_exec_time DESC
LIMIT 10;
```

### **Query 3: Verificar permisos**
```sql
SELECT 
  routine_schema,
  routine_name,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'handle_new_user';
```

---

## 🔧 **PLAN B: Si el Fix No Funciona**

### **Opción 1: Usar RPC en lugar de trigger**

Modificar `src/app/join-as-pro/page.tsx` para crear perfil manualmente:

```typescript
// Después de signUp exitoso:
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    emailRedirectTo,
    data: userMetadata,
  },
});

// NUEVO: Crear perfil manualmente si no existe
if (authData.user && !authError) {
  await supabase.from('profiles').insert({
    user_id: authData.user.id,
    email: authData.user.email,
    full_name: formData.fullName,
    whatsapp: normalizedPhone,
    profession: formData.profession,
    bio: formData.bio,
    city: realCity,
    ubicacion_lat,
    ubicacion_lng,
    work_zones: formData.workZones,
    role: 'profesional',
    membership_status: 'free',
    status: 'active',
  });
}
```

### **Opción 2: Usar Supabase Edge Function**

Crear función serverless que maneje el registro:

```typescript
// supabase/functions/register-professional/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { email, password, ...profileData } = await req.json()
  
  // 1. Crear usuario en auth
  const { user, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  // 2. Crear perfil
  await supabase.from('profiles').insert({
    user_id: user.id,
    ...profileData
  })
  
  return new Response(JSON.stringify({ success: true }))
})
```

---

## 📝 **RESUMEN**

### **Problema**:
```
❌ Trigger handle_new_user no existe o está desactualizado
❌ Registro de profesionales falla con error de DB
❌ No se crea perfil automáticamente
```

### **Solución**:
```
✅ Ejecutar fix-trigger-profesionales-completo.sql en Supabase
✅ Verificar que trigger y función existen
✅ Probar registro de nuevo
✅ Confirmar en Supabase que perfil se creó
```

### **Tiempo estimado**: 5-10 minutos

---

## 🚀 **ACCIÓN INMEDIATA**

### **AHORA MISMO**:
```
1. Abrir Supabase Dashboard
2. SQL Editor → New Query
3. Copiar y pegar: fix-trigger-profesionales-completo.sql
4. Ejecutar (Ctrl+Enter)
5. Verificar output: "✅ Trigger y función creados"
6. Probar registro en /join-as-pro
```

### **SI FUNCIONA**:
```
✅ Registrar profesional de prueba
✅ Verificar email de confirmación
✅ Confirmar perfil en Supabase
✅ Marcar como resuelto
```

### **SI NO FUNCIONA**:
```
⚠️ Ejecutar queries de diagnóstico
⚠️ Revisar logs de Postgres
⚠️ Implementar Plan B (RPC manual)
⚠️ Contactar soporte de Supabase
```

---

## 📌 **ARCHIVOS CREADOS**

1. ✅ `diagnostico-trigger-profesionales.sql`
   - Queries para verificar estado actual
   - Ver triggers existentes
   - Ver últimos usuarios

2. ✅ `fix-trigger-profesionales-completo.sql`
   - Script completo de fix
   - Drop + Create trigger
   - Drop + Create función
   - Verificación automática

3. ✅ `SOLUCION_ERROR_REGISTRO_PROFESIONALES.md` (este archivo)
   - Documentación completa
   - Paso a paso
   - Diagnóstico
   - Plan B

---

## 🎯 **RESULTADO ESPERADO**

### **Después del Fix**:
```
Usuario completa formulario en /join-as-pro
       ↓
Click "Registrarse como Profesional"
       ↓
supabase.auth.signUp()
       ↓
Trigger on_auth_user_created se ejecuta
       ↓
Función handle_new_user() crea perfil
       ↓
✅ Usuario creado en auth.users
✅ Perfil creado en profiles
✅ Email de confirmación enviado
✅ Redirect a página de éxito
```

---

**¿Listo para ejecutar el fix?** 🚀

El script está en: `src/lib/supabase/fix-trigger-profesionales-completo.sql`

Solo cópialo y pégalo en Supabase SQL Editor. ¡El problema se resolverá en segundos!

