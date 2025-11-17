# 🗺️ Guía de Implementación: Geocodificación Inversa y Enriquecimiento de Datos Geográficos

## 📋 Resumen

Este documento describe la implementación del sistema de geocodificación inversa para enriquecer automáticamente los datos geográficos de los perfiles de usuario (ciudad, sub_city_zone, postal_code) a partir de coordenadas GPS.

---

## 🗄️ Tarea 1: Estructura de Base de Datos

### Script SQL: `supabase/migrations/add-geographic-columns.sql`

Este script agrega las columnas necesarias a la tabla `profiles`:

- **`sub_city_zone`** (TEXT): Delegación, alcaldía o zona específica (ej: 'Coyoacán', 'Benito Juárez')
- **`postal_code`** (TEXT): Código postal del usuario
- **Índices**: Para mejorar las consultas geográficas
- **CHECK CONSTRAINT**: Valida que las coordenadas estén en rangos válidos

### Pasos de Ejecución:

1. Abre el SQL Editor en Supabase Dashboard
2. Copia y pega el contenido de `supabase/migrations/add-geographic-columns.sql`
3. Ejecuta el script
4. Verifica que las columnas se crearon correctamente

---

## 🗺️ Tarea 2: Edge Function de Geocodificación Inversa

### Archivo: `supabase/functions/reverse-geocode/index.ts`

La Edge Function realiza:

1. **Recibe**: `user_id`, `lat`, `lng` en el body de la petición POST
2. **Llama a Google Maps Geocoding API** (o OpenStreetMap como fallback)
3. **Extrae y normaliza**:
   - `city`: Ciudad principal
   - `sub_city_zone`: Delegación/alcaldía (ej: Coyoacán, Benito Juárez)
   - `postal_code`: Código postal
4. **Actualiza** la tabla `profiles` con los datos enriquecidos

### Configuración Requerida:

#### Variables de Entorno en Supabase Edge Functions:

1. Ve a **Supabase Dashboard → Edge Functions → Settings → Secrets**
2. Agrega las siguientes variables:
   - `GOOGLE_MAPS_API_KEY`: Tu API key de Google Maps (opcional, usa OpenStreetMap si no está configurada)
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key de tu proyecto

#### Despliegue de la Edge Function:

```bash
# Desde la raíz del proyecto
supabase functions deploy reverse-geocode
```

O desde el Supabase Dashboard:
1. Ve a **Edge Functions → Create Function**
2. Nombre: `reverse-geocode`
3. Copia el contenido de `supabase/functions/reverse-geocode/index.ts`
4. Guarda y despliega

---

## ⚡ Tarea 3: Integración en Frontend

### Componentes Modificados:

1. **`LocationBlockingModal.tsx`**: Modal de bloqueo de onboarding
2. **`ClientOnboardingModal.tsx`**: Modal de onboarding de WhatsApp
3. **`UpdateProfileModal.tsx`**: Modal de actualización de perfil

### Flujo Implementado:

1. Usuario guarda coordenadas (`ubicacion_lat`, `ubicacion_lng`) en Supabase
2. **Inmediatamente después** (sin bloquear al usuario), se llama a la Edge Function `reverse-geocode`
3. La Edge Function enriquece los datos en background
4. El modal se cierra sin esperar la respuesta de la Edge Function

### Código de Integración:

```typescript
// Después de guardar coordenadas exitosamente
if (ubicacion_lat && ubicacion_lng) {
  callReverseGeocode(userProfile.user_id, ubicacion_lat, ubicacion_lng)
    .catch((err) => {
      console.error("⚠️ Error al enriquecer datos geográficos (no crítico):", err);
      // No mostrar error al usuario, es un proceso de background
    });
}
```

---

## ✅ Verificación

### 1. Verificar Columnas en Base de Datos:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('sub_city_zone', 'postal_code')
ORDER BY column_name;
```

### 2. Verificar Edge Function:

```bash
# Probar la Edge Function localmente
curl -X POST http://localhost:54321/functions/v1/reverse-geocode \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID_AQUI",
    "lat": 19.4326,
    "lng": -99.1332
  }'
```

### 3. Verificar Integración Frontend:

1. Abre el dashboard del cliente
2. Si no tienes ubicación, se abrirá el modal de bloqueo
3. Guarda tu ubicación usando GPS o dirección manual
4. Revisa la consola del navegador para ver los logs:
   - `✅ Ubicación guardada exitosamente`
   - `🗺️ Llamando a Edge Function reverse-geocode...`
   - `✅ reverse-geocode completado:`

### 4. Verificar Datos Enriquecidos:

```sql
SELECT 
  user_id,
  full_name,
  city,
  sub_city_zone,
  postal_code,
  ubicacion_lat,
  ubicacion_lng
FROM public.profiles
WHERE ubicacion_lat IS NOT NULL
  AND ubicacion_lng IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 📝 Archivos Modificados

### Base de Datos:
- ✅ `supabase/migrations/add-geographic-columns.sql` (NUEVO)

### Edge Functions:
- ✅ `supabase/functions/reverse-geocode/index.ts` (NUEVO)
- ✅ `supabase/functions/reverse-geocode/deno.json` (NUEVO)

### Frontend:
- ✅ `src/components/dashboard/LocationBlockingModal.tsx`
- ✅ `src/components/dashboard/ClientOnboardingModal.tsx`
- ✅ `src/components/dashboard/UpdateProfileModal.tsx`
- ✅ `src/types/supabase.ts`

### Documentación:
- ✅ `GUIA_IMPLEMENTACION_GEOCODIFICACION_INVERSA.md` (ESTE ARCHIVO)

---

## 🔧 Configuración de Variables de Entorno

### En Supabase Edge Functions Secrets:

1. `GOOGLE_MAPS_API_KEY`: (Opcional) API key de Google Maps
   - Si no está configurada, se usa OpenStreetMap Nominatim (gratuito)
   - Para obtener una: https://console.cloud.google.com/apis/credentials

2. `SUPABASE_URL`: URL de tu proyecto Supabase
   - Formato: `https://YOUR_PROJECT_REF.supabase.co`

3. `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key
   - Encuéntrala en: Supabase Dashboard → Settings → API → service_role key

---

## 🎯 Flujo Completo

```
Usuario guarda ubicación
    ↓
Frontend actualiza ubicacion_lat/lng en Supabase
    ↓
Frontend llama a Edge Function reverse-geocode (asíncrono)
    ↓
Edge Function llama a Google Maps/OpenStreetMap API
    ↓
Edge Function extrae: city, sub_city_zone, postal_code
    ↓
Edge Function actualiza perfil en Supabase
    ↓
Datos geográficos enriquecidos disponibles para matching
```

---

## ⚠️ Notas Importantes

1. **Proceso Asíncrono**: La Edge Function se ejecuta en background y no bloquea al usuario
2. **Fallback**: Si Google Maps API no está configurada, se usa OpenStreetMap (gratuito pero menos preciso)
3. **Normalización**: Los nombres de ciudades y zonas se normalizan para consistencia
4. **CDMX Especial**: Se detectan automáticamente las 16 alcaldías de CDMX
5. **No Crítico**: Si la Edge Function falla, no afecta la experiencia del usuario (solo se loguea el error)

---

## 🚀 Próximos Pasos

1. Ejecutar el script SQL en Supabase
2. Desplegar la Edge Function `reverse-geocode`
3. Configurar las variables de entorno en Supabase
4. Probar el flujo completo desde el frontend
5. Verificar que los datos se enriquecen correctamente

