# ⚡ Confirmar Email del Usuario de Prueba - Ahora

## Estado Actual

- **Email:** cliente@sumeeapp.com
- **User ID:** 90ce751d-8e90-47a3-abc1-36c1e033d48d
- **Estado:** ❌ Email NO confirmado (`email_confirmed_at: null`)

---

## 🚀 Opción Más Rápida: Página Web

**Visita esta URL en tu navegador:**

```
https://sumeeapp.com/confirm-test-user
```

O en desarrollo:
```
http://localhost:3000/confirm-test-user
```

1. Haz clic en el botón **"Confirmar Email"**
2. ✅ Listo! El email estará confirmado

---

## 🔧 Opción 2: Script Node.js

**Ejecuta desde la raíz del proyecto:**

```bash
node scripts/confirm-test-user-email.js
```

**Requisitos:**
- Tener `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
- O establecer las variables de entorno directamente

**Salida esperada:**
```
🔍 Buscando usuario: cliente@sumeeapp.com
✅ Usuario encontrado:
   ID: 90ce751d-8e90-47a3-abc1-36c1e033d48d
   Email: cliente@sumeeapp.com
   Email confirmado: ❌ No

📧 Confirmando email...
✅ Email confirmado exitosamente!
   Email confirmado en: 2025-11-17T...
🎉 El usuario ahora puede iniciar sesión.
```

---

## 🌐 Opción 3: Dashboard de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **Authentication** > **Users**
4. Busca: `cliente@sumeeapp.com`
5. Haz clic en el usuario
6. Haz clic en **"Confirm email"** o activa **"Email confirmed"**

---

## 📡 Opción 4: API Directa (cURL)

```bash
curl -X POST https://sumeeapp.com/api/admin/confirm-user-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@sumeeapp.com",
    "userId": "90ce751d-8e90-47a3-abc1-36c1e033d48d"
  }'
```

**O desde el navegador (JavaScript Console):**

```javascript
fetch('/api/admin/confirm-user-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'cliente@sumeeapp.com',
    userId: '90ce751d-8e90-47a3-abc1-36c1e033d48d'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## ✅ Verificación

Después de confirmar, verifica que funcionó:

1. **Desde Supabase Dashboard:**
   - Authentication > Users > cliente@sumeeapp.com
   - Verifica que "Email confirmed" esté en `true`

2. **Intentando Login:**
   - Ve a `/login`
   - Email: `cliente@sumeeapp.com`
   - Password: `TestCliente123!`
   - Deberías poder iniciar sesión sin el error de confirmación

---

## 🎯 Recomendación

**Para la confirmación más rápida:** Usa la **Opción 1 (Página Web)** - Solo visita `/confirm-test-user` y haz clic en el botón.

**Para automatización:** Usa la **Opción 2 (Script Node.js)** - Puede integrarse en scripts de testing.

---

**Última actualización:** 2025-11-17

