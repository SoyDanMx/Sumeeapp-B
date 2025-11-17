# 📧 Guía: Confirmar Email del Usuario de Prueba

## Problema

El usuario de prueba `cliente@sumeeapp.com` no puede iniciar sesión porque su email no está confirmado. Supabase requiere que los emails sean confirmados antes de permitir el login.

## Soluciones Disponibles

### ✅ Opción 1: Dashboard de Supabase (MÁS FÁCIL - Recomendado)

**Pasos:**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto SumeeApp
3. En el menú lateral, ve a **Authentication**
4. Haz clic en **Users**
5. En la barra de búsqueda, busca: `cliente@sumeeapp.com`
6. Haz clic en el usuario encontrado
7. En la sección **Email**, verás un botón **"Confirm email"** o un toggle **"Email confirmed"**
8. Haz clic en **"Confirm email"** o activa el toggle
9. ✅ Listo! El email está confirmado

**Tiempo estimado:** 1-2 minutos

---

### ✅ Opción 2: Endpoint API (Programático)

**Usando el endpoint de administración:**

```bash
curl -X POST https://sumeeapp.com/api/admin/confirm-user-email \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@sumeeapp.com"}'
```

**O usando el endpoint de prueba (solo para emails de prueba):**

```bash
curl -X POST https://sumeeapp.com/api/confirm-test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@sumeeapp.com"}'
```

**Desde el navegador (JavaScript):**

```javascript
fetch('/api/admin/confirm-user-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'cliente@sumeeapp.com' })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Tiempo estimado:** 30 segundos

---

### ✅ Opción 3: Desde el Login (Solo Desarrollo)

Si estás en **desarrollo local** (`localhost:3000`):

1. Ve a `/login`
2. Ingresa: `cliente@sumeeapp.com`
3. Ingresa cualquier contraseña (o `TestCliente123!`)
4. Cuando aparezca el error "Email no confirmado"
5. Haz clic en **"Reenviar confirmación"**
6. El sistema confirmará automáticamente el email de prueba

**Tiempo estimado:** 10 segundos

---

### ✅ Opción 4: Script SQL (Solo Verificación)

**Nota:** Este script NO puede confirmar el email directamente (por seguridad de Supabase), pero puede verificar el estado.

Ejecuta en Supabase SQL Editor:

```sql
-- Verificar estado del usuario
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'cliente@sumeeapp.com';
```

Si `email_confirmed_at` es `NULL`, el email no está confirmado.

---

## Verificación

Después de confirmar el email, verifica que funcionó:

1. **Desde Supabase Dashboard:**
   - Ve a Authentication > Users
   - Busca `cliente@sumeeapp.com`
   - Verifica que "Email confirmed" esté en `true`

2. **Intentando Login:**
   - Ve a `/login`
   - Ingresa: `cliente@sumeeapp.com` / `TestCliente123!`
   - Deberías poder iniciar sesión sin el error de confirmación

---

## Troubleshooting

### Error: "Usuario no encontrado"

- Verifica que el email sea exactamente: `cliente@sumeeapp.com`
- Verifica que el usuario exista en Supabase Authentication

### Error: "Email ya está confirmado"

- El email ya está confirmado, puedes proceder con el login
- Verifica el estado en Supabase Dashboard

### Error: "Solo se pueden confirmar emails de prueba"

- El endpoint `/api/confirm-test-email` solo acepta emails en la lista blanca
- Usa `/api/admin/confirm-user-email` en su lugar

### El login sigue fallando después de confirmar

1. Cierra sesión completamente (si hay una sesión activa)
2. Limpia las cookies del navegador
3. Intenta iniciar sesión de nuevo
4. Verifica que `email_confirmed_at` no sea `NULL` en Supabase

---

## Información del Usuario

- **Email:** `cliente@sumeeapp.com`
- **User ID:** `90ce751d-8e90-47a3-abc1-36c1e033d48d`
- **Contraseña:** `TestCliente123!`
- **Rol:** Cliente
- **Plan:** Express Free

---

## Recomendación

**Para testing rápido:** Usa la **Opción 1 (Dashboard de Supabase)** - Es la más rápida y visual.

**Para automatización:** Usa la **Opción 2 (Endpoint API)** - Puede ser integrada en scripts de testing.

---

**Última actualización:** 2025-11-17

