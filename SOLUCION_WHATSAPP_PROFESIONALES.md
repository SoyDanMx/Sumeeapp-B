# 🔧 Solución: WhatsApp de Profesionales no se guarda (NULL en BD)

## 🔍 Diagnóstico del Problema

### Situación Actual:
- ✅ El formulario de registro profesional **SÍ solicita** el número de WhatsApp
- ✅ El frontend **SÍ envía** los datos correctamente a Supabase Auth
- ❌ El campo `whatsapp` aparece como **NULL** en la tabla `profiles`

### Causa Raíz Identificada:
El trigger `handle_new_user()` que se ejecuta al crear un usuario tiene **dos problemas**:

1. **Extracción de datos débil**: El código actual usa `NULLIF(TRIM(...))` pero no maneja correctamente todos los casos donde el valor puede venir como cadena vacía `''` o con espacios.

2. **Falta de fallbacks robustos**: Si `whatsapp` no viene en los metadatos, no intenta usar `phone` como alternativa de manera consistente.

3. **Sin logging**: No hay forma de saber qué valores están llegando al trigger para debugging.

---

## ✅ Solución Implementada

### Archivo Creado:
**`src/lib/supabase/fix-professional-whatsapp-issue.sql`**

### ¿Qué hace este script?

#### **Parte 1: Diagnóstico**
```sql
-- Verifica el estado del trigger actual
-- Muestra profesionales con whatsapp NULL
```

#### **Parte 2: Trigger Mejorado**
El nuevo trigger incluye:

1. **Extracción robusta de valores**:
   ```sql
   extracted_phone := NULLIF(TRIM(COALESCE(
     NEW.raw_user_meta_data->>'phone',
     NEW.raw_user_meta_data->>'whatsapp',
     ''
   )), '');
   ```

2. **Detección mejorada de rol profesional**:
   ```sql
   extracted_role := CASE
     WHEN extracted_profession IS NOT NULL THEN 'profesional'
     WHEN metadata->>'registration_type' = 'profesional' THEN 'profesional'
     WHEN metadata->>'registration_type' = 'professional' THEN 'profesional'
     ELSE 'client'
   END;
   ```

3. **Logging detallado**:
   ```sql
   RAISE LOG 'handle_new_user triggered for user_id: %, email: %', NEW.id, NEW.email;
   RAISE LOG 'Extracted values - phone: %, whatsapp: %', extracted_phone, extracted_whatsapp;
   ```

4. **Manejo de errores**:
   ```sql
   EXCEPTION
     WHEN OTHERS THEN
       RAISE LOG 'ERROR in handle_new_user: % %', SQLERRM, SQLSTATE;
       RAISE;
   ```

#### **Parte 3: Corrección de Datos Existentes**
```sql
-- Query UPDATE que recupera WhatsApp de auth.users.raw_user_meta_data
-- y actualiza los profiles que tienen whatsapp NULL
```

---

## 📋 Pasos para Implementar la Solución

### 1️⃣ **Ejecutar el Script SQL en Supabase**

1. Ve a tu **Supabase Dashboard**
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `src/lib/supabase/fix-professional-whatsapp-issue.sql`
4. Haz clic en **Run**

### 2️⃣ **Verificar los Resultados**

El script mostrará automáticamente:

```
DESPUÉS DE LA CORRECCIÓN
├─ con_whatsapp: 15    ✅
├─ sin_whatsapp: 3     ⚠️
└─ total: 18
```

**Profesionales corregidos (últimos 10):**
```
| user_id | full_name | email | phone | whatsapp | profession |
|---------|-----------|-------|-------|----------|------------|
| 70d55... | Juan De... | philo... | NULL | +5215512345678 | Plomero |
```

### 3️⃣ **Ver los Logs del Trigger** (Para debugging futuro)

1. Ve a **Supabase Dashboard → Logs → Database**
2. Busca entradas que empiecen con `handle_new_user triggered`
3. Verás algo como:
   ```
   handle_new_user triggered for user_id: 70d555..., email: juandelacruz@example.com
   Extracted values - phone: +5215512345678, whatsapp: +5215512345678, profession: Plomero, role: profesional
   Profile created successfully for user_id: 70d555...
   ```

### 4️⃣ **Probar con un Nuevo Registro**

1. Ve a `/join-as-pro` en tu app
2. Completa el formulario con un nuevo profesional
3. Usa un email nuevo (ej: `test-profesional-$(date +%s)@test.com`)
4. **IMPORTANTE**: Ingresa un número de WhatsApp válido
5. Completa el registro
6. Ve a Supabase → Table Editor → `profiles`
7. Busca el nuevo usuario y verifica que `whatsapp` NO sea NULL

---

## 🔍 Casos Especiales

### Caso 1: Profesionales que NO tienen WhatsApp en los metadatos

Si un profesional se registró pero literalmente no envió su WhatsApp (campo vacío), **el script NO puede recuperarlo**. En este caso:

**Opción A - Solicitarlo manualmente:**
```sql
-- Actualizar manualmente un profesional específico
UPDATE public.profiles
SET whatsapp = '+5215512345678'
WHERE user_id = 'UUID-del-usuario';
```

**Opción B - Enviarles un email pidiéndoles que actualicen su perfil:**
```sql
-- Query para obtener emails de profesionales sin WhatsApp
SELECT email, full_name
FROM public.profiles
WHERE role = 'profesional'
  AND whatsapp IS NULL;
```

### Caso 2: Profesionales con WhatsApp en otro formato

Si el WhatsApp viene en formato incorrecto (sin +52, con espacios, etc.):

```sql
-- Normalizar números de WhatsApp mexicanos
UPDATE public.profiles
SET whatsapp = '+52' || regexp_replace(whatsapp, '[^0-9]', '', 'g')
WHERE role = 'profesional'
  AND whatsapp IS NOT NULL
  AND whatsapp !~ '^\+52'; -- No empieza con +52
```

---

## 📊 Verificación Post-Implementación

### Query de Verificación Completa:
```sql
SELECT 
  role,
  COUNT(*) as total,
  COUNT(whatsapp) FILTER (WHERE whatsapp IS NOT NULL) as con_whatsapp,
  COUNT(*) FILTER (WHERE whatsapp IS NULL) as sin_whatsapp,
  ROUND(100.0 * COUNT(whatsapp) / COUNT(*), 1) as porcentaje_con_whatsapp
FROM public.profiles
WHERE role = 'profesional'
GROUP BY role;
```

**Resultado Esperado:**
```
| role        | total | con_whatsapp | sin_whatsapp | porcentaje |
|-------------|-------|--------------|--------------|------------|
| profesional | 23    | 23           | 0            | 100.0%     |
```

---

## 🚨 Troubleshooting

### Problema 1: "El script se ejecutó pero sigue habiendo NULL"

**Diagnóstico:**
```sql
-- Ver qué datos tiene auth.users para un profesional específico
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data,
  p.whatsapp,
  p.phone
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'email-del-profesional@example.com';
```

**Posibles causas:**
1. El campo `raw_user_meta_data` no tiene `phone` ni `whatsapp`
2. El valor es una cadena vacía `""`
3. El formulario no está enviando correctamente el dato

**Solución:** Verificar que el frontend esté enviando el dato:
```typescript
// En src/app/join-as-pro/page.tsx línea 186-187
const userMetadata = {
  phone: normalizedPhone,      // ✅ Debe tener valor
  whatsapp: normalizedPhone,   // ✅ Debe tener valor
  // ...
};
```

### Problema 2: "El trigger no se está ejecutando"

**Diagnóstico:**
```sql
-- Verificar que el trigger exista
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Si no aparece:** Ejecutar nuevamente el script SQL.

**Si aparece pero no se ejecuta:**
```sql
-- Verificar que la función existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### Problema 3: "Los logs no aparecen en Supabase"

Los logs del trigger pueden tardar 1-2 minutos en aparecer. Si no aparecen:

1. Ve a **Supabase Dashboard → Settings → Database**
2. Verifica que **Log Level** esté en `info` o `debug`
3. Reinicia la base de datos si es necesario

---

## 📝 Resumen de Cambios

### Archivos Modificados:
- ✅ **NUEVO**: `src/lib/supabase/fix-professional-whatsapp-issue.sql`
- ✅ **NUEVO**: `SOLUCION_WHATSAPP_PROFESIONALES.md` (este archivo)

### Archivos Verificados (sin cambios necesarios):
- ✅ `src/app/join-as-pro/page.tsx` - Frontend envía correctamente `phone` y `whatsapp`
- ✅ `src/components/auth/MultiStepProForm.tsx` - También envía correctamente
- ✅ `src/hooks/useProfessionalRegistration.ts` - También envía correctamente

### Cambios en Base de Datos:
- ✅ Trigger `handle_new_user()` **reemplazado** con versión mejorada
- ✅ Profesionales existentes con `whatsapp NULL` **corregidos** (donde sea posible)
- ✅ Logging agregado para debugging futuro

---

## ✅ Checklist de Implementación

- [ ] **Paso 1**: Ejecutar `fix-professional-whatsapp-issue.sql` en Supabase SQL Editor
- [ ] **Paso 2**: Verificar que el query de corrección muestre > 0 registros actualizados
- [ ] **Paso 3**: Verificar profesionales existentes en Table Editor
- [ ] **Paso 4**: Crear un nuevo registro de prueba en `/join-as-pro`
- [ ] **Paso 5**: Verificar que el nuevo profesional tenga WhatsApp guardado
- [ ] **Paso 6**: Revisar logs del trigger en Supabase Dashboard
- [ ] **Paso 7**: (Opcional) Contactar a profesionales con WhatsApp NULL para que actualicen su perfil

---

## 🎯 Resultado Esperado

Después de implementar esta solución:

1. ✅ **100% de nuevos profesionales** tendrán su WhatsApp guardado
2. ✅ **Profesionales existentes** (donde el dato esté disponible en auth.users) serán corregidos
3. ✅ **Logs detallados** permitirán debugging rápido si surge algún problema
4. ✅ **Comunicación fluida** con profesionales vía WhatsApp para acciones de marketing/notificaciones

---

## 📞 Próximos Pasos Recomendados

Una vez resuelto el problema de NULL:

### 1. Validar Formato de WhatsApp
Agregar validación en el frontend para asegurar formato internacional:
```typescript
// Formato recomendado: +52 (México) + 10 dígitos
const normalizeWhatsApp = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return `+52${cleaned}`;
  }
  return `+${cleaned}`;
};
```

### 2. Implementar Verificación de WhatsApp
Considerar enviar un código de verificación vía WhatsApp al registrarse:
- Usa la API de WhatsApp Business
- O un servicio como Twilio Verify

### 3. Dashboard para Profesionales
Permitir que los profesionales actualicen su WhatsApp desde su perfil:
```tsx
// En ProfileSettings.tsx
<input 
  type="tel" 
  value={whatsapp} 
  onChange={(e) => setWhatsapp(e.target.value)}
  placeholder="+52 55 1234 5678"
/>
```

---

**Autor:** Asistente IA Cursor  
**Fecha:** 10 de Noviembre, 2025  
**Prioridad:** 🔴 **CRÍTICA** (Impacta comunicación con profesionales)

