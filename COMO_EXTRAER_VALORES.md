# 📋 Cómo Extraer los Valores de .env.local

## 🔍 Valores que Necesitas (Líneas 6-8)

Basándome en que mencionas las líneas 6-8, probablemente tienes algo como:

```env
# Línea 6: NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co

# Línea 7: SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Línea 8: NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

---

## ✅ Valor 1: PROJECT_REF (de la línea 6)

### Ejemplo de tu línea 6:
```env
NEXT_PUBLIC_SUPABASE_URL=https://jabcdefghijklmnop.supabase.co
```

### Cómo extraerlo:
1. **Copia la URL completa** de esa línea
2. **Elimina** `https://` del inicio
3. **Elimina** `.supabase.co` del final
4. **Lo que queda es tu PROJECT_REF**

### Ejemplo:
- URL completa: `https://jabcdefghijklmnop.supabase.co`
- Elimina `https://` → `jabcdefghijklmnop.supabase.co`
- Elimina `.supabase.co` → `jabcdefghijklmnop`
- **PROJECT_REF = `jabcdefghijklmnop`**

---

## 🔑 Valor 2: SERVICE_ROLE_KEY (de la línea 7)

### Ejemplo de tu línea 7:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphYmNkZWZnaGlqa2xtbm9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYxNjIzOTAyMn0.abcdefghijklmnopqrstuvwxyz1234567890...
```

### Cómo copiarlo:
1. **Copia TODO el valor** después del `=`
2. **Incluye TODO** desde `eyJhbGci...` hasta el final
3. **No dejes espacios** al inicio o final
4. Es muy largo (varios cientos de caracteres)

---

## 📝 Cómo Usarlos en el Script SQL

### En `SCRIPT_SQL_PASO5_LISTO.sql`, línea 27:

**ANTES:**
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://TU_PROJECT_REF_AQUI.supabase.co';
```

**DESPUÉS (con tu PROJECT_REF):**
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://jabcdefghijklmnop.supabase.co';
```

### En `SCRIPT_SQL_PASO5_LISTO.sql`, línea 31:

**ANTES:**
```sql
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'TU_SERVICE_ROLE_KEY_AQUI';
```

**DESPUÉS (con tu SERVICE_ROLE_KEY completo):**
```sql
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphYmNkZWZnaGlqa2xtbm9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYxNjIzOTAyMn0.abcdefghijklmnopqrstuvwxyz1234567890...';
```

---

## 🎯 Pasos Rápidos

1. **Abre `.env.local`**
2. **Línea 6:** Copia el valor de `NEXT_PUBLIC_SUPABASE_URL`
   - Extrae solo la parte del medio (PROJECT_REF)
3. **Línea 7:** Copia TODO el valor de `SUPABASE_SERVICE_ROLE_KEY`
4. **Abre `SCRIPT_SQL_PASO5_LISTO.sql`**
5. **Línea 27:** Reemplaza `TU_PROJECT_REF_AQUI` con tu PROJECT_REF
6. **Línea 31:** Reemplaza `TU_SERVICE_ROLE_KEY_AQUI` con tu SERVICE_ROLE_KEY completo
7. **Guarda el archivo**
8. **Copia todo el script** y pégalo en Supabase SQL Editor

---

## ⚠️ Importante

- **PROJECT_REF:** Solo la parte del medio, sin `https://` ni `.supabase.co`
- **SERVICE_ROLE_KEY:** TODO el valor completo, desde `eyJhbGci...` hasta el final
- **No dejes espacios** al inicio o final de los valores
- **Mantén las comillas simples** `'...'` en el SQL

---

¿Puedes compartir (sin mostrar los valores completos) qué formato tienen tus líneas 6-7? Así te ayudo a extraerlos correctamente.

