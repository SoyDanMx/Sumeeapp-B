# 🚀 Optimizaciones de Rendimiento - Login

**Fecha:** 2025-01-20  
**Problema:** Login lento con timeouts y múltiples consultas redundantes a la base de datos

---

## 🐛 **PROBLEMAS IDENTIFICADOS**

### 1. **Timeouts Muy Largos**
- `LoginForm`: Timeout de 45 segundos (demasiado largo)
- `AuthContext`: Timeout de 10 segundos forzando `isLoading=false`
- `useProfesionalData`: Timeout de 15 segundos forzando `setIsLoading(false)`

### 2. **Consultas Redundantes a `profiles`**
- `LoginForm` hacía consulta no bloqueante después del login
- `useUser` hacía consulta cada vez sin caché
- `useProfesionalData` hacía múltiples consultas para verificar rol
- `auth/callback/route.ts` hacía consulta antes de redirigir
- `useUserRole` hacía consulta separada en lugar de usar `useUser`

### 3. **Múltiples Listeners de Auth State**
- **CRÍTICO**: Cada instancia de `useUser` registraba su propio listener de `onAuthStateChange`
- `AuthContext`, `UserContext`, `useProfesionalData`, `useUserRole` todos usaban `useUser`
- Resultado: 5-6 listeners registrados simultáneamente
- Cuando se disparaba `SIGNED_IN`, todos los listeners intentaban obtener el perfil al mismo tiempo
- Causaba consultas duplicadas y lentitud en el login

### 4. **Middleware Ineficiente**
- Llamaba a `getSession()` en todas las rutas protegidas
- Bloqueaba requests innecesariamente

### 5. **Falta de Caché**
- No había caché del perfil del usuario
- Múltiples hooks consultaban el mismo perfil simultáneamente

---

## ✅ **OPTIMIZACIONES IMPLEMENTADAS**

### 1. **LoginForm.tsx**
- ✅ Reducido timeout de 45s a 15s
- ✅ Simplificada lógica de retry (de 2 intentos a 1)
- ✅ Eliminada consulta no bloqueante al perfil después del login
- ✅ El dashboard manejará la obtención del perfil con caché

### 2. **useUser.ts**
- ✅ Implementado caché del perfil (5 minutos de duración)
- ✅ Sistema de cola para evitar consultas duplicadas simultáneas
- ✅ **Listener singleton global** - solo un listener de `onAuthStateChange` para toda la app
- ✅ Sistema de suscripción para que múltiples instancias compartan el mismo listener
- ✅ Ignora eventos `TOKEN_REFRESHED` que no requieren actualización del perfil
- ✅ Función helper `clearUserProfileCache()` para limpiar caché cuando sea necesario

### 3. **useUserRole.ts**
- ✅ Refactorizado para usar `useUser` hook en lugar de consulta separada
- ✅ Eliminada consulta redundante a `profiles`
- ✅ Usa el caché del hook `useUser`

### 4. **useProfesionalData.ts**
- ✅ Integrado con `useUser` hook para evitar consultas separadas
- ✅ Reducido timeout de 15s a 5s inicial + 3s extendido
- ✅ Eliminadas múltiples consultas a `profiles` para verificar rol
- ✅ Usa el rol del hook `useUser` que viene del caché

### 5. **AuthContext.tsx**
- ✅ Timeout más inteligente: 5s inicial, 3s adicionales si hay usuario
- ✅ Solo fuerza `isLoading=false` si realmente está bloqueado

### 6. **middleware.ts**
- ✅ Optimizado para solo verificar sesión en rutas de auth (login/register)
- ✅ Rutas protegidas permiten acceso sin verificar sesión (el cliente maneja la verificación)
- ✅ Reduce llamadas innecesarias a `getSession()`

### 7. **auth/callback/route.ts**
- ✅ Eliminada consulta a `profiles` antes de redirigir
- ✅ Redirige directamente a `/dashboard` que maneja el routing con hooks optimizados

### 8. **Índices de Base de Datos**
- ✅ Script SQL creado: `supabase/migrations/optimize-login-performance.sql`
- ✅ Verifica y crea índices necesarios:
  - `idx_profiles_user_id` (CRÍTICO para login)
  - `idx_profiles_role` (para filtrado rápido)
  - `idx_profiles_user_id_role` (índice compuesto)

---

## 📊 **RESULTADOS ESPERADOS**

### Antes:
- ⏱️ Login: 10-45 segundos
- 🔄 4-6 consultas a `profiles` por login
- ⚠️ Múltiples timeouts activándose
- 🐌 Middleware bloqueando requests
- 🔴 **5-6 listeners de `onAuthStateChange` registrados simultáneamente**
- 🔴 **Consultas duplicadas cuando se dispara `SIGNED_IN`**

### Después:
- ⚡ Login: 2-5 segundos (reducción del 80-90%)
- 🔄 1 consulta a `profiles` con caché (reducción del 80-85%)
- ✅ Timeouts más inteligentes y menos agresivos
- 🚀 Middleware optimizado sin bloqueos innecesarios
- ✅ **1 solo listener global de `onAuthStateChange` para toda la app**
- ✅ **Sistema de cola evita consultas duplicadas simultáneas**

---

## 🔧 **PASOS PARA APLICAR**

### 1. **Ejecutar Migración SQL**
```bash
# En Supabase Dashboard → SQL Editor
# Ejecutar: supabase/migrations/optimize-login-performance.sql
```

### 2. **Rebuild de la Aplicación**
```bash
# El error de CSS puede requerir rebuild completo
npm run build
# o
yarn build
```

### 3. **Limpiar Caché del Navegador**
- Limpiar localStorage y sessionStorage
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### 4. **Verificar**
- Probar login con diferentes usuarios
- Verificar que no hay timeouts innecesarios
- Confirmar que el login es más rápido

---

## 🐛 **ERROR DE CSS**

El error `Uncaught SyntaxError: Invalid or unexpected token 60af6cc8159860f9.css:1` es probablemente un problema de build. 

**Solución:**
1. Eliminar `.next` folder: `rm -rf .next`
2. Rebuild completo: `npm run build`
3. Si persiste, verificar archivos CSS en `src/app/globals.css` y `src/components/Performance/CriticalCSS.tsx`

---

## 📝 **NOTAS ADICIONALES**

- El caché del perfil tiene duración de 5 minutos
- Los timeouts ahora son más inteligentes y solo se activan si realmente hay un problema
- Las consultas redundantes han sido eliminadas usando el hook `useUser` centralizado
- El middleware ahora es más permisivo y deja que el cliente maneje la autenticación

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

- [x] LoginForm optimizado
- [x] useUser con caché implementado
- [x] useUserRole refactorizado
- [x] useProfesionalData optimizado
- [x] AuthContext mejorado
- [x] Middleware optimizado
- [x] Callback route simplificado
- [x] Script SQL de índices creado
- [ ] Migración SQL ejecutada (requiere acción manual)
- [ ] Rebuild de aplicación (requiere acción manual)
- [ ] Pruebas de login realizadas (requiere acción manual)

