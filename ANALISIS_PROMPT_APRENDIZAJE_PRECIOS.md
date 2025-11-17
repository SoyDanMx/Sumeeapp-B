# 📊 ANÁLISIS: Prompt "Aprendizaje de Precios Históricos"

## ✅ **IDEAS BENEFICIOSAS PARA EL PROYECTO**

### 🎯 **1. Tarea 1: Tabla de Conocimiento Histórico** ⭐⭐⭐⭐⭐

**✅ MUY BENEFICIOSO**

**Tabla propuesta:**
- `pricing_model_data` - ✅ **EXCELENTE** para desacoplar cálculo pesado
- Columnas: `disciplina_ia`, `work_zone`, `avg_price`, `std_dev`, `last_calculated_at`

**Mejoras sugeridas:**

1. **Agregar más columnas útiles:**
   ```sql
   sample_size INTEGER,  -- Número de leads usados para el cálculo
   min_price DECIMAL,     -- Precio mínimo histórico
   max_price DECIMAL,     -- Precio máximo histórico
   median_price DECIMAL,  -- Mediana (más robusta que promedio)
   confidence_score DECIMAL(3,2)  -- Confianza del modelo (0-1)
   ```

2. **Índices para optimización:**
   ```sql
   CREATE INDEX idx_pricing_disciplina_zone 
     ON pricing_model_data(disciplina_ia, work_zone);
   ```

3. **Considerar particionamiento:**
   - Si hay muchos datos, particionar por `disciplina_ia` o fecha

4. **Agregar metadata:**
   ```sql
   created_at TIMESTAMP,
   updated_at TIMESTAMP,
   version INTEGER  -- Para tracking de versiones del modelo
   ```

**Justificación:** Base sólida para ML, desacopla cálculo pesado de tiempo real.

---

### 🎯 **2. Tarea 2: Función RPC de Agregación** ⭐⭐⭐⭐⭐

**✅ MUY BENEFICIOSO con mejoras**

**Puntos fuertes:**
- ✅ Calcula estadísticas históricas
- ✅ Agrupa por disciplina y zona
- ✅ Actualiza tabla de conocimiento

**Mejoras sugeridas:**

1. **Criterios de inclusión más estrictos:**
   ```sql
   -- Solo leads con acuerdo confirmado Y trabajo completado
   WHERE negotiation_status = 'acuerdo_confirmado'
     AND estado = 'completado'
     AND agreed_price IS NOT NULL
     AND agreed_price > 0
     AND agreed_price BETWEEN 100 AND 1000000  -- Validar rango razonable
   ```

2. **Mínimo de muestras:**
   - Requerir mínimo 5-10 leads por disciplina/zona para tener confianza
   - Si hay menos muestras, usar datos globales o disciplina sin zona

3. **Cálculo de mediana (más robusta):**
   - La mediana es menos sensible a outliers que el promedio
   - Agregar cálculo de percentiles (25, 50, 75)

4. **Manejo de zonas:**
   - Si no hay suficientes datos por zona, usar solo disciplina
   - Fallback a datos globales si no hay suficientes muestras

5. **Función incremental:**
   - En lugar de recalcular todo, actualizar solo zonas/disciplinas con nuevos datos
   - Usar `ON CONFLICT` para actualizar existentes

**Ejemplo de función mejorada:**
```sql
CREATE OR REPLACE FUNCTION calculate_avg_prices()
RETURNS TABLE(
  disciplina_ia TEXT,
  work_zone TEXT,
  avg_price DECIMAL,
  median_price DECIMAL,
  std_dev DECIMAL,
  min_price DECIMAL,
  max_price DECIMAL,
  sample_size INTEGER
) AS $$
BEGIN
  -- Calcular estadísticas por disciplina y zona
  -- Con mínimo de 5 muestras
  -- Incluir mediana y percentiles
END;
$$ LANGUAGE plpgsql;
```

---

### 🎯 **3. Tarea 3: Inyección de Feedback en Gemini** ⭐⭐⭐⭐⭐

**✅ MUY BENEFICIOSO**

**Puntos fuertes:**
- ✅ Cierra el loop de aprendizaje
- ✅ Mejora precisión de predicciones
- ✅ Refleja economía real de la plataforma

**Mejoras sugeridas:**

1. **Consulta eficiente:**
   ```typescript
   // Consultar pricing_model_data antes de llamar a Gemini
   const { data: historicalData } = await supabase
     .from("pricing_model_data")
     .select("*")
     .eq("disciplina_ia", disciplina)
     .eq("work_zone", workZone || "general")
     .single();
   
   // Fallback si no hay datos específicos
   if (!historicalData) {
     // Consultar solo por disciplina
     const { data: disciplineData } = await supabase
       .from("pricing_model_data")
       .select("*")
       .eq("disciplina_ia", disciplina)
       .is("work_zone", null)
       .single();
   }
   ```

2. **Prompt mejorado con contexto histórico:**
   ```typescript
   const historicalContext = historicalData 
     ? `CONTEXTO HISTÓRICO DE SUMEEAPP:
   - Precio promedio histórico: $${historicalData.avg_price} MXN
   - Desviación estándar: $${historicalData.std_dev} MXN
   - Rango histórico: $${historicalData.min_price} - $${historicalData.max_price} MXN
   - Muestras: ${historicalData.sample_size} trabajos completados
   - Última actualización: ${historicalData.last_calculated_at}
   
   IMPORTANTE: Ajusta tu sugerencia de precio para que esté alineada con estos datos históricos reales de SumeeApp. 
   El rango sugerido debe estar dentro de ±2 desviaciones estándar del promedio histórico.`
     : "";
   ```

3. **Validación cruzada:**
   - Si precio sugerido por IA está muy fuera del rango histórico, ajustar
   - Usar promedio histórico como fallback si IA no sugiere precio

4. **Tracking de precisión:**
   - Guardar si se usó contexto histórico
   - Comparar predicción vs precio final acordado
   - Calcular precisión del modelo

---

## ⚠️ **CONSIDERACIONES Y RIESGOS**

### 🔴 **Riesgos identificados:**

1. **Cold Start Problem:**
   - Al inicio no habrá datos históricos
   - **Solución:** Usar precios de mercado generales como fallback
   - **Solución:** Requerir mínimo de muestras antes de usar histórico

2. **Sesgo en datos históricos:**
   - Si históricamente hubo guerra de precios, el modelo aprenderá precios bajos
   - **Solución:** Filtrar outliers extremos
   - **Solución:** Ponderar datos recientes más que antiguos

3. **Zonas geográficas:**
   - ¿Cómo definir `work_zone`? ¿Código postal? ¿Delegación?
   - **Solución:** Usar `city` del perfil del cliente como zona inicial
   - **Solución:** Permitir múltiples niveles (ciudad, delegación, CP)

4. **Rendimiento:**
   - Consulta adicional en cada clasificación puede ralentizar
   - **Solución:** Cachear datos históricos en Edge Function
   - **Solución:** Usar índices optimizados

5. **Actualización del modelo:**
   - ¿Cuándo recalcular? ¿Diario? ¿Semanal?
   - **Solución:** Cron job diario o semanal
   - **Solución:** Trigger cuando se completa un trabajo (incremental)

---

## 🚀 **PLAN DE IMPLEMENTACIÓN SUGERIDO**

### **Fase 1: Tabla de Conocimiento (1-2 horas)**
1. ✅ Crear tabla `pricing_model_data` con columnas mejoradas
2. ✅ Agregar índices
3. ✅ Agregar constraints y validaciones

### **Fase 2: Función RPC de Agregación (2-3 horas)**
1. ✅ Crear función `calculate_avg_prices()`
2. ✅ Implementar lógica de agregación con filtros
3. ✅ Manejar casos edge (pocas muestras, sin zona, etc.)
4. ✅ Probar con datos reales

### **Fase 3: Integración en Edge Function (2-3 horas)**
1. ✅ Modificar `classify-service` para consultar histórico
2. ✅ Inyectar contexto histórico en prompt
3. ✅ Implementar fallbacks
4. ✅ Agregar logging para tracking

### **Fase 4: Cron Job / Trigger (1-2 horas)**
1. ✅ Configurar cron job para recalcular (Supabase Cron o pg_cron)
2. ✅ O crear trigger para actualización incremental
3. ✅ Probar actualización automática

### **Fase 5: Testing y Refinamiento (1-2 horas)**
1. ✅ Probar con diferentes escenarios
2. ✅ Validar que predicciones mejoran con histórico
3. ✅ Ajustar prompts según resultados

---

## 📋 **CHECKLIST DE VALIDACIÓN**

### **Antes de implementar:**
- [ ] Definir cómo se determina `work_zone` (ciudad, delegación, CP)
- [ ] Definir mínimo de muestras para tener confianza
- [ ] Definir frecuencia de recálculo (diario/semanal)
- [ ] Planificar estrategia de cold start

### **Después de implementar:**
- [ ] Verificar que tabla se crea correctamente
- [ ] Verificar que función RPC calcula correctamente
- [ ] Verificar que Edge Function consulta histórico
- [ ] Verificar que prompt incluye contexto histórico
- [ ] Validar que predicciones mejoran con tiempo

---

## 🎯 **RECOMENDACIÓN FINAL**

### ✅ **IMPLEMENTAR CON MEJORAS**

**Prioridad:** ALTA
**Esfuerzo:** 8-12 horas
**Valor:** MUY ALTO (mejora continua de precisión)

**Mejoras críticas a incluir:**
1. ✅ Agregar `sample_size`, `median_price`, `min_price`, `max_price`
2. ✅ Requerir mínimo de muestras antes de usar histórico
3. ✅ Manejar cold start con fallback a precios de mercado
4. ✅ Filtrar outliers y validar rango razonable
5. ✅ Cachear datos históricos en Edge Function
6. ✅ Implementar actualización incremental (más eficiente)

**Beneficios:**
- ✅ Mejora continua de precisión de precios
- ✅ Refleja economía real de SumeeApp
- ✅ Reduce dependencia de entrenamiento general de Gemini
- ✅ Aprendizaje adaptativo del mercado
- ✅ Base para ML más avanzado en el futuro

---

## 📝 **ARCHIVOS A CREAR/MODIFICAR**

### **Nuevos:**
1. `supabase/migrations/create-pricing-model-data-table.sql`
2. `supabase/migrations/create-calculate-avg-prices-function.sql`
3. `supabase/migrations/create-pricing-update-trigger.sql` (opcional, para incremental)

### **Modificar:**
1. `supabase/functions/classify-service/index.ts` - Consultar histórico e inyectar en prompt
2. `src/types/supabase.ts` - Agregar interface `PricingModelData` (opcional)

---

## 💡 **IDEAS ADICIONALES (Futuro)**

1. **Aprendizaje por temporada:**
   - Precios pueden variar por temporada (ej: más caro en invierno para HVAC)
   - Agregar columna `season` o `month`

2. **Aprendizaje por urgencia:**
   - Precios de urgencia vs no urgencia
   - Agregar `avg_price_urgent` y `avg_price_normal`

3. **Aprendizaje por tier de profesional:**
   - Precios pueden variar según tier
   - Agregar `pro_tier` a la agrupación

4. **Dashboard de métricas:**
   - Mostrar precisión del modelo
   - Mostrar evolución de precios por disciplina
   - Alertas si precios cambian significativamente

5. **A/B Testing:**
   - Comparar predicciones con/sin histórico
   - Medir impacto en precisión

---

## 🔗 **INTEGRACIÓN CON SISTEMA EXISTENTE**

### **Compatibilidad:**
- ✅ Ya tenemos `agreed_price` en `leads` (Tarea 1 completada)
- ✅ Ya tenemos `disciplina_ia` en `leads`
- ✅ Ya tenemos `negotiation_status = 'acuerdo_confirmado'`
- ✅ Ya tenemos Edge Function `classify-service` modificable

### **Flujo completo mejorado:**
```
Cliente crea lead → 
  classify-service consulta pricing_model_data →
  Inyecta contexto histórico en prompt →
  Gemini sugiere precio (más preciso) →
  Lead guardado con ai_suggested_price_min/max →
  Profesional confirma acuerdo →
  Lead completado →
  calculate_avg_prices() actualiza histórico →
  Próxima predicción usa datos actualizados
```

---

## ⚡ **VENTAJAS DEL SISTEMA**

1. **Aprendizaje continuo:**
   - El modelo mejora con cada trabajo completado
   - Se adapta a cambios en el mercado

2. **Precisión mejorada:**
   - Predicciones basadas en datos reales de SumeeApp
   - Menos dependencia de entrenamiento general de Gemini

3. **Escalabilidad:**
   - Cálculo desacoplado (no bloquea tiempo real)
   - Puede procesar grandes volúmenes de datos

4. **Transparencia:**
   - Clientes y profesionales ven precios basados en datos reales
   - Aumenta confianza en la plataforma

---

**Fecha de análisis:** 2024
**Estado:** ✅ APROBADO CON MEJORAS

