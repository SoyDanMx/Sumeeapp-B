# 🔧 Configuración de Variables de Entorno para Verificación

## ❌ Problema Detectado

El archivo `.env.local` actualmente solo contiene:
```
GOOGLE_GENERATIVE_AI_API_KEY=AlzaSyCXfh6sKVc46DWOAetdCZW9_4Sa-LKY0k8
```

**Faltan las variables críticas de Supabase** que son necesarias para:
- ✅ Compilación del proyecto (build)
- ✅ Funcionamiento de la página de verificación
- ✅ Conexión a la base de datos
- ✅ Generación de metadata dinámica

---

## ✅ Variables Requeridas

### **CRÍTICAS (Obligatorias para el build)**

```bash
# Supabase - REQUERIDO
NEXT_PUBLIC_SUPABASE_URL=https://jkdvrwmanmwoyyoixmnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### **Opcionales pero Recomendadas**

```bash
# Supabase Service Role (para operaciones admin)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Google Maps (si usas mapas)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key

# Site URL (se auto-detecta en Vercel, pero puedes configurarlo)
NEXT_PUBLIC_SITE_URL=https://www.sumeeapp.com
```

---

## 📝 Cómo Obtener las Variables de Supabase

### 1. **NEXT_PUBLIC_SUPABASE_URL**
- Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
- Ve a **Settings** → **API**
- Copia la **Project URL** (ej: `https://jkdvrwmanmwoyyoixmnt.supabase.co`)

### 2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- En la misma página de **Settings** → **API**
- Copia la **anon/public** key
- Esta es la clave pública y segura para usar en el cliente

### 3. **SUPABASE_SERVICE_ROLE_KEY** (Opcional)
- En **Settings** → **API**
- Copia la **service_role** key
- ⚠️ **IMPORTANTE**: Esta clave es privada, nunca la expongas en el cliente

---

## 🔧 Configuración Rápida

### Paso 1: Editar `.env.local`

Abre el archivo `.env.local` y agrega las variables faltantes:

```bash
# Variables existentes
GOOGLE_GENERATIVE_AI_API_KEY=AlzaSyCXfh6sKVc46DWOAetdCZW9_4Sa-LKY0k8

# Variables de Supabase - AGREGAR ESTAS
NEXT_PUBLIC_SUPABASE_URL=https://jkdvrwmanmwoyyoixmnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Opcionales
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key
NEXT_PUBLIC_SITE_URL=https://www.sumeeapp.com
```

### Paso 2: Verificar que las Variables Estén Cargadas

```bash
# Reiniciar el servidor de desarrollo
npm run dev

# O limpiar caché y reiniciar
rm -rf .next .turbo
npm run dev
```

### Paso 3: Verificar en Vercel

Las variables de entorno también deben estar configuradas en Vercel:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Agrega las mismas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - (Otras que necesites)

---

## 🚨 Error de Build - Solución

Si el build falla con errores relacionados a Supabase, es porque:

1. ❌ Las variables no están en `.env.local` (desarrollo local)
2. ❌ Las variables no están en Vercel (producción)
3. ❌ Las variables tienen valores placeholder inválidos

### Verificación Rápida

El código valida automáticamente y lanzará un error claro si faltan:

```typescript
// src/lib/supabase/client.ts lanza este error si faltan:
❌ ERROR: Variables de entorno de Supabase no configuradas.
```

---

## ✅ Checklist de Configuración

- [ ] `NEXT_PUBLIC_SUPABASE_URL` agregada a `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` agregada a `.env.local`
- [ ] Variables agregadas en Vercel Dashboard
- [ ] Servidor de desarrollo reiniciado
- [ ] Build local funciona (`npm run build`)
- [ ] Deploy en Vercel funciona

---

## 📋 Template Completo de `.env.local`

```bash
# ============================================
# SUPABASE (REQUERIDO)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://jkdvrwmanmwoyyoixmnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# GOOGLE GENERATIVE AI (Gemini)
# ============================================
GOOGLE_GENERATIVE_AI_API_KEY=AlzaSyCXfh6sKVc46DWOAetdCZW9_4Sa-LKY0k8

# ============================================
# OPCIONALES
# ============================================
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_SITE_URL=https://www.sumeeapp.com
```

---

## 🔍 Cómo Verificar que Funciona

Después de agregar las variables:

1. **Localmente:**
   ```bash
   npm run dev
   # Debe iniciar sin errores de Supabase
   ```

2. **Build:**
   ```bash
   npm run build
   # Debe compilar exitosamente
   ```

3. **En Vercel:**
   - El build debe completarse sin errores
   - La página `/verificacion` debe cargar correctamente

---

## ⚠️ Nota Importante

- `.env.local` está en `.gitignore` (no se sube al repositorio) ✅
- Las variables en Vercel se configuran manualmente en el dashboard
- Las variables `NEXT_PUBLIC_*` son públicas y seguras para el cliente
- Las variables sin `NEXT_PUBLIC_*` son privadas (solo servidor)

---

**Una vez configuradas las variables, el build debería funcionar correctamente.** 🚀
