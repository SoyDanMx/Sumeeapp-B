# 🔧 Solución: Problemas de Login y Pago

**Fecha:** 2025-11-23  
**Problemas Reportados:**
1. ❌ No puedo loguearme
2. ❌ No se pide la tarjeta de pago

---

## 🔍 **PROBLEMA 1: No Puedo Loguearme**

### **Causa:**
El error de refresh token está bloqueando el login. Aunque el código intenta limpiar tokens automáticamente, puede que necesite una limpieza manual.

### **Solución Inmediata:**

**Opción 1: Limpiar localStorage (Recomendado)**

1. Abre DevTools (F12)
2. Ve a **Console**
3. Ejecuta este código:

```javascript
// Limpiar todos los tokens de Supabase
Object.keys(localStorage).filter(key => 
  key.includes("supabase") || 
  key.includes("sb-") || 
  key.includes("auth-token")
).forEach(key => {
  console.log("Eliminando:", key);
  localStorage.removeItem(key);
});

console.log("✅ Tokens limpiados. Recarga la página.");
window.location.reload();
```

**Opción 2: Limpiar desde Application Tab**

1. Abre DevTools (F12)
2. Ve a **Application** → **Local Storage** → `http://localhost:3000`
3. Elimina todas las claves que contengan:
   - `supabase`
   - `sb-`
   - `auth-token`
4. Recarga la página (Ctrl+R o Cmd+R)

**Opción 3: Usar Credenciales de Prueba**

Si estás usando `cliente@sumeeapp.com`, verifica que el email esté confirmado en Supabase:

1. Ve a Supabase Dashboard
2. **Authentication** → **Users**
3. Busca `cliente@sumeeapp.com`
4. Si no está confirmado, haz clic en **Confirm Email** manualmente

---

## 🔍 **PROBLEMA 2: No Se Pide la Tarjeta de Pago**

### **Causa:**
El feature flag `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT` está **desactivado por defecto** (esto es correcto y seguro). El paso de pago solo aparece cuando el feature flag está activado.

### **Solución: Activar Feature Flag**

**Para activar el paso de pago:**

1. Abre `.env.local` en la raíz del proyecto
2. Agrega esta línea:
   ```bash
   NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true
   ```
3. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl+C)
   # Reinicia:
   npm run dev
   ```
4. Recarga la página en el navegador

**Verificar que está activado:**

1. Abre DevTools (F12) → **Console**
2. Ejecuta:
   ```javascript
   console.log("Feature flag:", process.env.NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT);
   ```
3. Debe mostrar: `"true"`

---

## 📋 **Checklist de Verificación**

### **Login:**
- [ ] Limpié localStorage (Opción 1 o 2)
- [ ] Recargué la página
- [ ] Puedo iniciar sesión correctamente
- [ ] No aparecen errores de refresh token en consola

### **Pago:**
- [ ] Agregué `NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true` a `.env.local`
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Recargué la página
- [ ] Al crear un lead, aparece el **Paso 4: Método de Pago**

---

## 🧪 **Testing Completo**

### **1. Test Login (Sin Pago):**
1. Limpia localStorage (ver arriba)
2. Inicia sesión
3. Abre modal "Solicitar Servicio"
4. **Verifica:** NO debe aparecer paso de pago (4 pasos totales)

### **2. Test Login (Con Pago):**
1. Activa feature flag (ver arriba)
2. Reinicia servidor
3. Inicia sesión
4. Abre modal "Solicitar Servicio"
5. **Verifica:** Debe aparecer paso 4 de pago (5 pasos totales)
6. Usa tarjeta de prueba: `4242 4242 4242 4242`

---

## ⚠️ **Notas Importantes**

1. **Feature Flag por Defecto:**
   - Por defecto está en `false` (sin pago)
   - Esto es **correcto y seguro**
   - Solo actívalo cuando quieras probar el flujo con pago

2. **Refresh Token Error:**
   - Es normal después de cambios en Supabase
   - La limpieza automática debería manejarlo
   - Si persiste, usa la limpieza manual

3. **Reiniciar Servidor:**
   - **Siempre** reinicia el servidor después de cambiar `.env.local`
   - Los cambios en variables de entorno requieren reinicio

---

## 🐛 **Troubleshooting Adicional**

### **Si el login sigue fallando:**

1. **Verifica credenciales:**
   - Email: `cliente@sumeeapp.com`
   - Password: `TestPassword123!`

2. **Verifica en Supabase:**
   - Ve a **Authentication** → **Users**
   - Confirma que el usuario existe
   - Confirma que el email está verificado

3. **Verifica conexión:**
   - Asegúrate de que Supabase esté disponible
   - Revisa si hay mantenimiento en: https://status.supabase.com

### **Si el paso de pago no aparece:**

1. **Verifica feature flag:**
   ```bash
   # En terminal:
   grep NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT .env.local
   # Debe mostrar: NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true
   ```

2. **Verifica que reiniciaste el servidor:**
   - Los cambios en `.env.local` requieren reinicio
   - Detén el servidor (Ctrl+C)
   - Reinicia: `npm run dev`

3. **Verifica en consola:**
   ```javascript
   // En DevTools Console:
   console.log("Feature flag:", process.env.NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT);
   // Debe mostrar: "true"
   ```

---

**Estado:** ✅ Soluciones documentadas

**Siguiente Acción:** 
1. Limpia localStorage para resolver login
2. Activa feature flag para probar pago

