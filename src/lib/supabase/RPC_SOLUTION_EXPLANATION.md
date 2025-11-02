# 🏗️ Solución Arquitectónica: Función RPC con SECURITY DEFINER

## 🎯 Problema Identificado

El error `new row violates row-level security policy for table "leads"` persistía a pesar de tener una política de INSERT permisiva porque:

**La causa raíz:** Cuando PostgreSQL ejecuta un `INSERT` en una tabla con `FOREIGN KEY`, necesita verificar la existencia del registro referenciado en la tabla relacionada. Para un usuario anónimo (`anon`), esto requiere permisos `SELECT` sobre `public.profiles`, que no tiene.

### Por qué las políticas de INSERT fallan:

```sql
-- Esta política permite INSERT
CREATE POLICY "Public users can create leads"
ON public.leads FOR INSERT TO public WITH CHECK (true);
```

Pero cuando un usuario anónimo intenta insertar:

1. ✅ La política de INSERT permite la operación
2. ❌ PostgreSQL intenta validar `profesional_asignado_id` contra `profiles`
3. ❌ El usuario `anon` no tiene permisos `SELECT` en `profiles`
4. ❌ **ERROR**: `new row violates row-level security policy`

---

## ✅ Solución: Función RPC con SECURITY DEFINER

### Arquitectura de la Solución:

```
Frontend → supabase.rpc('create_lead') → Función SQL con SECURITY DEFINER → INSERT en leads
```

### Por qué funciona:

1. **SECURITY DEFINER**: La función ejecuta con privilegios de superusuario (`postgres`)
2. **Permisos completos**: Puede hacer `INSERT` en `leads` y `SELECT` en `profiles` para validar FOREIGN KEY
3. **Transparencia**: El frontend no necesita saber nada sobre permisos o RLS
4. **Seguridad**: Centralizamos la lógica de creación en un solo lugar controlado

---

## 📋 Scripts Implementados

### 1. `create-lead-rpc-function.sql`

Este script:

- ✅ Elimina todas las políticas de INSERT conflictivas
- ✅ Crea la función `create_lead` con `SECURITY DEFINER`
- ✅ Otorga permisos de ejecución a `anon` y `authenticated`
- ✅ Verifica que la función fue creada correctamente

### 2. Código Frontend Refactorizado

El archivo `src/lib/supabase/data.ts` ahora:

- ✅ Llama a `supabase.rpc('create_lead', {...})` en lugar de `supabase.from('leads').insert(...)`
- ✅ Maneja la respuesta y errores de la función RPC
- ✅ Obtiene el lead completo después de la creación para devolverlo

---

## 🔒 Seguridad

### ¿Es seguro usar SECURITY DEFINER?

**Sí**, porque:

1. **Validación de entrada**: La función valida todos los parámetros
2. **Lógica centralizada**: Todas las validaciones están en un solo lugar
3. **Control de acceso**: Solo usuarios autorizados pueden ejecutar la función (mediante `GRANT EXECUTE`)
4. **Auditoría**: Toda la lógica de creación está en la base de datos, facilitando auditoría

### Ventajas sobre INSERT directo:

| Aspecto                  | INSERT Directo                            | RPC con SECURITY DEFINER                   |
| ------------------------ | ----------------------------------------- | ------------------------------------------ |
| Permisos FOREIGN KEY     | ❌ Requiere SELECT en tablas relacionadas | ✅ Ejecuta con privilegios de superusuario |
| Complejidad de políticas | ❌ Múltiples políticas necesarias         | ✅ Solo una política de EXECUTE            |
| Mantenibilidad           | ❌ Lógica dispersa en frontend            | ✅ Lógica centralizada en DB               |
| Seguridad                | ⚠️ Políticas pueden tener fugas           | ✅ Lógica controlada en función            |

---

## 📝 Instrucciones de Implementación

### Paso 1: Ejecutar Script SQL

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido de `src/lib/supabase/create-lead-rpc-function.sql`
3. Ejecuta el script
4. Verifica que la función fue creada (el script incluye una verificación)

### Paso 2: Verificar que Funcionó

Ejecuta esta consulta para verificar:

```sql
SELECT
  routine_name,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_lead';
```

Deberías ver:

- `routine_name`: `create_lead`
- `security_type`: `DEFINER` (¡CRÍTICO!)

### Paso 3: Probar

1. Recarga la aplicación completamente
2. Intenta crear un lead como usuario anónimo
3. Debería funcionar sin errores

---

## 🔍 Troubleshooting

### Si el error persiste:

1. **Verifica que la función tiene SECURITY DEFINER:**

   ```sql
   SELECT security_type FROM information_schema.routines
   WHERE routine_name = 'create_lead';
   ```

   Debe ser `DEFINER`, no `INVOKER`.

2. **Verifica los permisos de ejecución:**

   ```sql
   SELECT grantee, privilege_type
   FROM information_schema.routine_privileges
   WHERE routine_name = 'create_lead';
   ```

   Debe incluir `anon` y `authenticated`.

3. **Verifica que no hay políticas de INSERT bloqueando:**
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'leads' AND cmd = 'INSERT';
   ```
   No debería haber ninguna (la función maneja el INSERT internamente).

---

## 💡 Conclusión

El patrón **RPC con SECURITY DEFINER** es la solución arquitectónica correcta para operaciones que involucran:

- ✅ FOREIGN KEY constraints
- ✅ Operaciones multi-tabla
- ✅ Lógica compleja de validación
- ✅ Requisitos de permisos elevados

Es más robusto que las políticas de INSERT directas porque:

1. Resuelve problemas de permisos de FOREIGN KEY automáticamente
2. Centraliza la lógica de negocio
3. Facilita el mantenimiento y auditoría
4. Es el patrón recomendado por Supabase para operaciones complejas

---

_Última actualización: 2025-11-02_
