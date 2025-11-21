# 🔧 INSTRUCCIONES: Agregar Columnas Faltantes a la Tabla Leads

## ⚠️ PROBLEMA
El error "Could not find the 'appointment_status' column" indica que faltan columnas en la tabla `leads` de Supabase.

## ✅ SOLUCIÓN DEFINITIVA

### Paso 1: Ejecutar Script SQL en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** (en el menú lateral)
3. Copia y pega el siguiente script:

```sql
-- =========================================================================
-- SCRIPT DEFINITIVO: AGREGAR COLUMNAS FALTANTES A LEADS
-- =========================================================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. appointment_status
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS appointment_status text DEFAULT 'pendiente';

-- 2. contact_deadline_at
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS contact_deadline_at timestamptz;

-- 3. appointment_notes
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS appointment_notes text;

-- 4. updated_at
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- 5. Verificar que se agregaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name IN ('appointment_status', 'contact_deadline_at', 'appointment_notes', 'updated_at')
ORDER BY column_name;
```

4. Haz clic en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
5. Verifica que todas las columnas se agregaron correctamente

### Paso 2: Verificar

Después de ejecutar el script, deberías ver en los resultados:
- ✅ `appointment_status` - text
- ✅ `contact_deadline_at` - timestamp with time zone
- ✅ `appointment_notes` - text
- ✅ `updated_at` - timestamp with time zone

### Paso 3: Probar

1. Intenta aceptar un lead nuevamente en el dashboard profesional
2. El error debería desaparecer

## 📝 Nota

El código de la aplicación ya está preparado para funcionar sin estas columnas (fallback), pero para una experiencia completa, es recomendable agregarlas.

## 🔗 Archivo SQL Completo

Si prefieres ejecutar un script más completo, usa:
`src/lib/supabase/add-appointment-status-column.sql`

