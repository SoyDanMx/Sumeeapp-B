# 📋 SCRIPTS SQL PARA SUPABASE

## ⚠️ IMPORTANTE: Ejecutar en orden

Ejecuta estos scripts **uno por uno** en el **SQL Editor** de Supabase, en el orden indicado.

---

## 📝 SCRIPT 1: Políticas RLS Completas

**Ejecuta PRIMERO este script** para configurar las políticas de seguridad.

```sql
-- =========================================================================
-- MIGRACIÓN: Políticas RLS Completas para Leads
-- =========================================================================
-- Esta migración completa las políticas RLS para permitir:
-- 1. Clientes: Crear, ver, actualizar y eliminar sus propios leads
-- 2. Profesionales: Ver leads disponibles y aceptar leads
-- 3. Admins: Acceso completo (opcional)
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASO 1: Eliminar políticas existentes para empezar limpio
-- =========================================================================

DROP POLICY IF EXISTS "authenticated_users_can_create_leads_v3" ON public.leads;
DROP POLICY IF EXISTS "anonymous_users_can_create_leads_v3" ON public.leads;
DROP POLICY IF EXISTS "Public users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "clients_can_create_leads" ON public.leads;
DROP POLICY IF EXISTS "clients_can_view_own_leads" ON public.leads;
DROP POLICY IF EXISTS "professionals_can_view_leads" ON public.leads;
DROP POLICY IF EXISTS "professionals_can_accept_leads" ON public.leads;

-- Asegurar que RLS esté habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- PASO 2: POLÍTICAS PARA CLIENTES
-- =========================================================================

-- Policy 1: Clientes autenticados pueden crear leads
-- Solo pueden crear leads donde ellos son el cliente_id
CREATE POLICY "clients_can_create_leads"
ON public.leads
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permite crear si cliente_id coincide con el usuario autenticado
  cliente_id = auth.uid()
  OR
  -- También permite si cliente_id es NULL (para flexibilidad inicial)
  cliente_id IS NULL
);

-- Policy 2: Clientes pueden ver sus propios leads
CREATE POLICY "clients_can_view_own_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  cliente_id = auth.uid()
);

-- Policy 3: Clientes pueden actualizar sus propios leads
-- Solo si el lead aún no ha sido aceptado por un profesional
CREATE POLICY "clients_can_update_own_pending_leads"
ON public.leads
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  cliente_id = auth.uid() 
  AND (estado = 'Nuevo' OR estado = 'nuevo' OR profesional_asignado_id IS NULL)
)
WITH CHECK (
  cliente_id = auth.uid()
  AND (estado = 'Nuevo' OR estado = 'nuevo' OR profesional_asignado_id IS NULL)
);

-- Policy 4: Clientes pueden eliminar sus propios leads pendientes
CREATE POLICY "clients_can_delete_own_pending_leads"
ON public.leads
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  cliente_id = auth.uid() 
  AND (estado = 'Nuevo' OR estado = 'nuevo' OR profesional_asignado_id IS NULL)
);

-- =========================================================================
-- PASO 3: POLÍTICAS PARA PROFESIONALES
-- =========================================================================

-- Policy 5: Profesionales pueden ver leads disponibles
-- (sin asignar) O los que están asignados a ellos
CREATE POLICY "professionals_can_view_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  -- Leads disponibles para todos los profesionales (estado = 'Nuevo' y sin asignar)
  (
    (estado = 'Nuevo' OR estado = 'nuevo')
    AND profesional_asignado_id IS NULL
  )
  OR
  -- Leads asignados a este profesional
  profesional_asignado_id = auth.uid()
  OR
  -- Si el usuario es profesional verificado, puede ver leads en su zona
  (
    (estado = 'Nuevo' OR estado = 'nuevo')
    AND profesional_asignado_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'profesional'
    )
  )
);

-- Policy 6: Profesionales pueden aceptar leads disponibles
-- Asignándose a sí mismos como profesional_asignado_id
CREATE POLICY "professionals_can_accept_leads"
ON public.leads
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  -- Solo leads pendientes sin profesional asignado
  (estado = 'Nuevo' OR estado = 'nuevo')
  AND profesional_asignado_id IS NULL
  -- Y el usuario debe ser un profesional verificado
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'profesional'
  )
)
WITH CHECK (
  -- Pueden cambiar el profesional_asignado_id a su propio ID
  profesional_asignado_id = auth.uid()
  -- Y actualizar el estado
  AND (estado IN ('Asignado', 'asignado', 'En Progreso', 'en_progreso'))
);

-- Policy 7: Profesionales pueden actualizar leads que tienen asignados
CREATE POLICY "professionals_can_update_assigned_leads"
ON public.leads
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  profesional_asignado_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'profesional'
  )
)
WITH CHECK (
  profesional_asignado_id = auth.uid()
);

-- =========================================================================
-- PASO 4: POLÍTICAS PARA USUARIOS ANÓNIMOS (Opcional)
-- =========================================================================

-- Policy 8: Usuarios anónimos pueden crear leads sin cliente_id
CREATE POLICY "anonymous_users_can_create_leads"
ON public.leads
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (
  -- Solo permite crear leads sin cliente_id (usuarios anónimos)
  cliente_id IS NULL
);

-- =========================================================================
-- PASO 5: POLÍTICAS PARA ADMINS (Opcional)
-- =========================================================================

-- Policy 9: Admins pueden ver todos los leads
-- Nota: Requiere tabla user_roles o campo role en profiles
CREATE POLICY "admins_can_view_all_leads"
ON public.leads
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 10: Admins pueden hacer cualquier operación
CREATE POLICY "admins_can_modify_all_leads"
ON public.leads
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

COMMIT;

-- =========================================================================
-- VERIFICACIÓN
-- =========================================================================

-- Ver todas las policies de la tabla leads
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY policyname;

-- Contar policies activas
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'leads';

-- Verificar que RLS está habilitado
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN 'RLS Habilitado ✅'
    ELSE 'RLS Deshabilitado ❌'
  END as rls_status
FROM pg_tables
WHERE tablename = 'leads'
  AND schemaname = 'public';
```

---

## 📝 SCRIPT 2: Estructura de Tabla y Optimizaciones

**Ejecuta SEGUNDO este script** para agregar defaults, constraints e índices.

```sql
-- =========================================================================
-- MIGRACIÓN: Estructura Correcta de Tabla Leads
-- =========================================================================
-- Esta migración garantiza que la tabla 'leads' tiene:
-- 1. Defaults para campos críticos
-- 2. Trigger para updated_at automático
-- 3. Constraints para validación de datos
-- 4. Índices optimizados para queries comunes
-- =========================================================================

BEGIN;

-- =========================================================================
-- PASO 1: Agregar defaults si no existen
-- =========================================================================

-- Asegurar que id tiene default UUID (ya debería tenerlo, pero por si acaso)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'id'
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.leads 
      ALTER COLUMN id SET DEFAULT gen_random_uuid();
    RAISE NOTICE '✅ Default agregado a columna id';
  END IF;
END $$;

-- Asegurar que fecha_creacion tiene default (ya debería tenerlo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'fecha_creacion'
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.leads 
      ALTER COLUMN fecha_creacion SET DEFAULT timezone('utc'::text, now());
    RAISE NOTICE '✅ Default agregado a columna fecha_creacion';
  END IF;
END $$;

-- Agregar columna updated_at si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.leads 
      ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    RAISE NOTICE '✅ Columna updated_at agregada';
  ELSE
    -- Si existe, asegurar que tiene default
    ALTER TABLE public.leads 
      ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());
    RAISE NOTICE '✅ Default agregado a columna updated_at existente';
  END IF;
END $$;

-- Asegurar que estado tiene default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'estado'
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.leads 
      ALTER COLUMN estado SET DEFAULT 'Nuevo';
    RAISE NOTICE '✅ Default agregado a columna estado';
  END IF;
END $$;

-- =========================================================================
-- PASO 2: Asegurar que profesional_asignado_id puede ser NULL
-- =========================================================================

ALTER TABLE public.leads 
  ALTER COLUMN profesional_asignado_id DROP NOT NULL;

-- =========================================================================
-- PASO 3: Agregar check constraints para validación
-- =========================================================================

-- Constraint para estado
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_estado_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_estado_check 
  CHECK (estado IN (
    'Nuevo', 'nuevo',
    'Asignado', 'asignado',
    'En Progreso', 'en_progreso',
    'Completado', 'completado',
    'Cancelado', 'cancelado',
    'Contactado', 'contactado'
  ));

-- Constraint para servicio (si existe columna urgencia)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'urgencia'
  ) THEN
    ALTER TABLE public.leads
      DROP CONSTRAINT IF EXISTS leads_urgencia_check;

    ALTER TABLE public.leads
      ADD CONSTRAINT leads_urgencia_check 
      CHECK (urgencia IN ('baja', 'normal', 'alta', 'urgente', 'emergencia'));
    
    RAISE NOTICE '✅ Constraint agregado a columna urgencia';
  END IF;
END $$;

-- Constraint para servicio
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_servicio_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_servicio_check 
  CHECK (servicio IN (
    'plomeria',
    'electricidad',
    'carpinteria',
    'pintura',
    'limpieza',
    'jardineria',
    'albanileria',
    'remodelacion',
    'impermeabilizacion',
    'gas',
    'calentadores',
    'bombas_agua',
    'seguridad',
    'climatizacion',
    'electrodomesticos'
  ));

-- =========================================================================
-- PASO 4: Crear función y trigger para updated_at automático
-- =========================================================================

-- Eliminar triggers antiguos de updated_at si existen
-- (Puede haber triggers duplicados de migraciones anteriores)
DROP TRIGGER IF EXISTS leads_set_updated_at ON public.leads;
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear función alias para compatibilidad (si existe touch_leads_updated_at)
-- Esto asegura que si algún código antiguo la referencia, siga funcionando
CREATE OR REPLACE FUNCTION public.touch_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger único para updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leads_updated_at();

-- =========================================================================
-- PASO 5: Crear índices para mejorar performance
-- =========================================================================

-- Índice para cliente_id
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id 
  ON public.leads(cliente_id)
  WHERE cliente_id IS NOT NULL;

-- Índice para profesional_asignado_id
CREATE INDEX IF NOT EXISTS idx_leads_profesional_asignado_id 
  ON public.leads(profesional_asignado_id)
  WHERE profesional_asignado_id IS NOT NULL;

-- Índice para estado
CREATE INDEX IF NOT EXISTS idx_leads_estado 
  ON public.leads(estado);

-- Índice para servicio
CREATE INDEX IF NOT EXISTS idx_leads_servicio 
  ON public.leads(servicio);

-- Índice para fecha_creacion (ordenamiento)
CREATE INDEX IF NOT EXISTS idx_leads_fecha_creacion 
  ON public.leads(fecha_creacion DESC);

-- Índice compuesto para query común: leads disponibles
-- (estado = 'Nuevo' y sin profesional asignado)
CREATE INDEX IF NOT EXISTS idx_leads_disponibles 
  ON public.leads(estado, profesional_asignado_id, fecha_creacion DESC)
  WHERE (estado = 'Nuevo' OR estado = 'nuevo') 
    AND profesional_asignado_id IS NULL;

-- Índice para búsqueda por ubicación (si usas coordenadas)
CREATE INDEX IF NOT EXISTS idx_leads_ubicacion 
  ON public.leads(ubicacion_lat, ubicacion_lng)
  WHERE ubicacion_lat IS NOT NULL AND ubicacion_lng IS NOT NULL;

-- Índice para negotiation_status (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'negotiation_status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_leads_negotiation_status 
      ON public.leads(negotiation_status)
      WHERE negotiation_status IS NOT NULL;
    
    RAISE NOTICE '✅ Índice agregado para negotiation_status';
  END IF;
END $$;

COMMIT;

-- =========================================================================
-- VERIFICACIÓN
-- =========================================================================

-- Ver estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'leads'
  AND nsp.nspname = 'public'
ORDER BY constraint_name;

-- Ver índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'leads'
ORDER BY indexname;

-- Ver triggers
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'leads'
  AND event_object_schema = 'public';
```

---

## 📝 SCRIPT 3: Limpieza de Políticas Duplicadas (Opcional pero Recomendado)

**Ejecuta TERCERO este script** para eliminar políticas duplicadas y limpiar la base de datos.

⚠️ **IMPORTANTE**: Copia y pega el script COMPLETO, línea por línea, asegurándote de que no se corte ninguna palabra.

```sql
-- =========================================================================
-- SCRIPT 3: Limpieza de Políticas RLS Duplicadas
-- =========================================================================
-- Copia y pega este script COMPLETO en Supabase SQL Editor
-- =========================================================================

BEGIN;

-- Eliminar políticas duplicadas de INSERT
DROP POLICY IF EXISTS "allow_create_lead_for_anonymous" ON public.leads;
DROP POLICY IF EXISTS "allow_create_lead_for_authenticated" ON public.leads;

-- Eliminar políticas duplicadas de SELECT
DROP POLICY IF EXISTS "Professionals can view new and assigned leads" ON public.leads;
DROP POLICY IF EXISTS "customers_select_own_leads" ON public.leads;

-- Eliminar políticas duplicadas de UPDATE
DROP POLICY IF EXISTS "customers_update_own_leads" ON public.leads;

-- Eliminar políticas duplicadas de DELETE
DROP POLICY IF EXISTS "customers_delete_own_leads" ON public.leads;

COMMIT;

-- =========================================================================
-- VERIFICACIÓN: Ver políticas finales
-- =========================================================================

SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY 
  CASE cmd
    WHEN 'INSERT' THEN 1
    WHEN 'SELECT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    WHEN 'ALL' THEN 5
    ELSE 6
  END,
  policyname;
```

---

## ✅ PASOS PARA EJECUTAR

1. **Abre Supabase Dashboard** → Ve a tu proyecto
2. **Ve a SQL Editor** (menú lateral izquierdo)
3. **Ejecuta SCRIPT 1** completo (copia y pega todo el primer bloque)
4. **Verifica que no haya errores** (deberías ver las queries de verificación al final)
5. **Ejecuta SCRIPT 2** completo (copia y pega todo el segundo bloque)
6. **Verifica que no haya errores** (deberías ver las queries de verificación al final)
7. **Ejecuta SCRIPT 3** (opcional pero recomendado) para limpiar políticas duplicadas
8. **Verifica el resumen final** de políticas

---

## 🔍 QUÉ HACE CADA SCRIPT

### SCRIPT 1: Políticas RLS
- ✅ Elimina políticas antiguas
- ✅ Crea políticas para clientes (INSERT, SELECT, UPDATE, DELETE)
- ✅ Crea políticas para profesionales (SELECT, UPDATE para aceptar leads)
- ✅ Crea políticas para admins (acceso completo)
- ✅ Verifica que todo se aplicó correctamente

### SCRIPT 2: Estructura y Optimización
- ✅ Agrega defaults a columnas críticas
- ✅ Agrega columna `updated_at` con trigger automático
- ✅ Agrega CHECK constraints para validación
- ✅ Crea índices para mejorar performance
- ✅ Verifica que todo se aplicó correctamente

### SCRIPT 3: Limpieza (Opcional)
- ✅ Elimina políticas RLS duplicadas
- ✅ Mantiene solo las políticas necesarias
- ✅ Muestra resumen final de políticas

---

## ⚠️ NOTAS IMPORTANTES

1. **Ejecuta en orden**: Primero SCRIPT 1, luego SCRIPT 2
2. **No interrumpas**: Cada script usa `BEGIN` y `COMMIT`, no lo interrumpas
3. **Revisa errores**: Si hay algún error, revísalo antes de continuar
4. **Backup**: Considera hacer un backup antes (opcional pero recomendado)

---

## 🎯 RESULTADO ESPERADO

Después de ejecutar ambos scripts:

✅ **Clientes** podrán crear, ver, actualizar y eliminar sus propios leads  
✅ **Profesionales** podrán ver leads disponibles y aceptar leads  
✅ **Tabla optimizada** con índices y constraints  
✅ **Trigger automático** para `updated_at`  
✅ **RLS completo** y seguro

---

## 🐛 SI HAY ERRORES

Si encuentras algún error:

1. **Lee el mensaje de error** completo
2. **Verifica que la tabla `leads` existe**
3. **Verifica que la tabla `profiles` existe** (necesaria para validar roles)
4. **Revisa los logs** en Supabase Dashboard → Logs

Si el error persiste, comparte el mensaje de error completo y te ayudo a resolverlo.

