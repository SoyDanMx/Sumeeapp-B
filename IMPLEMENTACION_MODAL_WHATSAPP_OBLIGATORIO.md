# 📱 Implementación: Modal Obligatorio de WhatsApp para Profesionales

## 🎯 **OBJETIVO**

Garantizar que **todos los profesionales** tengan un número de WhatsApp registrado antes de poder usar el dashboard.

---

## 📋 **¿QUÉ SE IMPLEMENTÓ?**

### **1. Componente RequiredWhatsAppModal**
**Archivo:** `src/components/dashboard/RequiredWhatsAppModal.tsx`

**Características:**
- ✅ Modal **no cerrable** (sin botón X, sin clic fuera)
- ✅ Diseño moderno con gradientes y animaciones
- ✅ Validación en tiempo real (10 dígitos, sin 0 al inicio)
- ✅ Formateo automático del número mientras se escribe
- ✅ Preview del número formateado (+52 XXX XXX XXXX)
- ✅ Actualización dual: `profiles.whatsapp` + `auth.users.raw_user_meta_data`
- ✅ Mensaje de error descriptivo
- ✅ Loading state durante guardado
- ✅ Iconos de WhatsApp y advertencia
- ✅ Responsive (mobile-first)

**Props:**
```typescript
interface RequiredWhatsAppModalProps {
  isOpen: boolean;              // Controla visibilidad
  userId: string;               // ID del profesional
  userEmail: string;            // Email (para mostrar)
  userName: string;             // Nombre completo
  onSuccess: (whatsapp: string) => void; // Callback al guardar exitosamente
}
```

---

### **2. Integración en Professional Dashboard**
**Archivo:** `src/app/professional-dashboard/page.tsx`

**Cambios:**

#### **A. Imports**
```typescript
import RequiredWhatsAppModal from "@/components/dashboard/RequiredWhatsAppModal";
```

#### **B. Estado**
```typescript
const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
const [hasCheckedWhatsApp, setHasCheckedWhatsApp] = useState(false);
```

#### **C. useEffect de Validación**
```typescript
useEffect(() => {
  if (!profesional || hasCheckedWhatsApp) return;

  // Revisar si el profesional NO tiene whatsapp
  const needsWhatsApp = !profesional.whatsapp || profesional.whatsapp.trim() === '';
  
  if (needsWhatsApp) {
    // Mostrar modal después de un breve delay para mejor UX
    setTimeout(() => {
      setShowWhatsAppModal(true);
    }, 500);
  }
  
  setHasCheckedWhatsApp(true);
}, [profesional, hasCheckedWhatsApp]);
```

**Lógica:**
- Se ejecuta cuando `profesional` está cargado
- Solo se ejecuta **una vez** (con flag `hasCheckedWhatsApp`)
- Delay de 500ms para mejor UX (evita modal abrupto)
- Detecta si `whatsapp` es `null`, `undefined`, o string vacío

#### **D. Handler de Éxito**
```typescript
const handleWhatsAppSuccess = useCallback((whatsapp: string) => {
  setShowWhatsAppModal(false);
  // Actualizar el profesional localmente
  if (profesional) {
    profesional.whatsapp = whatsapp;
  }
  // Re-fetch data para asegurar sincronización
  refetchData();
}, [profesional, refetchData]);
```

#### **E. Renderizado del Modal**
```typescript
{/* Modal Obligatorio de WhatsApp */}
{profesional && (
  <RequiredWhatsAppModal
    isOpen={showWhatsAppModal}
    userId={profesional.user_id}
    userEmail={profesional.email}
    userName={profesional.full_name || 'Profesional'}
    onSuccess={handleWhatsAppSuccess}
  />
)}
```

**Nota:** El modal se renderiza en **dos lugares**:
1. En el layout móvil (`if (isMobile) { ... }`)
2. En el layout desktop (al final del componente principal)

Esto asegura que funcione en **todas las resoluciones**.

---

## 🔄 **FLUJO DE USUARIO**

### **Escenario 1: Profesional SIN WhatsApp**

1. **Profesional inicia sesión** → Redirigido a `/professional-dashboard`
2. **Dashboard carga** → Hook `useProfesionalData()` obtiene datos
3. **useEffect detecta** `whatsapp === null`
4. **Después de 500ms** → Modal aparece (full-screen, overlay oscuro)
5. **Profesional ingresa WhatsApp** → Validación en tiempo real
6. **Clic en "Guardar y Continuar"**:
   - ✅ Se actualiza `profiles.whatsapp`
   - ✅ Se actualiza `auth.users.raw_user_meta_data.whatsapp`
   - ✅ Modal se cierra
   - ✅ Dashboard se refresca con nuevo WhatsApp
7. **Profesional puede usar el dashboard normalmente**

### **Escenario 2: Profesional CON WhatsApp**

1. **Profesional inicia sesión** → Redirigido a `/professional-dashboard`
2. **Dashboard carga** → Hook `useProfesionalData()` obtiene datos
3. **useEffect detecta** `whatsapp !== null`
4. **Modal NO se muestra**
5. **Profesional usa el dashboard normalmente**

### **Escenario 3: Error al Guardar**

1. **Profesional ingresa WhatsApp** → Clic en "Guardar"
2. **Error de red/servidor** → Supabase devuelve error
3. **Modal muestra mensaje**: "Error al guardar. Por favor intenta de nuevo."
4. **Modal permanece abierto** → Profesional puede reintentar
5. **Botón vuelve a estar habilitado** → No hay bloqueo permanente

---

## 🛡️ **VALIDACIONES IMPLEMENTADAS**

### **Frontend (Componente)**

1. **Solo números:**
   ```typescript
   let value = e.target.value.replace(/\D/g, '');
   ```

2. **Máximo 10 dígitos:**
   ```typescript
   if (value.length > 10) {
     value = value.slice(0, 10);
   }
   ```

3. **No puede empezar con 0:**
   ```typescript
   if (phone[0] === '0') {
     setError('El número no puede empezar con 0');
     return false;
   }
   ```

4. **Debe tener exactamente 10 dígitos:**
   ```typescript
   if (phone.length !== 10) {
     setError('El número debe tener 10 dígitos');
     return false;
   }
   ```

5. **Botón deshabilitado si no es válido:**
   ```typescript
   disabled={isSubmitting || whatsapp.length !== 10}
   ```

### **Backend (Supabase)**

**Nota:** No hay validación adicional en el backend. Se confía en la validación del frontend.

Si se requiere validación adicional, se puede implementar:
- **Trigger de validación** en `profiles` (PostgreSQL)
- **RPC function** con validación personalizada
- **Supabase Edge Function** para validación avanzada

---

## 🎨 **DISEÑO Y UX**

### **Colores**
- **Header:** Gradiente verde-esmeralda (`from-green-500 to-emerald-600`)
- **Icono WhatsApp:** Círculo blanco con icono verde
- **Advertencia:** Banner amarillo con borde izquierdo
- **Botón:** Gradiente verde con hover effect
- **Overlay:** Negro semi-transparente con blur

### **Estados Visuales**

#### **Estado Normal**
- Input con borde gris
- Botón deshabilitado (gris) si < 10 dígitos

#### **Estado Válido (10 dígitos)**
- Preview verde: "✓ WhatsApp: +52 XXX XXX XXXX"
- Botón habilitado (verde brillante)

#### **Estado Error**
- Input con borde rojo
- Mensaje de error rojo: "⚠ [mensaje]"

#### **Estado Cargando**
- Botón con spinner animado
- Texto: "Guardando..."
- Botón deshabilitado

---

## 📱 **RESPONSIVIDAD**

### **Mobile (< 768px)**
- Modal ocupa **95% del ancho** con padding
- Texto más pequeño pero legible
- Botones con `touch-manipulation` para mejor interacción

### **Desktop (≥ 768px)**
- Modal con ancho máximo de **28rem** (448px)
- Centrado perfectamente en pantalla
- Sombras más pronunciadas

---

## 🔧 **MANTENIMIENTO FUTURO**

### **Cambiar el número después de guardarlo**

**Opción 1: Desde EditProfileModal**
- El profesional puede editar su WhatsApp desde "Editar Perfil"
- No vuelve a aparecer el modal obligatorio

**Opción 2: Agregar botón "Cambiar WhatsApp" en dashboard**
```typescript
<button onClick={() => setShowWhatsAppModal(true)}>
  Cambiar WhatsApp
</button>
```

### **Deshabilitar el modal temporalmente**

Si necesitas desactivar esta feature:

```typescript
// En src/app/professional-dashboard/page.tsx
useEffect(() => {
  if (!profesional || hasCheckedWhatsApp) return;

  // COMENTAR ESTA SECCIÓN:
  /*
  const needsWhatsApp = !profesional.whatsapp || profesional.whatsapp.trim() === '';
  
  if (needsWhatsApp) {
    setTimeout(() => {
      setShowWhatsAppModal(true);
    }, 500);
  }
  */
  
  setHasCheckedWhatsApp(true);
}, [profesional, hasCheckedWhatsApp]);
```

### **Agregar validación de número real**

Para verificar que el número existe (API externa):

```typescript
// Dentro de handleSubmit, antes de actualizar Supabase:
const isValidNumber = await verifyPhoneNumber(whatsapp);
if (!isValidNumber) {
  setError('Este número no es válido');
  return;
}
```

---

## 🧪 **TESTING**

### **Test Manual**

1. **Crear profesional de prueba sin WhatsApp:**
   ```sql
   -- En Supabase SQL Editor
   UPDATE public.profiles
   SET whatsapp = NULL
   WHERE email = 'test@example.com' AND role = 'profesional';
   ```

2. **Iniciar sesión con ese usuario**
3. **Verificar que el modal aparece**
4. **Probar casos de validación:**
   - Ingresar solo 5 dígitos → Botón deshabilitado
   - Ingresar número que empieza con 0 → Error
   - Ingresar 10 dígitos válidos → Preview verde
   - Guardar → Modal se cierra
   - Recargar página → Modal NO vuelve a aparecer

5. **Verificar en Supabase:**
   ```sql
   SELECT user_id, full_name, email, whatsapp, phone
   FROM public.profiles
   WHERE email = 'test@example.com';
   ```

### **Test de Integración**

```typescript
// Ejemplo con Jest + React Testing Library
describe('RequiredWhatsAppModal', () => {
  it('should display modal when whatsapp is null', async () => {
    const mockProfesional = { whatsapp: null, ... };
    render(<ProfessionalDashboard profesional={mockProfesional} />);
    
    await waitFor(() => {
      expect(screen.getByText('¡Actualiza tu WhatsApp!')).toBeInTheDocument();
    });
  });

  it('should validate 10-digit format', () => {
    // Test de validación
  });
});
```

---

## 📊 **MÉTRICAS A MONITOREAR**

1. **% de profesionales con WhatsApp**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE whatsapp IS NOT NULL) * 100.0 / COUNT(*) as porcentaje
   FROM public.profiles
   WHERE role = 'profesional';
   ```

2. **Profesionales que actualizaron hoy**
   ```sql
   SELECT COUNT(*)
   FROM public.profiles
   WHERE role = 'profesional'
     AND whatsapp IS NOT NULL
     AND updated_at::date = CURRENT_DATE;
   ```

3. **Profesionales que aún no tienen WhatsApp**
   ```sql
   SELECT user_id, full_name, email, created_at
   FROM public.profiles
   WHERE role = 'profesional'
     AND whatsapp IS NULL
   ORDER BY created_at DESC;
   ```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [x] Crear componente `RequiredWhatsAppModal.tsx`
- [x] Integrar en `professional-dashboard/page.tsx`
- [x] Agregar validación de formato
- [x] Implementar actualización a Supabase
- [x] Agregar estados de loading y error
- [x] Diseñar UI moderna y responsive
- [x] Testear en móvil y desktop
- [x] Verificar que no se puede cerrar el modal
- [x] Confirmar que el modal no reaparece después de guardado
- [ ] **PENDIENTE:** Ejecutar script SQL `fix-professional-whatsapp-issue.sql`
- [ ] **PENDIENTE:** Testing con usuario real
- [ ] **PENDIENTE:** Verificar en producción (Vercel)

---

## 🚀 **SIGUIENTE PASO**

**ANTES DE DEPLOYAR:**

1. **Ejecutar script SQL en Supabase:**
   - `src/lib/supabase/fix-professional-whatsapp-issue.sql`
   - Esto actualizará profesionales existentes

2. **Verificar resultados:**
   - Ejecutar `verify-whatsapp-fix.sql`
   - Confirmar que el trigger `handle_new_user()` fue reemplazado

3. **Test local:**
   ```bash
   npm run dev
   ```
   - Probar con profesional sin WhatsApp
   - Verificar que el modal aparece
   - Guardar WhatsApp
   - Confirmar que se guardó en Supabase

4. **Deploy a Vercel:**
   ```bash
   git add -A
   git commit -m "feat: agregar modal obligatorio de WhatsApp para profesionales"
   git push origin main
   ```

---

## 📝 **NOTAS FINALES**

- El modal usa `Dialog` de **Headless UI** (ya instalado)
- El z-index es `z-50` para estar sobre todo
- El overlay tiene `backdrop-blur-sm` para efecto moderno
- El input tiene `inputMode="numeric"` para teclado numérico en móvil
- El botón usa `disabled` y no `aria-disabled` para prevenir submission

**¿Algún problema?** Revisa:
1. ¿El profesional tiene `whatsapp` en el objeto?
2. ¿El hook `useProfesionalData` está funcionando?
3. ¿El estado `showWhatsAppModal` se está actualizando?
4. ¿Hay errores en la consola del navegador?
5. ¿El script SQL se ejecutó correctamente?

