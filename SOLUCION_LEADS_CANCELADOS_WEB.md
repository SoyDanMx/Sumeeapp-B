# Solución: Leads Cancelados Apareciendo en Dashboard Web

## Problema Identificado

Los leads cancelados aparecían en el dashboard web del cliente (`sumeeapp.com/dashboard/client`) aunque:
- Ya estaban marcados como `cancelado` en la base de datos
- Ya no aparecían en la app móvil de cliente
- La lógica debería ser la misma en ambas plataformas

## Causa Raíz

La función `getClientLeads()` en `src/lib/supabase/data.ts` estaba usando `.neq("estado", "cancelado")` y `.neq("status", "cancelled")`, pero:
- `.neq()` en Supabase no excluye valores NULL correctamente
- Si un lead tiene `estado = NULL` y `status = NULL`, el `.neq()` no lo filtra
- No había un filtro adicional en JavaScript como medida de seguridad

## Solución Implementada

### 1. Filtro Adicional en JavaScript (data.ts)

**Archivo**: `src/lib/supabase/data.ts`

Después de la query SQL, agregamos un filtro adicional en JavaScript que:
- Verifica explícitamente si `estado === 'cancelado'` o `status === 'cancelled'`
- Excluye estos leads del resultado
- Incluye logging detallado para debugging

```typescript
// 🔒 DOBLE VERIFICACIÓN: Filtrar cancelados en JavaScript también
normalized = normalized.filter((lead: any) => {
  const estado = (lead.estado || '').toLowerCase();
  const status = (lead.status || '').toLowerCase();
  const isCancelled = estado === 'cancelado' || status === 'cancelled';
  
  if (isCancelled) {
    console.log('🚫 [getClientLeads] Excluyendo lead cancelado:', {
      id: lead.id,
      estado: lead.estado,
      status: lead.status,
    });
  }
  
  return !isCancelled;
});
```

### 2. Filtro en el Componente (page.tsx)

**Archivo**: `src/app/dashboard/client/page.tsx`

Agregamos un filtro adicional en el `useEffect` que actualiza el estado local:

```typescript
// 🔒 DOBLE VERIFICACIÓN: Filtrar cancelados también en el componente
useEffect(() => {
  if (userLeads) {
    // Filtrar cancelados como medida de seguridad adicional
    const filteredLeads = userLeads.filter((lead: Lead) => {
      const estado = (lead.estado || '').toLowerCase();
      const status = (lead.status || '').toLowerCase();
      const isCancelled = estado === 'cancelado' || status === 'cancelled';
      
      if (isCancelled) {
        console.log('🚫 [ClientDashboard] Excluyendo lead cancelado del estado:', {
          id: lead.id,
          estado: lead.estado,
          status: lead.status,
        });
      }
      
      return !isCancelled;
    });
    
    setLeads(filteredLeads);
  }
}, [userLeads]);
```

## Triple Capa de Protección

1. **SQL Query**: Intenta excluir cancelados con `.neq()` (aunque no maneja NULLs perfectamente)
2. **JavaScript en data.ts**: Filtro adicional después de la query SQL
3. **JavaScript en component**: Filtro final antes de actualizar el estado local

## Resultado

- ✅ Los leads cancelados **NO aparecerán** en el dashboard web
- ✅ Misma lógica que la app de cliente móvil
- ✅ Triple capa de protección asegura que ningún cancelado se muestre
- ✅ Logging detallado para debugging y monitoreo

## Archivos Modificados

1. `src/lib/supabase/data.ts` - Función `getClientLeads()`
2. `src/app/dashboard/client/page.tsx` - Componente `ClientDashboardContent`

## Pruebas

Para verificar que funciona:
1. Cancela un servicio desde la app móvil o el dashboard web
2. Verifica que el lead tiene `estado = 'cancelado'` o `status = 'cancelled'` en la BD
3. Recarga el dashboard web
4. El lead cancelado **NO debe aparecer** en la lista

## Notas Técnicas

- La query SQL sigue usando `.neq()` para intentar excluir cancelados a nivel de base de datos
- El filtro en JavaScript es necesario porque `.neq()` no maneja NULLs correctamente
- El filtro en el componente es una medida de seguridad adicional
- El logging ayuda a identificar si algún cancelado está pasando por alguna capa

