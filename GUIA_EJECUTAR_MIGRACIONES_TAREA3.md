# 📋 Guía: Ejecutar Migraciones de Base de Datos - Tarea 3

Esta guía te ayudará a ejecutar los scripts SQL necesarios para completar la Tarea 3 (Priority Boost).

## 🎯 Objetivo

Agregar la funcionalidad de `priority_boost` a la tabla `leads` para que los leads de usuarios PRO tengan prioridad en el matching.

---

## 📝 Paso 1: Agregar Columna `priority_boost`

### Ubicación del Script
```
supabase/migrations/add-priority-boost-column.sql
```

### Instrucciones

1. **Abre el SQL Editor en Supabase:**
   - Ve a tu proyecto en https://supabase.com/dashboard
   - Navega a **SQL Editor** en el menú lateral

2. **Copia y pega el siguiente script:**

```sql
-- Agregar columna priority_boost si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'leads' 
      AND column_name = 'priority_boost'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN priority_boost BOOLEAN DEFAULT FALSE NOT NULL;
    
    RAISE NOTICE 'Columna priority_boost creada exitosamente.';
  ELSE
    RAISE NOTICE 'Columna priority_boost ya existe.';
  END IF;
END $$;

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_leads_priority_boost ON public.leads(priority_boost) 
WHERE priority_boost = TRUE;

-- Agregar comentario descriptivo
COMMENT ON COLUMN public.leads.priority_boost IS 
'Indica si el lead tiene prioridad en el matching debido a que el cliente tiene plan PRO. 
Los leads con priority_boost = TRUE deben ser mostrados primero a los profesionales.';
```

3. **Ejecuta el script** haciendo clic en **RUN** o presionando `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verifica que se ejecutó correctamente:**
   - Deberías ver un mensaje: "Columna priority_boost creada exitosamente."
   - Si ves "Columna priority_boost ya existe", significa que ya estaba creada (está bien)

---

## 📝 Paso 2: Actualizar Función RPC `create_lead`

### Ubicación del Script
```
supabase/migrations/update-create-lead-with-priority-boost.sql
```

### Instrucciones

1. **Abre el SQL Editor en Supabase** (si no lo tienes abierto)

2. **Copia y pega el siguiente script:**

```sql
-- Actualizar la función RPC create_lead para incluir priority_boost
CREATE OR REPLACE FUNCTION public.create_lead(
  nombre_cliente_in TEXT,
  whatsapp_in TEXT,
  descripcion_proyecto_in TEXT,
  servicio_in TEXT,
  ubicacion_lat_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_lng_in DOUBLE PRECISION DEFAULT NULL,
  ubicacion_direccion_in TEXT DEFAULT NULL,
  disciplina_ia_in TEXT DEFAULT NULL,
  urgencia_ia_in INTEGER DEFAULT NULL,
  diagnostico_ia_in TEXT DEFAULT NULL,
  imagen_url_in TEXT DEFAULT NULL,
  photos_urls_in TEXT[] DEFAULT NULL,
  priority_boost_in BOOLEAN DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  new_lead_id UUID;
  user_plan TEXT;
  final_priority_boost BOOLEAN;
BEGIN
  -- Obtener el user_id actual
  current_user_id := auth.uid();
  
  -- Determinar priority_boost:
  -- 1. Si se pasa explícitamente priority_boost_in, usarlo
  -- 2. Si no, verificar el plan del usuario desde la tabla profiles
  -- 3. Si el usuario tiene plan 'pro_annual', establecer priority_boost = TRUE
  IF priority_boost_in IS NOT NULL THEN
    final_priority_boost := priority_boost_in;
  ELSIF current_user_id IS NOT NULL THEN
    -- Obtener el plan del usuario
    SELECT plan INTO user_plan
    FROM public.profiles
    WHERE user_id = current_user_id
    LIMIT 1;
    
    -- Si el usuario tiene plan pro_annual, establecer priority_boost = TRUE
    final_priority_boost := COALESCE(user_plan = 'pro_annual', FALSE);
  ELSE
    -- Usuario anónimo o sin plan, priority_boost = FALSE
    final_priority_boost := FALSE;
  END IF;
  
  -- Insertar el lead en la base de datos
  INSERT INTO public.leads (
    nombre_cliente,
    whatsapp,
    descripcion_proyecto,
    servicio,
    ubicacion_lat,
    ubicacion_lng,
    ubicacion_direccion,
    cliente_id,
    disciplina_ia,
    urgencia_ia,
    diagnostico_ia,
    imagen_url,
    photos_urls,
    priority_boost,
    estado,
    profesional_asignado_id
  )
  VALUES (
    nombre_cliente_in,
    whatsapp_in,
    descripcion_proyecto_in,
    servicio_in,
    COALESCE(ubicacion_lat_in, 19.4326),
    COALESCE(ubicacion_lng_in, -99.1332),
    ubicacion_direccion_in,
    current_user_id,
    disciplina_ia_in,
    urgencia_ia_in,
    diagnostico_ia_in,
    imagen_url_in,
    photos_urls_in,
    final_priority_boost,
    'nuevo',
    NULL
  )
  RETURNING id INTO new_lead_id;
  
  RETURN new_lead_id;
END;
$$;

-- Mantener permisos de ejecución
GRANT EXECUTE ON FUNCTION public.create_lead TO anon, authenticated;
```

3. **Ejecuta el script** haciendo clic en **RUN**

4. **Verifica que se ejecutó correctamente:**
   - Deberías ver un mensaje de éxito
   - Si hay algún error, revisa la consola de errores en Supabase

---

## ✅ Verificación

### Verificar que la columna existe:

```sql
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name = 'priority_boost';
```

**Resultado esperado:** Deberías ver una fila con `priority_boost`, `boolean`, `false`, `NO`

### Verificar que la función fue actualizada:

```sql
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';
```

**Resultado esperado:** Deberías ver la función `create_lead` con `security_type = DEFINER`

---

## 🧪 Prueba Manual

1. **Crea un lead desde el frontend** (como usuario PRO si es posible)
2. **Verifica en la base de datos:**

```sql
SELECT 
  id,
  nombre_cliente,
  servicio,
  priority_boost,
  created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 5;
```

3. **Verifica que `priority_boost` sea `true` para usuarios PRO y `false` para usuarios Express**

---

## ⚠️ Notas Importantes

- **Backup:** Aunque los scripts son seguros (usando `IF NOT EXISTS`), siempre es recomendable hacer un backup antes de ejecutar migraciones en producción
- **Orden de ejecución:** Ejecuta primero el script de la columna, luego el de la función
- **Compatibilidad:** La función mantiene compatibilidad hacia atrás - los parámetros nuevos tienen valores por defecto

---

## 🆘 Solución de Problemas

### Error: "column priority_boost already exists"
- **Solución:** Esto está bien, significa que la columna ya existe. Continúa con el Paso 2.

### Error: "function create_lead already exists"
- **Solución:** Esto está bien, el script usa `CREATE OR REPLACE`, así que actualizará la función existente.

### Error de permisos
- **Solución:** Asegúrate de estar ejecutando los scripts como superusuario o con permisos suficientes en Supabase.

---

## ✅ Checklist Final

- [ ] Script de columna `priority_boost` ejecutado exitosamente
- [ ] Script de función `create_lead` actualizado exitosamente
- [ ] Verificación de columna completada
- [ ] Verificación de función completada
- [ ] Prueba manual realizada
- [ ] Leads nuevos tienen `priority_boost` correcto según el plan del usuario

---

¡Listo! Una vez completados estos pasos, la funcionalidad de `priority_boost` estará completamente implementada. 🎉

