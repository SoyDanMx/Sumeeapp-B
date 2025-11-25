# 🔧 Solución: Error "Invalid Refresh Token: Refresh Token Not Found"

**Fecha:** 2025-11-23  
**Problema:** Error de autenticación de Supabase al intentar refrescar tokens

---

## 🔍 **Causa del Error**

El error `AuthApiError: Invalid Refresh Token: Refresh Token Not Found` ocurre cuando:

1. **Token de refresh expirado o inválido** almacenado en `localStorage`
2. **Tokens residuales** de sesiones anteriores
3. **Sesión corrupta** después de cambios en la configuración de Supabase
4. **Mantenimiento de Supabase** que invalida tokens existentes

---

## ✅ **Solución Implementada**

### **1. Limpieza Automática de Tokens Inválidos**

El código en `src/lib/supabase/client.ts` ahora:

- ✅ Intercepta errores de refresh token automáticamente
- ✅ Limpia tokens inválidos de `localStorage`
- ✅ Cierra sesión silenciosamente cuando detecta tokens inválidos
- ✅ Previene que el error se muestre en la consola

### **2. Manejo Mejorado de Eventos de Autenticación**

- ✅ Detecta cuando `TOKEN_REFRESHED` falla
- ✅ Verifica que la sesión tenga `refresh_token` válido
- ✅ Limpia automáticamente si falta el `refresh_token`

---

## 🛠️ **Solución Manual (Si el Error Persiste)**

### **Opción 1: Limpiar localStorage Manualmente**

1. Abre DevTools (F12)
2. Ve a **Console**
3. Ejecuta:
```javascript
// Limpiar todos los tokens de Supabase
Object.keys(localStorage).filter(key => 
  key.includes("supabase") || 
  key.includes("sb-") || 
  key.includes("auth-token")
).forEach(key => localStorage.removeItem(key));

// Recargar la página
window.location.reload();
```

### **Opción 2: Cerrar Sesión y Volver a Iniciar**

1. Haz clic en "Cerrar Sesión" en la aplicación
2. Inicia sesión nuevamente
3. Esto regenerará tokens frescos

### **Opción 3: Limpiar Todo el localStorage**

1. Abre DevTools (F12)
2. Ve a **Application** → **Local Storage**
3. Haz clic derecho en `http://localhost:3000`
4. Selecciona **Clear**
5. Recarga la página

---

## 🔄 **Prevención Automática**

El código ahora previene este error automáticamente:

1. **Al iniciar la aplicación:**
   - Verifica si hay sesión válida
   - Limpia tokens residuales si no hay sesión

2. **Al detectar error de refresh token:**
   - Limpia tokens automáticamente
   - Cierra sesión silenciosamente
   - No muestra el error en consola

3. **Al refrescar tokens:**
   - Verifica que el `refresh_token` exista
   - Limpia si falta

---

## 📋 **Verificación**

Después de aplicar la solución:

1. **Recarga la página** (Ctrl+R o Cmd+R)
2. **Verifica en consola:**
   - NO debe aparecer el error `Invalid Refresh Token`
   - Si aparece, se limpiará automáticamente
3. **Inicia sesión nuevamente** si es necesario

---

## ⚠️ **Nota Importante**

Este error es **normal** y **esperado** cuando:
- Los tokens expiran (después de ~1 hora de inactividad)
- Hay mantenimiento en Supabase
- Se cambia la configuración de autenticación

La solución implementada **maneja esto automáticamente** sin interrumpir la experiencia del usuario.

---

## 🧪 **Testing**

Para verificar que la solución funciona:

1. **Simula token inválido:**
   ```javascript
   // En DevTools Console:
   localStorage.setItem('sb-auth-token', 'invalid-token');
   // Recarga la página
   // El error debe limpiarse automáticamente
   ```

2. **Verifica limpieza automática:**
   - Abre DevTools → Console
   - Busca mensajes: `🔄 Limpiando tokens inválidos automáticamente...`
   - Busca mensajes: `✅ Tokens limpiados. Por favor, inicia sesión nuevamente.`

---

**Estado:** ✅ Solución implementada y activa

**Próximo Paso:** Recarga la página y verifica que el error se limpia automáticamente

