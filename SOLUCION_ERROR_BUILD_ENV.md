# 🔧 Solución: Error de Build por Variables de Entorno Faltantes

## ❌ Problema Identificado

El error de compilación en Vercel es causado por **variables de entorno faltantes** en `.env.local`.

### Estado Actual
- ✅ `GOOGLE_GENERATIVE_AI_API_KEY` - Presente
- ❌ `NEXT_PUBLIC_SUPABASE_URL` - **FALTA**
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - **FALTA**

### Por qué Falla el Build

El código en `src/lib/supabase/client.ts` valida estas variables y **lanza un error** si no están:

```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ ERROR: Variables de entorno de Supabase no configuradas.');
}
```

Este error ocurre durante el build porque Next.js intenta inicializar el cliente de Supabase.

---

## ✅ Solución Inmediata

### 1. Agregar Variables a `.env.local`

Edita el archivo `.env.local` y agrega:

```bash
# Variables existentes
GOOGLE_GENERATIVE_AI_API_KEY=AlzaSyCXfh6sKVc46DWOAetdCZW9_4Sa-LKY0k8

# Variables de Supabase - AGREGAR ESTAS
NEXT_PUBLIC_SUPABASE_URL=https://jkdvrwmanmwoyyoixmnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_real_aqui
```

### 2. Obtener las Claves de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar en Vercel

Las variables también deben estar en Vercel para producción:

1. Ve a [Vercel Dashboard](https://vercel.com)
2. Tu proyecto → **Settings** → **Environment Variables**
3. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jkdvrwmanmwoyyoixmnt.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu anon key)
   - `GOOGLE_GENERATIVE_AI_API_KEY` = (ya está)

### 4. Verificar Build Local

```bash
# Limpiar caché
rm -rf .next .turbo

# Rebuild
npm run build
```

Si el build local funciona, el deploy en Vercel también debería funcionar.

---

## 🔍 Verificación

### Script de Verificación

Ejecuta el script de verificación:

```bash
./scripts/verify-before-build.sh
```

Este script verifica:
- ✅ Variables de entorno
- ✅ Exports de metadata
- ✅ Secretos en el código

### Verificación Manual

```bash
# Verificar que las variables estén cargadas
node -e "console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')"
```

---

## 📝 Archivo `.env.local` Completo

```bash
# ============================================
# SUPABASE (REQUERIDO - Crítico para build)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://jkdvrwmanmwoyyoixmnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZHZyd21hbm13b3l5b2l4bW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3M...

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

## 🚀 Después de Configurar

1. **Commit y Push:**
   ```bash
   git add .
   git commit -m "docs: Agregar guía de configuración de variables de entorno"
   git push origin main
   ```

2. **Deploy en Vercel:**
   - Vercel detectará el push automáticamente
   - O ejecuta: `vercel --prod --yes`

3. **Verificar:**
   - El build debe completarse exitosamente
   - La página `/verificacion` debe funcionar

---

## ⚠️ Importante

- `.env.local` **NO se sube al repositorio** (está en `.gitignore`) ✅
- Las variables en **Vercel se configuran manualmente** en el dashboard
- Las variables `NEXT_PUBLIC_*` son **públicas** y seguras para el cliente
- Sin estas variables, el **build fallará** ❌

---

**Una vez agregadas las variables de Supabase, el build debería funcionar correctamente.** ✅
