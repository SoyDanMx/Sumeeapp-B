# ✅ Verificación: Constraint Actualizado

## ✅ Script SQL Ejecutado

El constraint `leads_servicio_check` ha sido actualizado para incluir todas las nuevas disciplinas.

---

## 📋 Disciplinas Ahora Permitidas

### Disciplinas Originales
- plomeria
- electricidad
- carpinteria
- pintura
- limpieza
- jardineria
- albanileria
- remodelacion
- impermeabilizacion
- gas
- calentadores
- bombas_agua
- seguridad
- climatizacion
- electrodomesticos

### 🆕 Nuevas Disciplinas Agregadas
- **montaje-armado** ✅
- **aire-acondicionado** ✅
- **cctv** ✅
- **wifi** ✅
- **fumigacion** ✅
- **cerrajeria** ✅
- **tablaroca** ✅
- **construccion** ✅

---

## ✅ Estado Actual

1. ✅ Constraint actualizado en base de datos
2. ✅ Código listo para usar "montaje-armado"
3. ✅ Manejo de errores mejorado
4. ✅ Logs de depuración agregados

---

## 🧪 Prueba Rápida

Para verificar que funciona:

1. Abre el modal de solicitud de servicio
2. Selecciona un servicio de "Populares" (como "Montar TV en Pared")
3. Completa los pasos 1-4
4. Haz clic en "Enviar Solicitud"
5. Debería crearse el lead sin errores

---

## 🔍 Si Aún Hay Errores

Si después de ejecutar el script SQL aún aparece el error:

1. **Verifica que el constraint se actualizó:**
   ```sql
   SELECT 
       conname AS constraint_name,
       pg_get_constraintdef(oid) AS constraint_definition
   FROM pg_constraint
   WHERE conname = 'leads_servicio_check';
   ```

2. **Verifica el valor que se está enviando:**
   - Abre la consola del navegador (F12)
   - Busca el log: `📋 Intentando crear lead con servicio:`
   - Verifica que el valor sea exactamente "montaje-armado" (sin espacios, con guión)

3. **Si el valor es diferente:**
   - Verifica que `formData.servicio` tenga el valor correcto
   - Verifica que no haya transformaciones que cambien el valor

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0*


