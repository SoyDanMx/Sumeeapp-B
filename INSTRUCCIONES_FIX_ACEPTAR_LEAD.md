# 🔧 Instrucciones: Fix para Aceptar Lead

## ❌ Problema

Al aceptar un lead, se produce el error:
```
new row for relation "leads" violates check constraint "leads_estado_check"
```

## ✅ Solución Implementada

### 1. Actualizar Constraint en Supabase

Ejecuta la siguiente migración SQL en el SQL Editor de Supabase:

```sql
-- Eliminar constraint existente
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_estado_check;

-- Agregar constraint actualizado con 'aceptado' y 'Aceptado'
ALTER TABLE public.leads
  ADD CONSTRAINT leads_estado_check 
  CHECK (estado IN (
    'Nuevo', 'nuevo',
    'Aceptado', 'aceptado',
    'Asignado', 'asignado',
    'Contactado', 'contactado',
    'En Progreso', 'en_progreso',
    'en_camino',
    'Completado', 'completado',
    'Cancelado', 'cancelado'
  ));
```

**Archivo:** `supabase/migrations/20250117_fix_leads_estado_check_constraint.sql`

### 2. Actualizar Función RPC accept_lead

La función RPC ahora usa `'Asignado'` en lugar de `'aceptado'` para evitar conflictos con el constraint.

**Archivo:** `src/lib/supabase/accept-lead-rpc.sql`

### 3. Mensaje de WhatsApp Personalizado

Cuando un profesional acepta un lead, se envía automáticamente un mensaje de WhatsApp al cliente con el formato:

```
Hola, Soy [Nombre] y he aceptado tu servicio de [Servicio] por $[Precio] en la ubicación "[Ubicación]". Estaré en contacto para acordar fecha y hora contigo.
```

**Archivo:** `src/lib/supabase/credential-sender.ts`

### 4. Lógica de Disponibilidad

- **Leads aceptados NO aparecen en "Nuevos Leads"**: El filtro en `WorkFeed.tsx` solo muestra leads con estado `"nuevo"` y sin `profesional_asignado_id`.
- **Leads aceptados aparecen en "En Progreso"**: El filtro muestra leads asignados al profesional actual con estados activos (`"Asignado"`, `"aceptado"`, `"contactado"`, `"en_progreso"`, `"en_camino"`).

## 📋 Cambios Realizados

1. ✅ Migración SQL para actualizar constraint
2. ✅ Función RPC `accept_lead` actualizada para usar `'Asignado'`
3. ✅ API route `/api/leads/accept` actualizada para usar `'Asignado'`
4. ✅ Mensaje de WhatsApp personalizado según requerimiento del usuario
5. ✅ Filtros en `WorkFeed.tsx` ya configurados correctamente

## 🧪 Verificación

Después de ejecutar la migración SQL:

1. Intenta aceptar un lead desde el dashboard profesional
2. Verifica que:
   - El lead desaparece de "Nuevos Leads"
   - El lead aparece en "En Progreso"
   - Se abre WhatsApp con el mensaje personalizado
   - No se produce el error de constraint

## 📝 Notas

- El estado `'Asignado'` es el estado estándar cuando un profesional acepta un lead
- El lead queda registrado como log en ambos dashboards (cliente y profesional) para deslinde de disputas
- El mensaje de WhatsApp se genera automáticamente con los datos del lead y el profesional

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0*


