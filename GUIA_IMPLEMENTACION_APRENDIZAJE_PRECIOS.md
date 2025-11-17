# ✅ GUÍA: Implementación de Aprendizaje de Precios Históricos

## 📋 **RESUMEN**

Se ha implementado exitosamente el sistema de aprendizaje de precios históricos que mejora continuamente la precisión de las predicciones de IA mediante datos reales de la plataforma SumeeApp.

---

## 🗄️ **FASE 1: BASE DE DATOS**

### **Scripts SQL a ejecutar:**

1. ✅ `supabase/migrations/create-pricing-model-data-table.sql` - Crear tabla
2. ✅ `supabase/migrations/create-calculate-avg-prices-function.sql` - Crear función RPC
3. ✅ `supabase/migrations/ejecutar-calculo-inicial-precios.sql` - Cálculo inicial

### **Tabla creada: `pricing_model_data`**

**Columnas:**
- `id` (SERIAL PRIMARY KEY)
- `disciplina_ia` (TEXT) - Disciplina del servicio
- `work_zone` (TEXT, nullable) - Zona geográfica (ciudad) o NULL para global
- `avg_price` (DECIMAL) - Precio promedio histórico
- `median_price` (DECIMAL) - Precio mediano (más robusto)
- `std_dev` (DECIMAL) - Desviación estándar
- `min_price` (DECIMAL) - Precio mínimo histórico
- `max_price` (DECIMAL) - Precio máximo histórico
- `sample_size` (INTEGER) - Número de muestras
- `confidence_score` (DECIMAL) - Confianza del modelo (0-1)
- `last_calculated_at` (TIMESTAMP) - Última actualización
- `version` (INTEGER) - Versión del modelo

**Índices creados:**
- `idx_pricing_disciplina_zone` - Búsqueda por disciplina y zona
- `idx_pricing_disciplina_global` - Búsqueda global por disciplina
- `idx_pricing_last_calculated` - Ordenar por actualización

---

## 📈 **FASE 2: FUNCIÓN RPC**

### **Función creada: `calculate_avg_prices()`**

**Parámetros:**
- `min_samples` (INTEGER, default: 5) - Mínimo de muestras para confianza
- `use_work_zone` (BOOLEAN, default: true) - Agrupar por zona o solo disciplina

**Funcionalidad:**
1. ✅ Filtra leads con `negotiation_status = 'acuerdo_confirmado'` y `estado = 'completado'`
2. ✅ Valida que `agreed_price` esté en rango razonable ($100-$1M)
3. ✅ Agrupa por `disciplina_ia` y `work_zone` (city del cliente)
4. ✅ Calcula estadísticas: promedio, mediana, std_dev, min, max
5. ✅ Requiere mínimo de muestras (default: 5) para tener confianza
6. ✅ Calcula tanto datos por zona como globales (fallback)
7. ✅ Usa `ON CONFLICT` para actualizar registros existentes
8. ✅ Calcula `confidence_score` basado en `sample_size`

**Ejecución:**
```sql
-- Ejecutar cálculo
SELECT * FROM public.calculate_avg_prices(5, true);

-- Ver resultados
SELECT * FROM public.pricing_model_data ORDER BY disciplina_ia;
```

---

## 🧠 **FASE 3: INTEGRACIÓN EN EDGE FUNCTION**

### **Archivo modificado:**
- `supabase/functions/classify-service/index.ts`

### **Cambios implementados:**

1. ✅ **Import de Supabase Client:**
   ```typescript
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
   ```

2. ✅ **Consulta de datos históricos:**
   - Antes de llamar a Gemini, consulta `pricing_model_data`
   - Busca primero por disciplina + zona
   - Fallback a datos globales (sin zona) si no encuentra
   - Solo usa datos con `sample_size >= 5` (confianza mínima)

3. ✅ **Inyección en prompt:**
   - Función `getPriceEstimationPrompt()` actualizada
   - Incluye contexto histórico detallado si está disponible
   - Muestra: promedio, mediana, std_dev, rango, confianza
   - Instruye a Gemini para alinear sugerencia con histórico

4. ✅ **Validación cruzada:**
   - Si precio sugerido está muy fuera del rango histórico, ajusta
   - Usa datos históricos como fallback si IA no sugiere precio
   - Logs informativos para debugging

### **Ejemplo de prompt con histórico:**
```
📊 CONTEXTO HISTÓRICO DE SUMEEAPP (DATOS REALES DE LA PLATAFORMA)
Basado en 25 trabajos completados en SumeeApp:
- Precio promedio histórico: $1,200.00 MXN
- Precio mediano histórico: $1,150.00 MXN
- Desviación estándar: $300.00 MXN
- Rango histórico: $800.00 - $2,000.00 MXN
- Confianza del modelo: 50%

INSTRUCCIONES CRÍTICAS:
1. Tu rango sugerido DEBE estar alineado con estos datos históricos reales.
2. El precio mínimo sugerido debe estar cerca de: $600.00 MXN
3. El precio máximo sugerido debe estar cerca de: $1,800.00 MXN
...
```

---

## 🔄 **FLUJO COMPLETO**

### **1. Cálculo de estadísticas (periódico):**
```
Cron Job (diario/semanal) → 
  calculate_avg_prices() →
  Consulta leads completados →
  Calcula estadísticas →
  Actualiza pricing_model_data
```

### **2. Clasificación con histórico:**
```
Cliente crea lead → 
  classify-service consulta pricing_model_data →
  Obtiene datos históricos (si existen) →
  Inyecta contexto histórico en prompt →
  Gemini sugiere precio (más preciso) →
  Validación cruzada con histórico →
  Guarda ai_suggested_price_min/max
```

### **3. Aprendizaje continuo:**
```
Lead completado →
  calculate_avg_prices() recalcula →
  Actualiza pricing_model_data →
  Próxima predicción usa datos actualizados →
  Mejora continua de precisión
```

---

## ✅ **VERIFICACIÓN**

### **Checklist de pruebas:**

1. **Base de datos:**
   - [ ] Ejecutar script de creación de tabla
   - [ ] Ejecutar script de función RPC
   - [ ] Verificar que tabla y función fueron creadas

2. **Cálculo inicial:**
   - [ ] Ejecutar `ejecutar-calculo-inicial-precios.sql`
   - [ ] Verificar que se calcularon estadísticas
   - [ ] Verificar que hay datos por disciplina (y zona si aplica)

3. **Edge Function:**
   - [ ] Desplegar `classify-service` actualizada
   - [ ] Verificar que consulta datos históricos
   - [ ] Verificar que inyecta contexto en prompt
   - [ ] Probar con diferentes disciplinas

4. **Validación:**
   - [ ] Verificar que predicciones mejoran con histórico
   - [ ] Verificar fallback cuando no hay datos históricos
   - [ ] Verificar ajuste cuando precio está fuera de rango

---

## 🚀 **DESPLEGAR EDGE FUNCTION**

### **Opción 1: Supabase CLI**
```bash
supabase functions deploy classify-service
```

### **Opción 2: Supabase Dashboard**
1. Ve a **Edge Functions** → **classify-service**
2. Copia el contenido de `supabase/functions/classify-service/index.ts`
3. Pega en el editor
4. Haz clic en **"Deploy"**

### **Verificar variables de entorno:**
- `GEMINI_API_KEY` - Ya configurada
- `SUPABASE_URL` - Se obtiene automáticamente en Edge Functions
- `SUPABASE_SERVICE_ROLE_KEY` - Se obtiene automáticamente en Edge Functions

---

## ⏰ **CONFIGURAR CRON JOB**

### **Opción 1: Supabase Cron (Recomendado)**

1. Ve a **Supabase Dashboard** → **Database** → **Cron Jobs**
2. Crea nuevo cron job:
   - **Name:** `calculate_pricing_stats`
   - **Schedule:** `0 2 * * *` (diario a las 2 AM)
   - **SQL:**
   ```sql
   SELECT * FROM public.calculate_avg_prices(5, true);
   ```

### **Opción 2: pg_cron Extension**

```sql
-- Habilitar extensión (requiere permisos de superusuario)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear cron job
SELECT cron.schedule(
    'calculate-pricing-stats',  -- Nombre del job
    '0 2 * * *',                -- Diario a las 2 AM
    $$SELECT * FROM public.calculate_avg_prices(5, true);$$
);
```

### **Opción 3: Trigger Incremental (Alternativa)**

Crear trigger que actualice automáticamente cuando se completa un lead:

```sql
CREATE OR REPLACE FUNCTION update_pricing_on_lead_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar solo la disciplina/zona del lead completado
    -- (más eficiente que recalcular todo)
    IF NEW.estado = 'completado' AND NEW.negotiation_status = 'acuerdo_confirmado' THEN
        -- Llamar a función de actualización incremental
        PERFORM public.calculate_avg_prices(5, true);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pricing_on_completion
    AFTER UPDATE ON public.leads
    FOR EACH ROW
    WHEN (NEW.estado = 'completado' AND NEW.negotiation_status = 'acuerdo_confirmado')
    EXECUTE FUNCTION update_pricing_on_lead_completion();
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Cold Start:**
   - Al inicio no habrá datos históricos
   - El sistema funciona sin histórico (usa precios de mercado generales)
   - Una vez que hay 5+ leads completados, empieza a usar histórico

2. **Mínimo de muestras:**
   - Requiere mínimo 5 leads por disciplina/zona
   - Si hay menos, no se crea registro (evita estadísticas poco confiables)
   - Usa datos globales (sin zona) como fallback

3. **Confianza del modelo:**
   - `confidence_score` se calcula: `min(1.0, sample_size / 50)`
   - 50+ muestras = confianza máxima (1.0)
   - 5 muestras = confianza mínima (0.1)

4. **Zona geográfica:**
   - Usa `city` del perfil del cliente como `work_zone`
   - Si no hay `city`, usa datos globales (sin zona)
   - Permite múltiples niveles (ciudad, delegación, CP) en el futuro

5. **Rendimiento:**
   - Consulta histórica es rápida (índices optimizados)
   - Cacheable en Edge Function si es necesario
   - No bloquea tiempo real

---

## 🐛 **TROUBLESHOOTING**

### **Problema: No hay datos históricos**
- **Causa:** No hay suficientes leads completados (mínimo 5)
- **Solución:** El sistema funciona sin histórico, usa precios de mercado generales
- **Solución:** Ejecutar `calculate_avg_prices()` manualmente cuando haya datos

### **Problema: Función RPC no encuentra datos**
- **Causa:** Filtros muy estrictos o datos no cumplen criterios
- **Solución:** Verificar que hay leads con `negotiation_status = 'acuerdo_confirmado'` y `estado = 'completado'`
- **Solución:** Reducir `min_samples` temporalmente para testing

### **Problema: Edge Function no consulta histórico**
- **Causa:** Variables de entorno no configuradas
- **Solución:** Verificar que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están disponibles
- **Solución:** Revisar logs de Edge Function en Supabase Dashboard

### **Problema: Precios sugeridos no mejoran**
- **Causa:** Datos históricos no se están usando correctamente
- **Solución:** Verificar que prompt incluye contexto histórico
- **Solución:** Revisar logs para ver si Gemini recibe el contexto

---

## 🎯 **PRÓXIMOS PASOS (Futuro)**

1. **Aprendizaje por temporada:**
   - Agregar columna `season` o `month`
   - Ajustar precios según temporada

2. **Aprendizaje por urgencia:**
   - Separar precios urgentes vs normales
   - Agregar `avg_price_urgent` y `avg_price_normal`

3. **Aprendizaje por tier:**
   - Agregar `pro_tier` a la agrupación
   - Precios pueden variar según calidad del profesional

4. **Dashboard de métricas:**
   - Mostrar precisión del modelo
   - Mostrar evolución de precios
   - Alertas si precios cambian significativamente

5. **A/B Testing:**
   - Comparar predicciones con/sin histórico
   - Medir impacto en precisión

---

**Fecha de implementación:** 2024
**Estado:** ✅ COMPLETADO

