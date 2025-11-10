# 📧 Guía de Implementación: Campaña Email Marketing

## 🎯 **Objetivo de la Campaña**

Reactivar profesionales con perfiles incompletos para que actualicen:
1. **WhatsApp** (campo crítico para contacto)
2. **Zona de Trabajo** (ubicación_lat, ubicacion_lng)

---

## 📊 **Segmentación de la Audiencia**

### **Query SQL para identificar profesionales objetivo**:

```sql
-- Profesionales sin WhatsApp o sin Ubicación
SELECT 
  user_id,
  email,
  full_name,
  whatsapp,
  ubicacion_lat,
  ubicacion_lng,
  profession,
  created_at,
  CASE 
    WHEN whatsapp IS NULL AND (ubicacion_lat IS NULL OR ubicacion_lng IS NULL) THEN 'ambos_faltantes'
    WHEN whatsapp IS NULL THEN 'whatsapp_faltante'
    WHEN ubicacion_lat IS NULL OR ubicacion_lng IS NULL THEN 'ubicacion_faltante'
  END as data_missing_type
FROM profiles
WHERE role = 'profesional'
  AND status = 'active'
  AND (
    whatsapp IS NULL 
    OR ubicacion_lat IS NULL 
    OR ubicacion_lng IS NULL
  )
ORDER BY created_at DESC;
```

### **Resultado Esperado**:
```
| user_id | email                          | full_name           | data_missing_type  |
|---------|--------------------------------|---------------------|--------------------|
| abc123  | victor@example.com             | Víctor Carrasco     | ambos_faltantes    |
| def456  | emmanuel@example.com           | Emmanuel Chagala    | ambos_faltantes    |
| ...     | ...                            | ...                 | ...                |
```

---

## 📧 **Plantillas Creadas**

### **1. Plantilla Principal** (Recomendada)
**Archivo**: `completa-perfil-profesional.html`

**Características**:
- ✅ **Diseño moderno** con gradientes y sombras
- ✅ **Secciones claramente diferenciadas** (WhatsApp en verde, Ubicación en azul)
- ✅ **Estadísticas visuales** (10X, 5X, 3X)
- ✅ **CTA principal prominente** con gradiente morado/azul
- ✅ **Banner de urgencia** amarillo
- ✅ **Responsive** para móvil y desktop
- ✅ **Dark mode support**
- ✅ **Compatible con Outlook, Gmail, Apple Mail**

**Mejoras vs versión original**:
1. **Hero section con gradiente** y % de completitud del perfil
2. **Iconos visuales** (💬, 📍) con círculos de color
3. **Comparación visual** (❌ Invisible vs ✅ 10X leads)
4. **Datos estadísticos** en cajas destacadas
5. **CTA secundario** para soporte
6. **Footer completo** con links y darse de baja

---

## 🎨 **Personalización Dinámica**

### **Variables a reemplazar antes de enviar**:

```javascript
const emailTemplate = fs.readFileSync('completa-perfil-profesional.html', 'utf8');

const personalizedEmail = emailTemplate
  .replace('{{nombre_profesional}}', profesional.full_name || 'Profesional')
  .replace('{{unsubscribe_url}}', `https://sumeeapp.com/unsubscribe?token=${profesional.unsubscribe_token}`);
```

### **Variables disponibles**:
- `{{nombre_profesional}}` → Nombre completo del profesional
- `{{unsubscribe_url}}` → URL de darse de baja
- (Opcional) `{{profession}}` → Profesión del profesional
- (Opcional) `{{completion_percentage}}` → % de completitud del perfil

---

## 🚀 **Herramientas de Envío Recomendadas**

### **Opción 1: SendGrid** (Recomendado para Sumee)
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: profesional.email,
  from: 'equipo@sumeeapp.com', // Verificado en SendGrid
  fromName: 'Equipo Sumee App',
  subject: '⚡ ¡Multiplica tus oportunidades! Completa tu perfil en 2 minutos',
  html: personalizedEmail,
  text: 'Versión texto plano...', // Fallback
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
  },
};

await sgMail.send(msg);
```

**Ventajas**:
- ✅ 100 emails gratis/día
- ✅ Excelente deliverability
- ✅ Analytics detallados
- ✅ Tracking de opens/clicks
- ✅ API fácil de usar

**Precio**: Free tier suficiente o $15/mes para 40,000 emails

---

### **Opción 2: Resend** (Alternativa Moderna)
```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Equipo Sumee <equipo@sumeeapp.com>',
  to: profesional.email,
  subject: '⚡ ¡Multiplica tus oportunidades! Completa tu perfil',
  html: personalizedEmail,
});
```

**Ventajas**:
- ✅ 100 emails gratis/día
- ✅ Muy fácil de implementar
- ✅ Developer-friendly
- ✅ Excelente para Next.js

---

### **Opción 3: Mailgun**
```javascript
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'mg.sumeeapp.com',
});

await mailgun.messages().send({
  from: 'Equipo Sumee <equipo@sumeeapp.com>',
  to: profesional.email,
  subject: '⚡ ¡Multiplica tus oportunidades! Completa tu perfil',
  html: personalizedEmail,
});
```

---

## 📈 **Líneas de Asunto A/B Testing**

Prueba estas variantes para maximizar open rate:

1. **Urgencia + Beneficio** (Recomendado):
   ```
   ⚡ Solo 2 minutos para 10X más clientes en Sumee
   ```

2. **FOMO**:
   ```
   ⚠️ Te estás perdiendo 5X más oportunidades
   ```

3. **Personalizado**:
   ```
   {{nombre}}, tu perfil está 85% completo
   ```

4. **Curiosidad**:
   ```
   Por qué los clientes no te están contactando...
   ```

5. **Directo**:
   ```
   Completa tu WhatsApp y multiplica tus trabajos
   ```

6. **Social Proof**:
   ```
   Cómo otros profesionales reciben 5X más leads
   ```

---

## 🎯 **Plan de Envío Escalonado**

### **Semana 1: Email Inicial**
- **Día 1**: Enviar email principal a todos
- **Tracking**: Open rate, click rate

### **Semana 2: Seguimiento (Solo NO abrieron)**
- **Día 8**: Re-enviar con subject diferente
- **Segmento**: Solo quienes no abrieron el primer email

### **Semana 3: Recordatorio (Abrieron pero NO completaron)**
- **Día 15**: Email más corto y directo
- **Segmento**: Abrieron pero aún no actualizaron perfil

### **Semana 4: Último Aviso**
- **Día 22**: Email de urgencia final
- **Subject**: "⏰ Última oportunidad: Actualiza tu perfil"

---

## 📊 **Métricas a Monitorear**

### **KPIs Primarios**:
```javascript
const metrics = {
  emailsSent: 100,
  openRate: 45,        // Target: >40%
  clickRate: 15,       // Target: >10%
  completionRate: 8,   // Target: >5%
  unsubscribeRate: 0.5 // Target: <1%
};
```

### **KPIs Secundarios**:
- Perfiles completados con WhatsApp
- Perfiles completados con Ubicación
- Perfiles 100% completados
- Tiempo promedio de completación
- Tasa de reactivación (logins después del email)

---

## 🔧 **Implementación en Next.js/Supabase**

### **Paso 1: API Route para envío de emails**

```typescript
// pages/api/send-completion-emails.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar API key de seguridad
  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Obtener profesionales con datos faltantes
    const { data: profesionales, error } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, whatsapp, ubicacion_lat, ubicacion_lng, profession')
      .eq('role', 'profesional')
      .eq('status', 'active')
      .or('whatsapp.is.null,ubicacion_lat.is.null,ubicacion_lng.is.null');

    if (error) throw error;

    // 2. Leer plantilla HTML
    const templatePath = path.join(process.cwd(), 'email-templates', 'completa-perfil-profesional.html');
    const emailTemplate = fs.readFileSync(templatePath, 'utf8');

    // 3. Enviar emails
    const results = [];
    for (const profesional of profesionales) {
      try {
        // Personalizar email
        const personalizedEmail = emailTemplate
          .replace(/{{nombre_profesional}}/g, profesional.full_name || 'Profesional')
          .replace(/{{unsubscribe_url}}/g, `https://sumeeapp.com/unsubscribe?id=${profesional.user_id}`);

        // Enviar
        await sgMail.send({
          to: profesional.email,
          from: {
            email: 'equipo@sumeeapp.com',
            name: 'Equipo Sumee App'
          },
          subject: '⚡ Solo 2 minutos para 10X más clientes en Sumee',
          html: personalizedEmail,
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
        });

        results.push({ email: profesional.email, status: 'sent' });

        // Registrar en base de datos
        await supabase.from('email_campaigns').insert({
          user_id: profesional.user_id,
          campaign_type: 'profile_completion',
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (emailError) {
        console.error(`Error enviando a ${profesional.email}:`, emailError);
        results.push({ email: profesional.email, status: 'failed', error: emailError.message });
      }
    }

    return res.status(200).json({
      success: true,
      totalProcessed: profesionales.length,
      results,
    });
  } catch (error) {
    console.error('Error en campaña:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### **Paso 2: Tabla para tracking**

```sql
-- En Supabase SQL Editor
CREATE TABLE email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_campaign_type ON email_campaigns(campaign_type);
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at);
```

---

## 🧪 **Testing Antes del Envío Masivo**

### **Checklist de Pruebas**:

```javascript
// 1. Test con email personal
const testEmail = {
  to: 'tu-email@example.com',
  subject: 'TEST: Completa tu perfil',
  html: personalizedEmail,
};

// 2. Verificar en múltiples clientes
// ✅ Gmail (desktop y móvil)
// ✅ Outlook (desktop y web)
// ✅ Apple Mail (iPhone, iPad, Mac)
// ✅ Yahoo Mail
// ✅ Modo oscuro

// 3. Herramientas de testing
// - https://www.mail-tester.com/ (Score de spam)
// - https://litmus.com/email-testing (Visualización)
// - https://www.emailonacid.com/ (Compatibilidad)
```

---

## 💰 **ROI Esperado**

### **Escenario Conservador**:
```
Profesionales contactados: 100
Open rate: 40% → 40 abren
Click rate: 10% → 10 hacen click
Completion rate: 5% → 5 completan perfil

ROI:
- 5 profesionales con perfil completo
- 5 profesionales × 5X más contactos = 25X más leads totales
- Costo: ~$0 (100 emails en tier gratuito)
- Tiempo: 2 horas setup + 30 min ejecución
```

### **Escenario Optimista**:
```
Open rate: 50%
Click rate: 15%
Completion rate: 10%

= 10 profesionales reactivados
= 50X más leads en la plataforma
```

---

## 🚀 **Próximos Pasos**

1. ✅ **Ejecutar query SQL** para identificar profesionales objetivo
2. ✅ **Crear cuenta en SendGrid** (o Resend)
3. ✅ **Verificar dominio** sumeeapp.com en SendGrid
4. ✅ **Probar envío** a emails de prueba
5. ✅ **Revisar en múltiples clientes** de email
6. ✅ **Ejecutar campaña** a batch pequeño (10-20 emails)
7. ✅ **Monitorear métricas** primeras 24h
8. ✅ **Escalar** al resto de la base de datos

---

## 📞 **Soporte**

Si necesitas ayuda con la implementación:
- Documentación SendGrid: https://docs.sendgrid.com/
- Documentación Resend: https://resend.com/docs
- Testing emails: https://www.mail-tester.com/

---

**¡Éxito con tu campaña!** 🎉📧

