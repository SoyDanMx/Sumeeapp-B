# ⚡ Resumen Rápido - Pasos Esenciales

## 🎯 9 Pasos Principales

```
1️⃣  Obtener API Key de Resend
    ↓
2️⃣  Agregar RESEND_API_KEY a .env.local
    ↓
3️⃣  Extraer PROJECT_REF y Service Role Key de Supabase
    ↓
4️⃣  Configurar RESEND_API_KEY en Supabase Edge Functions
    ↓
5️⃣  Ejecutar Script SQL (con tus valores)
    ↓
6️⃣  Desplegar Edge Function notify-pros
    ↓
7️⃣  Verificar instalación
    ↓
8️⃣  Probar el sistema
    ↓
9️⃣  ✅ ¡Listo!
```

---

## 📋 Checklist Rápido

### ✅ Preparación
- [ ] Cuenta en Resend creada
- [ ] API Key de Resend obtenida (empieza con `re_`)
- [ ] PROJECT_REF extraído de Supabase URL
- [ ] Service Role Key copiada de Supabase

### ✅ Configuración Local
- [ ] `RESEND_API_KEY` agregada a `.env.local`

### ✅ Configuración Supabase
- [ ] `RESEND_API_KEY` agregada a Edge Functions Secrets
- [ ] Script SQL ejecutado con valores reales
- [ ] Edge Function `notify-pros` desplegada

### ✅ Verificación
- [ ] Trigger verificado (existe en base de datos)
- [ ] Función verificada (existe en base de datos)
- [ ] Lead de prueba creado
- [ ] Logs revisados (trigger y Edge Function)
- [ ] Email recibido por profesional

---

## 🔑 Valores que Necesitas

### De tu `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### De Resend:
```
RESEND_API_KEY=re_...
```

### Para el Script SQL:
- **PROJECT_REF**: Extrae de `NEXT_PUBLIC_SUPABASE_URL`
- **SERVICE_ROLE_KEY**: Copia de `SUPABASE_SERVICE_ROLE_KEY`

---

## 📝 Script SQL - Líneas a Modificar

En `SCRIPT_SQL_PERSONALIZADO.sql`, busca estas líneas (alrededor de línea 30-33):

```sql
-- ANTES (con placeholders):
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://TU_PROJECT_REF_AQUI.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'TU_SERVICE_ROLE_KEY_AQUI';

-- DESPUÉS (con tus valores reales):
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://abcdefghijklmnop.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 🚨 Errores Comunes

| Error | Solución |
|-------|----------|
| `Extension pg_net does not exist` | Ejecuta: `CREATE EXTENSION IF NOT EXISTS pg_net;` |
| `Supabase URL no configurada` | Verifica que reemplazaste `TU_PROJECT_REF_AQUI` |
| `Service Key no configurada` | Verifica que copiaste el Service Role Key completo |
| `RESEND_API_KEY not found` | Verifica que lo agregaste en Edge Functions Secrets |
| No se envían emails | Revisa logs de Edge Function y verifica emails de profesionales |

---

## 📚 Documentación Completa

Para pasos detallados, consulta: **`GUIA_PASO_A_PASO_DETALLADA.md`**

