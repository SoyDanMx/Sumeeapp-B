# 🔍 Instrucciones de Debug: Prellenado Automático

## Problema
El prellenado del lead no está funcionando cuando el usuario hace clic en "Solicitar Ahora" desde proyectos populares.

## ✅ Solución Implementada

### 1. Logs de Debug Agregados
He agregado logs detallados en cada paso del proceso para identificar dónde se está deteniendo.

### 2. Mejoras en la Lógica
- ✅ Reset de refs cuando el modal se cierra
- ✅ Logs en cada paso del prellenado
- ✅ Manejo de errores mejorado
- ✅ Timeout aumentado a 1200ms para dar más tiempo

---

## 🔍 Cómo Verificar que Funciona

### Paso 1: Abrir Consola
1. Abre `http://localhost:3000` (o el puerto que estés usando)
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**

### Paso 2: Hacer Clic en "Solicitar Ahora"
1. Ve a la sección "Proyectos Populares" en la homepage
2. Haz clic en cualquier botón "Solicitar Ahora"
3. **Observa los logs en la consola**

### Paso 3: Verificar Logs Esperados

Deberías ver esta secuencia de logs:

```
🔍 Parámetros detectados: { service: "...", discipline: "..." }
✅ Modal abierto automáticamente con servicio pre-seleccionado
🎯 Modal abierto con servicio pre-seleccionado: { ... }
🔄 useEffect de prellenado ejecutado: { ... }
🔍 Buscando servicio en catálogo: { ... }
✅ Servicio encontrado en catálogo, prellenando descripción: ...
📱 WhatsApp pre-llenado desde perfil: ...
📍 Ubicación pre-llenada desde perfil: ...
🚀 Iniciando avance automático: { ... }
🔍 Estado del formulario después de prellenado: { ... }
✅ Todo pre-llenado, avanzando al paso 4 (confirmación)
```

---

## 🐛 Si No Funciona

### Escenario 1: No ves "🔍 Parámetros detectados"
**Problema:** El `useEffect` que lee los parámetros no se está ejecutando.

**Solución:**
1. Verifica que la URL tenga los parámetros: `?service=...&discipline=...`
2. Verifica que `useSearchParams` esté envuelto en `Suspense` (ya está implementado)
3. Verifica que `user` y `userLoading` estén correctos

### Escenario 2: Ves "🔍 Parámetros detectados" pero no "✅ Modal abierto"
**Problema:** El modal no se está abriendo automáticamente.

**Solución:**
1. Verifica que `setIsModalOpen(true)` se esté ejecutando
2. Verifica que no haya algún otro código que cierre el modal inmediatamente

### Escenario 3: Modal se abre pero no se pre-llena
**Problema:** El `useEffect` de prellenado no se está ejecutando o los datos no están disponibles.

**Solución:**
1. Verifica los logs: ¿ves "🔄 useEffect de prellenado ejecutado"?
2. Verifica que `initialService` y `initialServiceName` tengan valores
3. Verifica que `user` y `profile` estén cargados

### Escenario 4: Servicio no se encuentra en catálogo
**Problema:** El nombre del servicio no coincide exactamente con el del catálogo.

**Solución:**
1. Verifica el log "⚠️ Servicio no encontrado en catálogo"
2. Compara el nombre del servicio en `popularProjects` con el nombre en `service_catalog`
3. Asegúrate de que los nombres coincidan exactamente (case-sensitive)

### Escenario 5: WhatsApp/Ubicación no se pre-llenan
**Problema:** El perfil del usuario no tiene estos datos.

**Solución:**
1. Verifica que el perfil tenga `whatsapp` o `phone` en la base de datos
2. Verifica que el perfil tenga `ubicacion_direccion` en la base de datos
3. Si no los tiene, el usuario deberá ingresarlos manualmente (comportamiento esperado)

### Escenario 6: No avanza automáticamente
**Problema:** El timeout de 1200ms no es suficiente o hay un problema con las dependencias.

**Solución:**
1. Verifica los logs del estado del formulario
2. Verifica que todos los campos estén realmente pre-llenados
3. Si es necesario, aumenta el timeout a 1500ms o 2000ms

---

## 📋 Checklist de Verificación Rápida

- [ ] La URL tiene parámetros `?service=...&discipline=...`
- [ ] Los logs muestran "🔍 Parámetros detectados"
- [ ] Los logs muestran "✅ Modal abierto automáticamente"
- [ ] Los logs muestran "🔄 useEffect de prellenado ejecutado"
- [ ] Los logs muestran "🔍 Buscando servicio en catálogo"
- [ ] Los logs muestran "✅ Servicio encontrado" o "⚠️ Servicio no encontrado"
- [ ] Los logs muestran "📱 WhatsApp pre-llenado" (si existe en perfil)
- [ ] Los logs muestran "📍 Ubicación pre-llenada" (si existe en perfil)
- [ ] Los logs muestran "🚀 Iniciando avance automático"
- [ ] Los logs muestran "✅ Todo pre-llenado" o el paso al que avanza

---

## 🚀 Próximos Pasos

1. **Ejecutar y observar:**
   - Abre la consola del navegador
   - Haz clic en "Solicitar Ahora"
   - Copia todos los logs que aparezcan

2. **Compartir logs:**
   - Comparte los logs completos para identificar el problema exacto
   - Indica en qué paso se detiene el proceso

3. **Aplicar solución:**
   - Una vez identificado el problema, aplicaremos la solución específica

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0*


