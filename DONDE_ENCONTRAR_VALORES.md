# 🔍 Dónde Encontrar los Valores para el Script SQL

## ✅ SÍ, el Service Role Key está en .env.local

Ambos valores están en tu archivo `.env.local`:

---

## 📍 Valor 1: PROJECT_REF (de la URL de Supabase)

### Dónde encontrarlo:
1. Abre tu archivo `.env.local`
2. Busca la línea que dice:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
   ```

### Cómo extraerlo:
- Si tu línea es: `NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co`
- Entonces tu PROJECT_REF es: `abcdefghijklmnop`
- **Solo copia la parte del medio** (sin `https://` ni `.supabase.co`)

### Ejemplo:
```env
# En tu .env.local verás algo como:
NEXT_PUBLIC_SUPABASE_URL=https://jabcdefghijklmnop.supabase.co

# Tu PROJECT_REF es: jabcdefghijklmnop
```

---

## 🔑 Valor 2: Service Role Key

### Dónde encontrarlo:
1. Abre tu archivo `.env.local`
2. Busca la línea que dice:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```

### Cómo copiarlo:
- **Copia TODO el valor completo**
- Empieza con `eyJhbGci...`
- Es muy largo (varios cientos de caracteres)
- **No dejes espacios** al inicio o final

### Ejemplo:
```env
# En tu .env.local verás algo como:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphYmNkZWZnaGlqa2xtbm9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYxNjIzOTAyMn0.abcdefghijklmnopqrstuvwxyz1234567890...

# Copia TODO ese valor (es muy largo)
```

---

## 📝 Cómo Reemplazar en el Script

### En `SCRIPT_SQL_PASO5_LISTO.sql`, busca estas líneas (alrededor de línea 27-35):

```sql
-- LÍNEA 1: Reemplaza TU_PROJECT_REF_AQUI
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://TU_PROJECT_REF_AQUI.supabase.co';

-- LÍNEA 2: Reemplaza TU_SERVICE_ROLE_KEY_AQUI
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'TU_SERVICE_ROLE_KEY_AQUI';
```

### Ejemplo de cómo debe quedar:

**ANTES:**
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://TU_PROJECT_REF_AQUI.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'TU_SERVICE_ROLE_KEY_AQUI';
```

**DESPUÉS (con valores reales de tu .env.local):**
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://jabcdefghijklmnop.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphYmNkZWZnaGlqa2xtbm9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYxNjIzOTAyMn0.abcdefghijklmnopqrstuvwxyz1234567890...';
```

---

## 🔍 Si no encuentras los valores en .env.local

### Alternativa: Obtenerlos desde Supabase Dashboard

1. Ve a **https://supabase.com/dashboard**
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) > **API**

### Para PROJECT_REF:
- En la sección **"Project URL"**
- Verás: `https://TU_PROJECT_REF.supabase.co`
- Copia solo la parte del medio

### Para Service Role Key:
- En la sección **"Project API keys"**
- Busca la key que dice **"service_role"** (⚠️ secreta)
- Haz clic en el ícono de **ojo** 👁️ para revelarla
- Haz clic en **"Copy"** para copiarla

---

## ✅ Resumen

| Valor | Dónde está | Qué copiar |
|-------|------------|------------|
| **PROJECT_REF** | `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` | Solo la parte del medio (sin `https://` ni `.supabase.co`) |
| **SERVICE_ROLE_KEY** | `.env.local` → `SUPABASE_SERVICE_ROLE_KEY` | Todo el valor completo (empieza con `eyJhbGci...`) |

---

## 🎯 Pasos Rápidos

1. Abre `.env.local`
2. Busca `NEXT_PUBLIC_SUPABASE_URL` → Extrae el PROJECT_REF
3. Busca `SUPABASE_SERVICE_ROLE_KEY` → Copia todo el valor
4. Abre `SCRIPT_SQL_PASO5_LISTO.sql`
5. Reemplaza los 2 valores en las líneas 27 y 35
6. Guarda el archivo
7. Copia todo el script y pégalo en Supabase SQL Editor

---

¿Necesitas ayuda para encontrar estos valores en tu `.env.local`?

