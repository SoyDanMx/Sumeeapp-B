# 🧪 Guía para Probar la IA de Gemini en el Cliente Dashboard

## ✅ Prerequisitos Verificados

- ✅ Edge Function `classify-service` desplegada en Supabase
- ✅ Secret `GEMINI_API_KEY` configurado
- ✅ Base de datos actualizada con columnas de IA
- ✅ Función `create_lead` actualizada
- ✅ Frontend desplegado en Vercel

---

## 🎯 Pasos para Ver la IA en Acción

### **Paso 1: Acceder al Dashboard de Cliente**

1. Ve a tu sitio: `https://sumeeapp.com/dashboard/client`
2. Asegúrate de estar **logueado como cliente** (no como profesional)

---

### **Paso 2: Abrir el Modal de Solicitud de Servicio**

Tienes 3 formas de abrirlo:

**Opción A - Botones de Emergencia:**
- Haz clic en **"Urgencia Eléctrica"** o **"Urgencia de Plomería"**
- Estos botones pre-llenan el servicio, pero **NO activan la IA** (porque ya sabes el servicio)

**Opción B - Botón General:**
- Haz clic en **"Solicitar servicio"** (botón principal en el header)
- Este SÍ activa la IA porque empieza sin servicio pre-seleccionado

**Opción C - Estado Vacío:**
- Si no tienes solicitudes, haz clic en **"Solicitar servicio"** del mensaje de bienvenida

---

### **Paso 3: Ir al Paso de Descripción**

1. **Si abriste el modal sin servicio pre-seleccionado:**
   - Selecciona cualquier servicio en el Paso 1 (o déjalo vacío)
   - Haz clic en **"Siguiente"** para ir al Paso 2

2. **Si usaste un botón de emergencia:**
   - Ya estarás en el Paso 2 automáticamente

---

### **Paso 4: Escribir la Descripción (¡AQUÍ ACTIVAS LA IA!)**

En el campo **"Describe el problema"**, escribe una descripción con:

✅ **Mínimo 15 caracteres**  
✅ **Espera 1 segundo sin escribir**

#### 📝 Ejemplos de Descripciones para Probar:

**Para Electricidad:**
```
Se cayó el breaker y no hay luz en toda la casa
```

**Para Plomería:**
```
Hay una fuga de agua debajo del fregadero de la cocina
```

**Para HVAC:**
```
El aire acondicionado no enfría y hace ruido raro
```

**Para Carpintería:**
```
Necesito instalar una puerta nueva en mi habitación
```

---

### **Paso 5: Ver la Sugerencia de IA** 

Después de **1 segundo de inactividad**, deberías ver aparecer:

🔵 **Indicador "Analizando con IA..."** (mientras carga)

✅ **Chip de "Sugerencia automática"** con:
- 💡 **Disciplina:** Electricidad / Plomería / HVAC / etc.
- ⚡ **Urgencia:** Número del 1-10
- 🩺 **Diagnóstico:** Breve descripción del problema

**Ejemplo de lo que verás:**

```
┌─────────────────────────────────────────┐
│ SUGERENCIA AUTOMÁTICA                   │
│                                         │
│ 💡 Electricidad    ⚡ Urgencia 9/10    │
│                                         │
│ Diagnóstico sugerido:                   │
│ Cortocircuito en interruptor            │
│                                         │
│ Aplicamos automáticamente esta          │
│ disciplina sugerida. Puedes ajustarla  │
│ en el Paso 1 si prefieres otra opción. │
└─────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### ❌ "No veo el chip de IA"

**Verifica:**

1. **¿Escribiste más de 15 caracteres?**
   - Cuenta: "Se cayó el breaker" = 18 caracteres ✅

2. **¿Esperaste 1 segundo sin escribir?**
   - El debounce espera que dejes de escribir

3. **¿Estás en el Paso 2?**
   - La IA solo se activa en el paso de "Describe el problema"

4. **¿Abriste la consola del navegador?**
   - Presiona `F12` → Tab "Console"
   - Busca mensajes de error como:
     - `❌ Error clasificando descripción`
     - `GEMINI_API_KEY no está configurada`

---

### ❌ "Veo 'Analizando con IA...' pero nunca termina"

**Posibles causas:**

1. **La Edge Function no responde:**
   - Verifica en Supabase Dashboard:
     - Ve a **Edge Functions** → **classify-service** → **Logs**
   - Busca errores como:
     - `GEMINI_API_KEY no está configurada`
     - `Error en Gemini API: 403` (API key inválida)
     - `Error en Gemini API: 429` (límite de rate excedido)

2. **CORS bloqueado:**
   - En la consola del navegador verifica si hay errores CORS
   - La Edge Function ya tiene CORS habilitado, pero verifica

3. **Timeout de red:**
   - Gemini puede tardar 2-5 segundos en responder
   - Si tarda más de 10 segundos, hay un problema

---

### ❌ "La IA devuelve una disciplina incorrecta"

**Esto es normal:**
- Gemini tiene un `temperature: 0.2` (bastante consistente)
- Pero puede confundirse con descripciones ambiguas
- **Solución:** El usuario puede cambiar manualmente el servicio en el Paso 1

**Ejemplo de ambigüedad:**
- "Hay agua en el techo" → ¿Plomería (fuga) o HVAC (condensación)?

---

## 🧪 Prueba Completa (Flujo End-to-End)

1. ✅ Abre el dashboard del cliente
2. ✅ Haz clic en **"Solicitar servicio"**
3. ✅ **NO** selecciones un servicio en el Paso 1
4. ✅ Haz clic en **"Siguiente"**
5. ✅ Escribe: `"Se cayó el breaker y no hay luz en toda la casa"`
6. ✅ **Espera 2 segundos**
7. ✅ Deberías ver:
   ```
   Sugerencia automática
   💡 Electricidad    ⚡ Urgencia 9/10
   Diagnóstico: Falla en interruptor termomagnético
   ```
8. ✅ Continúa con el formulario normalmente
9. ✅ En el Paso 4 (Resumen), verifica que muestre:
   - **Disciplina IA:** Electricidad
   - **Urgencia IA:** 9/10
   - **Diagnóstico IA:** Falla en interruptor termomagnético

---

## 📊 Verificar que se Guardó en la BD

Después de crear el lead, verifica en Supabase:

```sql
SELECT 
  id,
  descripcion_proyecto,
  servicio_solicitado,
  disciplina_ia,
  urgencia_ia,
  diagnostico_ia,
  created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**
| id | descripcion_proyecto | servicio_solicitado | disciplina_ia | urgencia_ia | diagnostico_ia |
|----|---------------------|-------------------|--------------|------------|----------------|
| uuid | Se cayó el breaker... | electricidad | Electricidad | 9 | Falla en interruptor... |

---

## 🎥 Video Tutorial (Opcional)

Si necesitas un video paso a paso, puedo crear una secuencia de screenshots con anotaciones.

---

## 🆘 Si Nada Funciona

Ejecuta este comando en la consola del navegador (F12 → Console):

```javascript
// Test directo de la Edge Function
fetch('https://jkdvrwmanmwoyyoixmnt.supabase.co/functions/v1/classify-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
  },
  body: JSON.stringify({
    description: 'Se cayó el breaker y no hay luz en toda la casa'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Respuesta de IA:', data))
.catch(err => console.error('❌ Error:', err));
```

Reemplaza `YOUR_ANON_KEY_HERE` con tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Si este test funciona pero el UI no, el problema es en el frontend. Si falla, el problema es en la Edge Function.

---

## 📝 Notas Importantes

- ⏱️ **Debounce:** La IA espera 1 segundo de inactividad antes de analizar
- 📏 **Mínimo 15 caracteres:** Descripciones muy cortas no activan la IA
- 🔄 **No bloquea el flujo:** Si la IA falla, el usuario puede continuar normalmente
- ✏️ **Editable:** El usuario puede cambiar la disciplina sugerida en el Paso 1
- 💾 **Se guarda siempre:** Aunque el usuario cambie el servicio, la sugerencia de IA se guarda en la BD

