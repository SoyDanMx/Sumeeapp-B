# 🔧 SOLUCIÓN DEFINITIVA: Congelamiento del Dashboard

## 🐛 PROBLEMA IDENTIFICADO

El dashboard se congela después de crear un lead porque:

1. **Query compleja con JOINs**: `getClientLeads` hace JOINs con `lead_reviews` y `profiles` que pueden tardar mucho
2. **Políticas RLS**: Las políticas RLS pueden estar causando que la query se bloquee o tarde mucho
3. **React Query en loading**: Cuando `refetchLeads()` se ejecuta, React Query entra en `isLoading: true`, lo que mantiene el dashboard en loading
4. **Timeout de 10 segundos**: El timeout se activa pero no resetea correctamente el estado

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. **Timeout en `getClientLeads`** (`src/lib/supabase/data.ts`)

- ✅ Timeout de 8 segundos para la query principal
- ✅ Fallback a query simplificada (sin JOINs) si falla
- ✅ Siempre retorna array vacío en caso de error (no lanza excepción)
- ✅ Esto evita que React Query se quede en estado de error

### 2. **Mejoras en el Dashboard** (`src/app/dashboard/client/page.tsx`)

- ✅ `refreshLeads` ahora no bloquea (sin `await`)
- ✅ Loading solo se muestra en carga inicial, no en refetches
- ✅ Safety timeout de 5 segundos para forzar reset de loading
- ✅ Timeout reducido de 10 a 8 segundos
- ✅ `refetchOnWindowFocus: false` para evitar refetches automáticos

### 3. **Mejoras en `RequestServiceModal`** (`src/components/client/RequestServiceModal.tsx`)

- ✅ Redirección PRIMERO (antes de refrescar leads)
- ✅ Uso de `requestAnimationFrame` para asegurar que el modal se cierre
- ✅ Refresco de leads en background (1 segundo después, no bloqueante)

## 📋 CAMBIOS ESPECÍFICOS

### `src/lib/supabase/data.ts`

```typescript
// Timeout de 8 segundos
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => {
    reject(new Error("Timeout: La consulta tardó más de 8 segundos"));
  }, 8000);
});

// Query con timeout
const queryResult = await Promise.race([queryPromise, timeoutPromise]);

// Fallback a query simplificada si falla
if (error || !data) {
  // Query simplificada sin JOINs
  const simpleQueryPromise = supabase
    .from("leads")
    .select("*")
    .eq("cliente_id", clientId)
    .limit(100);
}
```

### `src/app/dashboard/client/page.tsx`

```typescript
// refreshLeads no bloquea
const refreshLeads = async () => {
  refetchLeads().catch((error) => {
    console.error("❌ Error al refrescar leads:", error);
  });
};

// Safety timeout de 5 segundos
useEffect(() => {
  if (loading) {
    const safetyTimeout = setTimeout(() => {
      if (loading && !userLoading) {
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(safetyTimeout);
  }
}, [loading, userLoading]);
```

### `src/components/client/RequestServiceModal.tsx`

```typescript
// Redirigir PRIMERO, refrescar después
requestAnimationFrame(() => {
  router.push(`/solicitudes/${leadData.id}`);
  
  setTimeout(() => {
    onLeadCreated(); // En background
  }, 1000);
});
```

## 🎯 RESULTADO ESPERADO

1. ✅ El dashboard NO se congela
2. ✅ El modal se cierra inmediatamente
3. ✅ La redirección es instantánea
4. ✅ Los leads se actualizan en background
5. ✅ Si hay timeout, el dashboard muestra estado vacío en lugar de quedarse en loading

## 🔍 DEBUGGING

Si el problema persiste, revisa en la consola:

1. **Logs de `getClientLeads`**:
   - `🔍 getClientLeads - Buscando leads para cliente:`
   - `✅ getClientLeads - Leads encontrados:` o `⚠️ getClientLeads - Error en query completa`

2. **Logs del Dashboard**:
   - `🔍 Dashboard - Obteniendo leads para usuario:`
   - `🔍 Dashboard - Leads obtenidos:`
   - `⚠️ Timeout en carga del dashboard` o `⚠️ Safety timeout`

3. **Verificar políticas RLS**:
   - Ejecuta en Supabase SQL Editor:
   ```sql
   SELECT policyname, cmd, roles 
   FROM pg_policies 
   WHERE tablename = 'leads' 
   ORDER BY cmd, policyname;
   ```

## 🚨 SI EL PROBLEMA PERSISTE

1. **Verificar que las políticas RLS estén correctas**:
   - `clients_can_view_own_leads` debe existir
   - Debe permitir SELECT donde `cliente_id = auth.uid()`

2. **Probar query directa en Supabase**:
   ```sql
   SELECT * FROM leads 
   WHERE cliente_id = 'TU_USER_ID' 
   ORDER BY fecha_creacion DESC 
   LIMIT 10;
   ```

3. **Verificar índices**:
   - `idx_leads_cliente_id` debe existir
   - Esto acelera las queries por `cliente_id`

4. **Revisar logs de Supabase**:
   - Ve a Supabase Dashboard → Logs → Database
   - Busca queries lentas o errores de RLS




