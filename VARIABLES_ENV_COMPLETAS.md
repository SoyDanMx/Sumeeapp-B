# 📋 Variables de Entorno Completas para Sumeeapp-B

## ✅ Variables Actualmente Configuradas en `.env.local`

```bash
# SUPABASE (REQUERIDO - Crítico para build)
NEXT_PUBLIC_SUPABASE_URL=https://jkdvrwmanmwoyyoixmnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHZyd21hbm13b3l5b2l4bW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTI5ODQsImV4cCI6MjA2ODEyODk4NH0.K8t3xSN2Dgx47wFW4jppGhLeNeTIWVTbMkBbih35Xqk

# GOOGLE GENERATIVE AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=AlzaSyCXfh6sKVc46DWOAetdCZW9_4Sa-LKY0k8
```

---

## ⚠️ Variables Adicionales Detectadas en el Código

Basado en el análisis del código, estas variables **pueden ser necesarias** dependiendo de las funcionalidades que uses:

### 🔴 **Críticas (Probablemente Necesarias)**

```bash
# Supabase Service Role (para operaciones admin en servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URL (para generar URLs absolutas)
NEXT_PUBLIC_SITE_URL=https://www.sumeeapp.com
```

### 🟡 **Opcionales pero Recomendadas**

```bash
# Google Maps (si usas mapas en RequestServiceModal)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Stripe (si usas pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (si usas notificaciones por email)
RESEND_API_KEY=re_...

# Syscom (si usas integración con Syscom para catálogo)
SYSCOM_CLIENT_ID=tu_client_id
SYSCOM_CLIENT_SECRET=tu_client_secret
```

---

## 📝 Template Completo de `.env.local`

```bash
# ============================================
# SUPABASE (REQUERIDO - Crítico para build)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://jkdvrwmanmwoyyoixmnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHZyd21hbm13b3l5b2l4bW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTI5ODQsImV4cCI6MjA2ODEyODk4NH0.K8t3xSN2Dgx47wFW4jppGhLeNeTIWVTbMkBbih35Xqk
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# ============================================
# GOOGLE GENERATIVE AI (Gemini)
# ============================================
GOOGLE_GENERATIVE_AI_API_KEY=AlzaSyCXfh6sKVc46DWOAetdCZW9_4Sa-LKY0k8

# ============================================
# GOOGLE MAPS (Opcional)
# ============================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key_aqui

# ============================================
# SITE URL (Opcional - se auto-detecta en Vercel)
# ============================================
NEXT_PUBLIC_SITE_URL=https://www.sumeeapp.com

# ============================================
# STRIPE (Si usas pagos)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# RESEND (Si usas notificaciones por email)
# ============================================
RESEND_API_KEY=re_...

# ============================================
# SYSCOM (Si usas integración con Syscom)
# ============================================
SYSCOM_CLIENT_ID=tu_client_id
SYSCOM_CLIENT_SECRET=tu_client_secret
```

---

## 🔍 Cómo Verificar Qué Variables Necesitas

### 1. **Variables Críticas para Build**

Estas son **obligatorias** para que el build funcione:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Ya configurada
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Ya configurada

### 2. **Variables para Funcionalidades Específicas**

Ejecuta este comando para ver qué variables usa tu código:

```bash
cd "/Users/danielnuno/Documents/Sumee-Universe/Sumeeapp-B"
grep -r "process.env\." src --include="*.ts" --include="*.tsx" | \
  grep -E "NEXT_PUBLIC_|SUPABASE|GOOGLE|STRIPE|RESEND|SYSCOM" | \
  sed 's/.*process\.env\.\([A-Z_]*\).*/\1/' | \
  sort -u
```

### 3. **Verificar Errores en Runtime**

Si alguna funcionalidad no funciona, revisa los logs del servidor. Si ves errores como:
- `SUPABASE_SERVICE_ROLE_KEY no está definido`
- `GOOGLE_MAPS_API_KEY no configurada`
- `STRIPE_SECRET_KEY missing`

Entonces necesitas agregar esas variables.

---

## 📍 Dónde Obtener las Variables

### **SUPABASE_SERVICE_ROLE_KEY**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Tu proyecto → **Settings** → **API**
3. Copia la **service_role** key (⚠️ Privada, no exponer en cliente)

### **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Crea o copia tu API Key de Google Maps

### **STRIPE Keys**
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers** → **API keys**
3. Copia **Publishable key** y **Secret key**

### **RESEND_API_KEY**
1. Ve a [Resend Dashboard](https://resend.com)
2. **API Keys** → Crea nueva key
3. Copia la key (empieza con `re_`)

### **SYSCOM Keys**
1. Contacta con Syscom para obtener credenciales
2. O revisa tu cuenta de Syscom

---

## ✅ Checklist de Configuración

### **Mínimo para Build (Ya completado)**
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `GOOGLE_GENERATIVE_AI_API_KEY`

### **Recomendadas para Producción**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (para operaciones admin)
- [ ] `NEXT_PUBLIC_SITE_URL` (para URLs absolutas)

### **Opcionales (Solo si usas esas funcionalidades)**
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (si usas mapas)
- [ ] `STRIPE_*` (si usas pagos)
- [ ] `RESEND_API_KEY` (si usas emails)
- [ ] `SYSCOM_*` (si usas catálogo Syscom)

---

## 🚨 Importante

- **`.env.local` NO se sube al repositorio** (está en `.gitignore`) ✅
- **Las variables en Vercel se configuran manualmente** en el dashboard
- **Las variables `NEXT_PUBLIC_*` son públicas** y seguras para el cliente
- **Las variables sin `NEXT_PUBLIC_*` son privadas** (solo servidor)

---

## 📝 Nota sobre el Archivo Anterior

Si anteriormente tenías un `.env.local` completo y se perdió al mover la carpeta al workspace, puedes:

1. **Revisar backups** de tu sistema
2. **Revisar Vercel Dashboard** → **Settings** → **Environment Variables** (ahí están las variables de producción)
3. **Revisar otros proyectos** que puedan tener las mismas variables
4. **Reconstruir gradualmente** agregando variables según las necesites

---

**Con las variables básicas ya configuradas, el build debería funcionar. Las demás variables se pueden agregar según las necesites.** 🚀
