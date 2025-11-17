# ✅ Confirmar Email Usando la Información del Usuario

## 📋 Información del Usuario

Basado en el JSON proporcionado:

```json
{
  "id": "90ce751d-8e90-47a3-abc1-36c1e033d48d",
  "email": "cliente@sumeeapp.com",
  "confirmed_at": null  ← Este campo necesita cambiar
}
```

**Estado actual:** `confirmed_at: null` (email NO confirmado)

---

## 🚀 Soluciones para Confirmar el Email

### ✅ Opción 1: Script Node.js (Usando el User ID)

**Ejecuta desde la raíz del proyecto:**

```bash
node scripts/confirm-email-from-json.js
```

Este script usa directamente el `id` del usuario para confirmar el email.

**Requisitos:**
- Tener `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

**Salida esperada:**
```
🔍 Confirmando email para el usuario:
   ID: 90ce751d-8e90-47a3-abc1-36c1e033d48d
   Email: cliente@sumeeapp.com
   Estado actual: confirmed_at = null (no confirmado)

📧 Confirmando email...

✅ Email confirmado exitosamente!

📋 Información actualizada:
   ID: 90ce751d-8e90-47a3-abc1-36c1e033d48d
   Email: cliente@sumeeapp.com
   confirmed_at: 2025-11-17T...
   updated_at: 2025-11-17T...

🎉 El usuario ahora puede iniciar sesión con:
   Email: cliente@sumeeapp.com
   Password: TestCliente123!
```

---

### ✅ Opción 2: Consola del Navegador (Más Rápida)

1. **Abre cualquier página de sumeeapp.com** (ej: `https://sumeeapp.com/login`)
2. **Abre la Consola del Navegador** (`F12` o `Ctrl+Shift+J`)
3. **Pega este código y presiona Enter:**

```javascript
fetch('https://sumeeapp.com/api/admin/confirm-user-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: '90ce751d-8e90-47a3-abc1-36c1e033d48d',
    email: 'cliente@sumeeapp.com'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ Email confirmado!', data);
    console.log('confirmed_at:', data.user.email_confirmed_at);
    alert('✅ Email confirmado! El usuario ahora puede iniciar sesión.');
  } else {
    console.error('❌ Error:', data);
    alert('❌ Error: ' + (data.error || 'Error desconocido'));
  }
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('❌ Error de conexión');
});
```

4. **Verás el resultado en la consola y un alert**
5. ✅ **Listo!** El campo `confirmed_at` ahora tendrá una fecha

---

### ✅ Opción 3: Dashboard de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **Authentication** > **Users**
4. Busca por ID: `90ce751d-8e90-47a3-abc1-36c1e033d48d`
   - O busca por email: `cliente@sumeeapp.com`
5. Haz clic en el usuario
6. Haz clic en **"Confirm email"** o activa **"Email confirmed"**
7. ✅ **Listo!** El campo `confirmed_at` se actualizará automáticamente

---

### ✅ Opción 4: cURL (Terminal)

```bash
curl -X POST https://sumeeapp.com/api/admin/confirm-user-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "90ce751d-8e90-47a3-abc1-36c1e033d48d",
    "email": "cliente@sumeeapp.com"
  }'
```

---

## 📊 Cambio Esperado en el JSON

**Antes:**
```json
{
  "confirmed_at": null
}
```

**Después:**
```json
{
  "confirmed_at": "2025-11-17T20:30:00.000Z"  // Fecha actual
}
```

---

## ✅ Verificación

Después de confirmar, verifica que funcionó:

1. **Intenta iniciar sesión:**
   - Ve a `https://sumeeapp.com/login`
   - Email: `cliente@sumeeapp.com`
   - Password: `TestCliente123!`
   - Deberías poder iniciar sesión sin el error de confirmación

2. **O consulta el usuario de nuevo:**
   - El campo `confirmed_at` debería tener una fecha (no `null`)
   - El campo `updated_at` debería haberse actualizado

---

## 🎯 Recomendación

**Para la confirmación más rápida:** Usa la **Opción 2 (Consola del Navegador)** - Solo copia y pega el código JavaScript.

**Para automatización:** Usa la **Opción 1 (Script Node.js)** - Puede integrarse en scripts de testing.

---

**Nota:** No puedes modificar directamente el JSON y enviarlo de vuelta. Debes usar la API de administración de Supabase para actualizar el campo `confirmed_at`.

---

**Última actualización:** 2025-11-17

