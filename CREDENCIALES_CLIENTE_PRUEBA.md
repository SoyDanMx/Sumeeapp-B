# 🔐 Credenciales de Prueba - Cliente SumeeApp

## ✅ Credenciales Confirmadas

### Información de Acceso

**Email:** `cliente@sumeeapp.com`  
**Contraseña Principal:** `TestCliente123!` (oficial)  
**Contraseña Alternativa:** `TestPassword123!` (solo desarrollo)

> **Nota:** La contraseña oficial es `TestCliente123!` según la página de credenciales (`/test-credentials`). Si esta no funciona, intenta con `TestPassword123!`.

### Información del Perfil

- **Nombre:** María García - Cliente
- **User ID:** `90ce751d-8e90-47a3-abc1-36c1e033d48d`
- **Rol:** Cliente
- **Plan:** Express Free
- **Estado:** Activo
- **Fecha de Creación:** 2025-11-17 18:29:55 UTC

### Estado del Perfil

⚠️ **Nota Importante:** El perfil requiere completar algunos datos para una experiencia completa:

- ✅ Email: Configurado
- ✅ Nombre: Configurado
- ⚠️ Ubicación: Pendiente (se solicitará al iniciar sesión)
- ⚠️ WhatsApp: Pendiente (se solicitará al crear un lead)
- ⚠️ Ciudad: Pendiente (se completará automáticamente con la ubicación)

## ⚠️ IMPORTANTE: Confirmación de Email

**El email del usuario de prueba necesita ser confirmado antes de poder iniciar sesión.**

### Opciones para Confirmar el Email:

#### **Opción 1: Usar el Endpoint de Confirmación (Recomendado)**

1. **En Desarrollo:**
   - Al intentar iniciar sesión, haz clic en "Reenviar confirmación"
   - El sistema confirmará automáticamente el email de prueba

2. **En Producción:**
   - Usa el endpoint: `POST /api/confirm-test-email`
   - Body: `{ "email": "cliente@sumeeapp.com" }`
   - O usa: `POST /api/admin/confirm-user-email`
   - Body: `{ "email": "cliente@sumeeapp.com" }`

#### **Opción 2: Dashboard de Supabase (Más Fácil)**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication > Users**
4. Busca: `cliente@sumeeapp.com`
5. Haz clic en el usuario
6. Haz clic en **"Confirm email"** o establece **"Email confirmed"** a `true`

#### **Opción 3: Script SQL (Solo para Verificación)**

Ejecuta el script `supabase/migrations/confirm-test-user-email.sql` para verificar el estado del usuario.

---

## 📋 Instrucciones de Uso

### 1. Acceso al Dashboard

1. **Primero, confirma el email** usando una de las opciones arriba
2. Visita: `https://sumeeapp.com/login` (o `http://localhost:3000/login` en desarrollo)
3. Ingresa las credenciales:
   - Email: `cliente@sumeeapp.com`
   - Contraseña: `TestCliente123!`
4. Serás redirigido automáticamente al Dashboard del Cliente

### 2. Flujo de Onboarding

Al iniciar sesión por primera vez, el sistema te pedirá:

1. **Ubicación (Fase 1 - Bloqueante):**
   - Se abrirá un modal que solicita tu ubicación
   - Puedes usar GPS o ingresar una dirección manualmente
   - Este paso es obligatorio para continuar

2. **WhatsApp/Contacto (Fase 2 - Al crear un lead):**
   - Al intentar crear un lead, se solicitará tu número de WhatsApp
   - Este campo es obligatorio para enviar solicitudes

### 3. Funcionalidades Disponibles

#### Como Cliente (Plan Express Free):

- ✅ Crear solicitudes de servicio (3 solicitudes/mes)
- ✅ Usar el Asistente de IA (chat de texto)
- ✅ Ver leads y su estado
- ✅ Actualizar perfil
- ❌ Subir fotos para diagnóstico con IA (solo Plan PRO)
- ❌ Prioridad en asignación (solo Plan PRO)

#### Plan PRO (Ilimitado):

- ✅ Solicitudes ilimitadas
- ✅ Diagnóstico con IA Vision (subir fotos)
- ✅ Prioridad en asignación
- ✅ Asistencia VIP 24/7

### 4. URLs Importantes

- **Login:** `/login`
- **Dashboard Cliente:** `/dashboard/client`
- **Servicios:** `/servicios`
- **Membresía PRO:** `/membresia`
- **Página de Credenciales de Prueba:** `/test-credentials`

## 🔒 Seguridad

- ⚠️ Estas credenciales son **SOLO PARA PRUEBAS**
- ⚠️ No usar en producción
- ⚠️ No compartir públicamente
- ✅ El usuario está activo y listo para testing

## 🧪 Testing Recomendado

### Casos de Prueba Sugeridos:

1. **Login y Onboarding:**
   - [ ] Iniciar sesión con las credenciales
   - [ ] Completar ubicación (modal bloqueante)
   - [ ] Verificar redirección al dashboard

2. **Creación de Lead:**
   - [ ] Crear un lead usando el botón "Agendar Proyecto Pro"
   - [ ] Completar WhatsApp cuando se solicite
   - [ ] Verificar que el lead se crea correctamente

3. **Asistente de IA:**
   - [ ] Abrir el Asistente Sumee
   - [ ] Probar chat de texto (disponible para todos)
   - [ ] Intentar subir foto (debe mostrar mensaje de upsell PRO)

4. **Actualización de Perfil:**
   - [ ] Acceder a "Mi Panel" > "Actualizar Mi Perfil"
   - [ ] Actualizar ubicación usando GPS
   - [ ] Verificar que los cambios se guardan

5. **Límites de Plan:**
   - [ ] Crear 3 leads (límite del plan Express Free)
   - [ ] Verificar mensaje de límite alcanzado
   - [ ] Verificar CTA para upgrade a PRO

## 📞 Soporte

Si encuentras algún problema con estas credenciales:

1. Verifica que el usuario existe en Supabase Auth
2. Verifica que el perfil existe en la tabla `profiles`
3. Revisa los logs de la consola del navegador
4. Contacta al equipo de desarrollo

## 📝 Notas Adicionales

- El usuario fue creado el **17 de noviembre de 2025**
- El perfil tiene `role: "client"` confirmado
- El plan actual es `express_free` con 3 solicitudes/mes
- El perfil está activo y listo para usar

---

**Última actualización:** 2025-11-17  
**Estado:** ✅ Confirmado y Listo para Testing
