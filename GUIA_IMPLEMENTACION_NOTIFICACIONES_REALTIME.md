# 📧 Guía de Implementación: Notificaciones Realtime + Email Fallback

## ✅ Componentes Implementados

### 1. **Frontend: Componente RealtimeLeadNotifier**
- **Ubicación**: `src/components/dashboard/RealtimeLeadNotifier.tsx`
- **Funcionalidad**: 
  - Badge visible de notificación cuando hay leads nuevos
  - Reproduce sonido y vibración
  - Filtra leads según el perfil del profesional
  - Auto-oculta después de 10 segundos

### 2. **Backend: Edge Function notify-pros**
- **Ubicación**: `supabase/functions/notify-pros/index.ts`
- **Funcionalidad**:
  - Recibe un lead nuevo
  - Busca profesionales que coincidan (disciplina + ubicación dentro de 50km)
  - Envía emails usando Resend API

### 3. **Database: Trigger SQL**
- **Ubicación**: `supabase/migrations/create-trigger-notify-pros.sql`
- **Funcionalidad**:
  - Se activa después de INSERT en tabla `leads`
  - Llama a la Edge Function `notify-pros`

---

## 🚀 Pasos de Configuración

### **PASO 1: Configurar Resend API**

1. Crear cuenta en [Resend](https://resend.com)
2. Obtener API Key desde el dashboard
3. Verificar dominio (opcional pero recomendado)
4. Agregar variable de entorno en Supabase:

```bash
# En Supabase Dashboard > Settings > Edge Functions > Secrets
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### **PASO 2: Desplegar Edge Function**

```bash
# Desde la raíz del proyecto
supabase functions deploy notify-pros
```

O desde Supabase Dashboard:
1. Ir a **Edge Functions**
2. Crear nueva función: `notify-pros`
3. Copiar el contenido de `supabase/functions/notify-pros/index.ts`
4. Guardar y desplegar

### **PASO 3: Configurar Variables de Entorno en Supabase**

En Supabase Dashboard > Settings > Database > Custom Config, agregar:

```sql
-- Configurar URL de Supabase
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';

-- Configurar Service Role Key (solo lectura, no exponer en frontend)
ALTER DATABASE postgres SET app.settings.supabase_service_key = 'YOUR_SERVICE_ROLE_KEY';
```

**⚠️ IMPORTANTE**: Reemplazar `YOUR_PROJECT_REF` y `YOUR_SERVICE_ROLE_KEY` con tus valores reales.

### **PASO 4: Habilitar Extensión pg_net (Opcional pero Recomendado)**

```sql
-- En Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_net;
```

Si `pg_net` no está disponible, usar la versión alternativa del trigger (ver abajo).

### **PASO 5: Ejecutar Migración SQL**

```sql
-- Ejecutar en Supabase SQL Editor
-- Copiar y pegar el contenido de: supabase/migrations/create-trigger-notify-pros.sql
```

O desde CLI:
```bash
supabase db push
```

### **PASO 6: Verificar Instalación**

1. **Verificar Trigger**:
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_pros_on_new_lead';
```

2. **Probar Edge Function**:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-pros \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-lead-id",
    "disciplina_ia": "Electricidad",
    "servicio_solicitado": "Instalación eléctrica",
    "ubicacion_lat": 19.4326,
    "ubicacion_lng": -99.1332,
    "ubicacion_direccion": "CDMX, México",
    "nombre_cliente": "Cliente Test",
    "descripcion_proyecto": "Test de notificación"
  }'
```

---

## 🔧 Configuración Alternativa (Sin pg_net)

Si `pg_net` no está disponible, usar esta versión del trigger que llama directamente a la Edge Function:

```sql
-- Versión alternativa usando http extension
CREATE OR REPLACE FUNCTION notify_professionals_on_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-pros';
  payload JSONB;
BEGIN
  payload := jsonb_build_object(
    'id', NEW.id,
    'disciplina_ia', NEW.disciplina_ia,
    'servicio', NEW.servicio,
    'servicio_solicitado', NEW.servicio_solicitado,
    'ubicacion_lat', NEW.ubicacion_lat,
    'ubicacion_lng', NEW.ubicacion_lng,
    'ubicacion_direccion', NEW.ubicacion_direccion,
    'nombre_cliente', NEW.nombre_cliente,
    'descripcion_proyecto', NEW.descripcion_proyecto,
    'priority_boost', COALESCE(NEW.priority_boost, false)
  );
  
  -- Llamar usando pg_http (si está disponible)
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key', true)
    ),
    body := payload::text
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error notificando profesionales: %', SQLERRM;
  RETURN NEW;
END;
$$;
```

---

## 📋 Checklist de Verificación

- [ ] Resend API Key configurada en Supabase
- [ ] Edge Function `notify-pros` desplegada
- [ ] Variables de entorno configuradas (supabase_url, supabase_service_key)
- [ ] Extensión `pg_net` habilitada (o versión alternativa)
- [ ] Trigger SQL ejecutado correctamente
- [ ] Componente `RealtimeLeadNotifier` integrado en dashboard
- [ ] Prueba de creación de lead genera notificación
- [ ] Emails se envían correctamente

---

## 🐛 Troubleshooting

### **Problema: No se envían emails**
- Verificar que `RESEND_API_KEY` esté configurada
- Revisar logs de Edge Function en Supabase Dashboard
- Verificar que el dominio esté verificado en Resend

### **Problema: Trigger no se activa**
- Verificar que el trigger esté creado: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'trigger_notify_pros_on_new_lead';`
- Verificar que el lead tenga `estado = 'nuevo'` o `estado IS NULL`

### **Problema: Edge Function no recibe datos**
- Verificar que `supabase_url` y `supabase_service_key` estén configuradas
- Revisar logs de la función en Supabase Dashboard
- Verificar que el payload JSON sea válido

### **Problema: Badge de notificación no aparece**
- Verificar que el profesional esté online (`isOnline = true`)
- Verificar que el lead coincida con el perfil del profesional
- Revisar consola del navegador para errores

---

## 📊 Flujo Completo

```
1. Cliente crea lead
   ↓
2. INSERT en tabla leads
   ↓
3. Trigger se activa (AFTER INSERT)
   ↓
4. Trigger llama a Edge Function notify-pros
   ↓
5. Edge Function busca profesionales relevantes
   ↓
6. Edge Function envía emails via Resend
   ↓
7. Frontend: RealtimeLeadNotifier detecta cambio
   ↓
8. Badge aparece + Sonido + Vibración
   ↓
9. Profesional ve notificación y puede aceptar lead
```

---

## 🎯 Próximos Pasos (Opcional)

1. **Notificaciones Push**: Integrar Firebase Cloud Messaging
2. **SMS Fallback**: Agregar Twilio para SMS si email falla
3. **Rate Limiting**: Limitar número de emails por profesional
4. **Preferencias de Notificación**: Permitir a profesionales configurar cómo recibir notificaciones
5. **Analytics**: Trackear tasa de apertura de emails y aceptación de leads

---

## 📝 Notas Importantes

- El sistema usa **doble canal**: Realtime (WebSocket) + Email (Resend)
- Si Realtime falla, el email actúa como fallback
- El trigger **no bloquea** la inserción del lead si falla la notificación
- Los emails se envían **asíncronamente** para no afectar performance
- El componente `RealtimeLeadNotifier` se integra automáticamente en el dashboard

---

**✅ Implementación completada. Sistema de notificaciones dual (Realtime + Email) listo para producción.**

