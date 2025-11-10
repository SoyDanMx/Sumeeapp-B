# 📧 Guía Visual: Enviar Emails SIN Código

**Para**: Daniel (No requiere programación)  
**Herramienta**: SendGrid UI  
**Tiempo**: 30 minutos  
**Costo**: $0 (100 emails/día gratis)

---

## ✅ **PASO 1: Crear Cuenta SendGrid** (5 min)

### 1.1 Registrarse
```
1. Ir a: https://signup.sendgrid.com/
2. Llenar formulario:
   - Email: tu-email@example.com
   - Password: (crear una segura)
   - Click "Create Account"
```

### 1.2 Verificar Email
```
1. Revisar inbox
2. Click en link de verificación
3. Confirmar cuenta
```

### 1.3 Setup Rápido
```
1. Elegir "Marketing Emails" (no "Transactional")
2. Skip tutorial (por ahora)
3. Llegar al Dashboard principal
```

---

## ✅ **PASO 2: Configurar Remitente** (5 min)

### 2.1 Verificar Email
```
1. Menú izquierdo → "Settings" → "Sender Authentication"
2. Click "Verify a Single Sender"
3. Llenar formulario:
   - From Name: Equipo Sumee App
   - From Email: tu-email@gmail.com (o el que uses)
   - Reply To: mismo email
   - Company: Sumee App
   - Address: Ciudad de México, México
4. Click "Create"
5. Revisar inbox y verificar
```

**Nota**: Para usar `equipo@sumeeapp.com`, necesitas verificar el dominio completo (más complejo).

---

## ✅ **PASO 3: Subir Contactos** (5 min)

### 3.1 Crear Lista
```
1. Menú izquierdo → "Marketing" → "Contacts"
2. Click "Create New List"
3. Nombre: "Profesionales Perfil Incompleto Nov 2025"
4. Click "Create"
```

### 3.2 Importar CSV
```
1. Click en la lista recién creada
2. Click "Add Contacts" → "Upload CSV"
3. Seleccionar archivo: email-templates/lista-profesionales-15.csv
4. Mapear columnas:
   - email → Email
   - primer_nombre → First Name
   - nombre_completo → Last Name (opcional)
   - profesion → Custom Field "profesion"
5. Click "Upload"
6. Esperar confirmación: "15 contacts added"
```

---

## ✅ **PASO 4: Crear Campaña** (10 min)

### 4.1 Nueva Campaña
```
1. Menú izquierdo → "Marketing" → "Campaigns"
2. Click "Create Campaign"
3. Elegir "Single Send"
4. Nombre: "Completar Perfil - Nov 2025"
5. Click "Continue"
```

### 4.2 Configurar Campaña
```
1. Campaign Name: "Completar Perfil Nov 2025"
2. Subject Line: ⚡ Solo 2 minutos para 10X más oportunidades
3. Sender: (elegir el verificado en paso 2)
4. Segment: "Profesionales Perfil Incompleto Nov 2025"
5. Click "Next"
```

### 4.3 Diseñar Email
```
1. En el editor, click "Code" (arriba a la derecha)
2. Borrar todo el contenido por defecto
3. Ir a: email-templates/completa-perfil-profesional.html
4. Copiar TODO el contenido (Cmd+A, Cmd+C)
5. Pegar en SendGrid (Cmd+V)
6. Click "Preview" para ver cómo se ve
```

### 4.4 Personalizar
```
En el HTML que pegaste, busca y reemplaza:

{{nombre_profesional}} 
↓
[%first_name%]

(SendGrid usará automáticamente el nombre de cada contacto)
```

---

## ✅ **PASO 5: Probar Email** (3 min)

### 5.1 Enviar Test
```
1. En el editor, click "Send Test"
2. Ingresar tu email personal
3. Click "Send Test Email"
4. Revisar inbox
5. Verificar que se vea bien en:
   - Gmail (desktop)
   - Gmail (móvil)
   - Outlook (si tienes)
```

### 5.2 Ajustar si es necesario
```
Si algo se ve mal:
1. Volver al editor
2. Ajustar HTML
3. Enviar nuevo test
4. Repetir hasta que se vea perfecto
```

---

## ✅ **PASO 6: Programar Envío** (2 min)

### 6.1 Programar
```
1. Click "Schedule"
2. Elegir fecha y hora:
   - Fecha: Mañana
   - Hora: 10:00 AM (hora CDMX)
3. Timezone: America/Mexico_City
4. Click "Schedule Campaign"
```

**O si prefieres enviar inmediatamente**:
```
1. Click "Send Immediately"
2. Confirmar: "Yes, Send Now"
```

---

## 📊 **PASO 7: Monitorear Resultados**

### 7.1 Ver Stats
```
1. Ir a: Marketing → Campaigns
2. Click en tu campaña
3. Ver métricas:
   - ✅ Delivered: Cuántos se entregaron
   - 👁️ Opens: Cuántos abrieron
   - 🖱️ Clicks: Cuántos hicieron click
   - ❌ Bounces: Cuántos rebotaron
```

### 7.2 Tracking en Supabase
```
Después de 24-48 horas, verificar en Supabase:

1. SQL Editor → New Query
2. Ejecutar:

SELECT 
  user_id,
  email,
  full_name,
  whatsapp,
  ubicacion_lat,
  ubicacion_lng,
  updated_at
FROM profiles
WHERE user_id IN (
  '63c6bf15-6b3b-49a0-9cd4-f58674facd3b',
  '15385c18-ca53-4fc9-a241-1c91b117689e',
  -- ... (rest of IDs)
)
AND updated_at > '2025-11-10'::timestamp
ORDER BY updated_at DESC;

3. Ver quiénes actualizaron su perfil
```

---

## 🎯 **ALTERNATIVA ULTRA-SIMPLE: Gmail**

Si SendGrid parece complicado, puedes usar **Gmail + BCC**:

### Método Gmail:
```
1. Abrir Gmail
2. Nuevo mensaje
3. Para: tu-email@example.com
4. BCC: (pegar los 15 emails separados por coma)
5. Asunto: ⚡ Solo 2 minutos para 10X más oportunidades
6. Cuerpo: (copiar el HTML del template)
   PERO: Gmail no renderiza HTML complejo bien
   
❌ NO RECOMENDADO - Usa SendGrid
```

---

## 🆘 **TROUBLESHOOTING**

### **Problema 1: "Sender not verified"**
```
Solución:
1. Ir a Settings → Sender Authentication
2. Verificar que el email tenga ✅ verde
3. Si no, reenviar email de verificación
```

### **Problema 2: "CSV import failed"**
```
Solución:
1. Abrir CSV en Excel/Numbers
2. Verificar que:
   - Primera fila sean headers
   - Columna "email" exista
   - No haya filas vacías
3. Guardar y reintentar
```

### **Problema 3: "HTML no se ve bien"**
```
Solución:
1. Asegurar que copiaste TODO el HTML
2. Desde <!DOCTYPE html> hasta </html>
3. No editar nada del HTML (a menos que sepas CSS)
4. Usar "Preview" para verificar
```

### **Problema 4: "Personalización no funciona"**
```
Si {{nombre_profesional}} aparece literal:

Solución:
1. Reemplazar {{nombre_profesional}} con [%first_name%]
2. O dejar nombre genérico: "Profesional"
```

---

## 📋 **CHECKLIST FINAL**

Antes de enviar, verificar:

- [ ] ✅ Cuenta SendGrid creada y verificada
- [ ] ✅ Remitente verificado (email con ✅)
- [ ] ✅ Lista de contactos importada (15 emails)
- [ ] ✅ Campaña creada
- [ ] ✅ HTML template pegado completo
- [ ] ✅ Personalización configurada ([%first_name%])
- [ ] ✅ Email de test enviado y revisado
- [ ] ✅ Subject line correcto
- [ ] ✅ Horario programado (10 AM)
- [ ] ✅ Campaña enviada o programada

---

## 📞 **¿NECESITAS AYUDA?**

### Opción 1: Tutorial en Video
```
SendGrid tiene tutoriales oficiales:
https://www.youtube.com/watch?v=6cA7tnYYV7w
(Buscar: "SendGrid Marketing Campaign Tutorial")
```

### Opción 2: Soporte SendGrid
```
Chat en vivo en: https://sendgrid.com/
(Esquina inferior derecha)
```

### Opción 3: Alternativa Más Simple
```
Usar Mailchimp (muy similar a SendGrid):
https://mailchimp.com/
(También tiene tier gratuito)
```

---

## 🎯 **RESULTADO ESPERADO**

Después de enviar:

**24 horas**:
- 📊 Ver open rate en SendGrid (esperamos >40%)
- 📊 Ver click rate (esperamos >10%)

**48 horas**:
- 🔍 Verificar en Supabase quiénes actualizaron perfil
- 📈 Esperamos 1-2 profesionales completen datos

**1 semana**:
- 📧 Enviar follow-up a quienes NO abrieron
- 📈 Esperamos 2-3 profesionales completen datos

---

## 💡 **TIPS FINALES**

1. **No envíes todos a la vez la primera vez**
   - Batch 1: 5 emails (test)
   - Esperar 24h y revisar métricas
   - Batch 2: 10 emails restantes

2. **Mejor horario**:
   - ✅ Martes/Miércoles 10-11 AM
   - ✅ Jueves 10 AM
   - ❌ Lunes muy temprano
   - ❌ Viernes tarde

3. **Subject line A/B testing**:
   - Probar con emoji vs sin emoji
   - Probar diferentes textos

4. **Seguimiento**:
   - Si abren pero no completan → WhatsApp personal
   - Si completan → Email de agradecimiento

---

**¡Éxito con tu campaña!** 🚀📧

**Cualquier duda, avísame y te guío paso a paso** 💪

