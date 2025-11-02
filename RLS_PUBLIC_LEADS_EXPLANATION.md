# 🔒 Explicación de Seguridad: Política RLS para INSERT Público en Leads

## 🎯 Problema Resuelto

**Error original:** `new row violates row-level security policy for table "leads"`

**Causa raíz:** La tabla `leads` tenía RLS activado con una política que solo permitía INSERT a usuarios autenticados que cumplieran `auth.uid() = cliente_id`. Esto bloqueaba completamente a usuarios anónimos.

---

## ✅ Solución Implementada

### 1. Script SQL: `src/lib/supabase/allow-public-lead-insert.sql`

```sql
CREATE POLICY "Public users can create leads"
ON public.leads
FOR INSERT
TO public
WITH CHECK (true);
```

Esta política permite que **cualquier persona** (usuarios anónimos y autenticados) pueda crear un lead.

### 2. Código Frontend: `src/lib/supabase/data.ts`

La función `submitLead` ahora:

- ✅ Obtiene el usuario actual (`supabase.auth.getUser()`)
- ✅ **Si hay usuario logueado:** Añade `cliente_id: user.id` al insert
- ✅ **Si NO hay usuario (anónimo):** No añade `cliente_id` (será `NULL`)

```typescript
// Lógica condicional
if (user) {
  leadToInsert.cliente_id = user.id;
}
// Si no hay usuario, cliente_id será NULL (correcto)
```

---

## 🔐 ¿Por qué es Seguro?

### ❌ Preocupaciones Válidas

**"¿No expone datos de clientes?"**

- **NO.** Esta política solo permite **INSERT**, no **SELECT**, **UPDATE** o **DELETE**.

**"¿Un usuario anónimo puede ver mis leads?"**

- **NO.** Las políticas de **SELECT** siguen restringiendo el acceso:
  - Solo el cliente que creó el lead puede verlo (`cliente_id = auth.uid()`)
  - Solo el profesional asignado puede ver leads asignados
  - Los usuarios anónimos NO pueden hacer SELECT en leads

**"¿Un usuario anónimo puede modificar o eliminar leads?"**

- **NO.** Esta política solo afecta a **INSERT**. Las políticas de **UPDATE** y **DELETE** siguen restringidas.

### ✅ Protecciones Implementadas

1. **Aislamiento de Operaciones:**

   - INSERT público ✅ (nueva política)
   - SELECT restringido ✅ (políticas existentes)
   - UPDATE restringido ✅ (políticas existentes)
   - DELETE restringido ✅ (políticas existentes)

2. **Seguridad de Datos:**

   - Los leads creados por usuarios anónimos tienen `cliente_id = NULL`
   - Los leads creados por usuarios logueados tienen `cliente_id = user.id`
   - Solo el propietario puede ver su propio lead (via políticas SELECT)

3. **Separación de Responsabilidades:**
   - Captura de leads: Pública (nueva política)
   - Visualización de leads: Privada (políticas existentes)
   - Modificación de leads: Privada (políticas existentes)

---

## 📊 Flujo de Seguridad

### Usuario Anónimo:

```
1. Usuario anónimo llena formulario
2. Frontend llama a submitLead()
3. submitLead() obtiene usuario → null
4. INSERT con cliente_id = NULL
5. ✅ Política RLS permite INSERT
6. ❌ Política RLS NO permite SELECT (no puede ver leads)
7. ❌ Política RLS NO permite UPDATE (no puede modificar)
```

### Usuario Autenticado:

```
1. Usuario logueado llena formulario
2. Frontend llama a submitLead()
3. submitLead() obtiene usuario → { id: "xxx" }
4. INSERT con cliente_id = "xxx"
5. ✅ Política RLS permite INSERT
6. ✅ Política RLS permite SELECT solo para cliente_id = auth.uid()
7. ❌ Política RLS NO permite UPDATE (excepto profesional asignado)
```

---

## 🧪 Cómo Probar

### Test 1: Usuario Anónimo

1. Cierra sesión en la app
2. Navega a cualquier página de servicio
3. Llena el formulario rápido
4. Haz clic en "Enviar Solicitud"
5. ✅ **Esperado:** Lead creado exitosamente
6. ✅ **Verificación:** Lead en DB con `cliente_id = NULL`

### Test 2: Usuario Autenticado

1. Inicia sesión en la app
2. Navega a cualquier página de servicio
3. Llena el formulario rápido
4. Haz clic en "Enviar Solicitud"
5. ✅ **Esperado:** Lead creado exitosamente
6. ✅ **Verificación:** Lead en DB con `cliente_id = user.id`

---

## 📝 Instrucciones para Ejecutar

### Paso 1: Ejecutar Script SQL en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido de `src/lib/supabase/allow-public-lead-insert.sql`
3. Ejecuta el script
4. Verifica que la política fue creada (el script incluye un SELECT de verificación)

### Paso 2: Verificar Políticas Existentes

Para verificar todas las políticas de `leads`:

```sql
SELECT * FROM pg_policies WHERE tablename = 'leads';
```

Deberías ver:

- ✅ "Public users can create leads" (INSERT) - **Nueva**
- ✅ Políticas de SELECT existentes (restrictivas)
- ✅ Políticas de UPDATE existentes (restrictivas)

---

## ⚠️ Notas Importantes

1. **No elimines las políticas de SELECT/UPDATE/DELETE** - Son necesarias para la seguridad
2. **Esta política solo permite INSERT** - No cambia el comportamiento de SELECT/UPDATE/DELETE
3. **Los usuarios anónimos NO pueden ver leads** - Solo pueden crearlos
4. **Esta es la solución estándar** para formularios públicos en aplicaciones con RLS

---

## 🔍 Troubleshooting

### Si el error persiste después de ejecutar el script:

1. **Verifica que la política fue creada:**

   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'leads'
   AND policyname = 'Public users can create leads';
   ```

2. **Verifica que RLS está activado:**

   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'leads'
   AND schemaname = 'public';
   ```

3. **Verifica conflictos de políticas:**
   ```sql
   SELECT policyname, cmd, roles, with_check
   FROM pg_policies
   WHERE tablename = 'leads'
   AND cmd = 'INSERT';
   ```
   Debería haber SOLO una política de INSERT.

---

_Última actualización: $(date)_
