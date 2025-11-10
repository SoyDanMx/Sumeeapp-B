/**
 * Script para enviar emails de completación de perfil
 * Uso: ts-node scripts/send-completion-emails.ts
 */

import fs from 'fs';
import path from 'path';

// Data de profesionales con perfiles incompletos
const profesionales = [
  {
    "user_id": "63c6bf15-6b3b-49a0-9cd4-f58674facd3b",
    "email": "gonzaleznoah481@gmail.com",
    "full_name": "Luis Antonio González Sánchez",
    "whatsapp": "8146537069",
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Electricista",
    "data_missing_type": "ubicacion_faltante"
  },
  {
    "user_id": "15385c18-ca53-4fc9-a241-1c91b117689e",
    "email": "emmanuelchagala4@gmail.com",
    "full_name": "Emmanuel Chagala Bustamante",
    "whatsapp": "9211101587",
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Electricista",
    "data_missing_type": "ubicacion_faltante"
  },
  {
    "user_id": "9ff3c105-1a52-49f8-b8c3-bbb97acf91a1",
    "email": "antoniomendez2008@gmail.com",
    "full_name": "Antonio Méndez Brito",
    "whatsapp": "5514775216",
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Otro",
    "data_missing_type": "ubicacion_faltante"
  },
  {
    "user_id": "40bf52cc-cff4-4a79-8006-a4dd95f3a316",
    "email": "hector_mendoza13@yahoo.com",
    "full_name": "Héctor Mendoza Hernández",
    "whatsapp": null,
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Plomero",
    "data_missing_type": "ambos_faltantes"
  },
  {
    "user_id": "36bed3fd-5949-4460-9367-9e14fc6abe77",
    "email": "betito_mayo@outlook.com",
    "full_name": "Roberto Ramírez",
    "whatsapp": "5544798516",
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Electricista",
    "data_missing_type": "ubicacion_faltante"
  },
  {
    "user_id": "4cbe6d33-18dc-4914-aeb0-86ccc01bbcfb",
    "email": "eugeniocg1992@gmail.com",
    "full_name": "Eugenio Cueto González",
    "whatsapp": "5578692842",
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Electricista",
    "data_missing_type": "ubicacion_faltante"
  },
  {
    "user_id": "1846a9bc-6e91-495e-8817-443632ed74be",
    "email": "francmontes9305@gmail.com",
    "full_name": "Jose Francisco Montes Ruiz",
    "whatsapp": "5664366746",
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Electricista",
    "data_missing_type": "ubicacion_faltante"
  },
  {
    "user_id": "aec2e65b-b2ee-4cc9-8bfd-e5221c2d9b93",
    "email": "illidan0805@gmail.com",
    "full_name": "Martín Nathanael Miranda Pérez",
    "whatsapp": null,
    "ubicacion_lat": 19.6431549,
    "ubicacion_lng": -99.2091117,
    "profession": "Electricista",
    "data_missing_type": "whatsapp_faltante"
  },
  {
    "user_id": "26288420-3a5a-4d33-ae7d-a8ff3d8f2ecc",
    "email": "bt264997@gmail.com",
    "full_name": "Brando  Torres",
    "whatsapp": null,
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Plomero",
    "data_missing_type": "ambos_faltantes"
  },
  {
    "user_id": "1aadc0d1-cb36-4b5d-b983-bbda045bbadb",
    "email": "brandonreyescorona055@gamil.com",
    "full_name": "Brandon reyes macias",
    "whatsapp": null,
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Electricista",
    "data_missing_type": "ambos_faltantes"
  },
  {
    "user_id": "50a84a4e-da85-483f-b336-9b36b3da510d",
    "email": "alexisivan1935@gmail.com",
    "full_name": "Alexis Iván Granados luna",
    "whatsapp": null,
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Plomero",
    "data_missing_type": "ambos_faltantes"
  },
  {
    "user_id": "4cf7d7c2-4258-49d6-864d-b56b85438f27",
    "email": "fjtl@outlook.com",
    "full_name": "Francisco Javier Tinoco López",
    "whatsapp": null,
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Plomero",
    "data_missing_type": "ambos_faltantes"
  },
  {
    "user_id": "9405c04a-77b4-4b86-ab6d-3775e996be1c",
    "email": "marquezmarquezm92@gmail.com",
    "full_name": "Adrian Romero Márquez",
    "whatsapp": "5630986237",
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": "Electricista",
    "data_missing_type": "ubicacion_faltante"
  },
  {
    "user_id": "56fa54ea-2d1d-4f43-b3b2-53a11d6fa2ba",
    "email": "jorge_interc@hotmail.com",
    "full_name": "Jorge Garcia",
    "whatsapp": null,
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": null,
    "data_missing_type": "ambos_faltantes"
  },
  {
    "user_id": "e8ceabfa-3246-4aaf-81c5-1aefe95d9ceb",
    "email": "jcbgb98@gmail.com",
    "full_name": "Juan Carlos Beltran",
    "whatsapp": null,
    "ubicacion_lat": null,
    "ubicacion_lng": null,
    "profession": null,
    "data_missing_type": "ambos_faltantes"
  }
];

// Función para personalizar el template HTML
function personalizarEmail(
  templateHtml: string,
  profesional: typeof profesionales[0]
): string {
  const nombre = profesional.full_name.split(' ')[0]; // Primer nombre
  
  return templateHtml
    .replace(/{{nombre_profesional}}/g, nombre)
    .replace(/{{unsubscribe_url}}/g, `https://sumeeapp.com/unsubscribe?id=${profesional.user_id}`);
}

// Función para generar subject personalizado según datos faltantes
function getSubjectLine(dataType: string): string {
  switch (dataType) {
    case 'whatsapp_faltante':
      return '📱 Agrega tu WhatsApp y recibe 5X más clientes';
    case 'ubicacion_faltante':
      return '📍 Define tu zona y aparece en más búsquedas';
    case 'ambos_faltantes':
      return '⚡ Solo 2 minutos para 10X más oportunidades';
    default:
      return '✨ Completa tu perfil en Sumee App';
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando campaña de emails...\n');
  console.log(`📊 Total de profesionales: ${profesionales.length}\n`);

  // Leer template HTML
  const templatePath = path.join(__dirname, '../email-templates/completa-perfil-profesional.html');
  
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: No se encontró el template HTML');
    console.error(`   Ruta esperada: ${templatePath}`);
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  console.log('✅ Template HTML cargado\n');

  // Estadísticas
  const stats = {
    ubicacion_faltante: 0,
    whatsapp_faltante: 0,
    ambos_faltantes: 0,
  };

  // Generar emails personalizados
  const emails = profesionales.map((prof) => {
    stats[prof.data_missing_type as keyof typeof stats]++;

    return {
      to: prof.email,
      name: prof.full_name,
      subject: getSubjectLine(prof.data_missing_type),
      html: personalizarEmail(templateHtml, prof),
      dataType: prof.data_missing_type,
      profession: prof.profession || 'Profesional',
    };
  });

  // Mostrar estadísticas
  console.log('📈 Estadísticas de la campaña:');
  console.log(`   • Solo ubicación faltante: ${stats.ubicacion_faltante}`);
  console.log(`   • Solo WhatsApp faltante: ${stats.whatsapp_faltante}`);
  console.log(`   • Ambos datos faltantes: ${stats.ambos_faltantes}`);
  console.log('');

  // Guardar emails para revisión
  const outputDir = path.join(__dirname, '../email-templates/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Guardar cada email personalizado
  emails.forEach((email, index) => {
    const filename = `email-${index + 1}-${email.to.replace('@', '-at-')}.html`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, email.html, 'utf8');
  });

  console.log(`✅ ${emails.length} emails personalizados generados en: ${outputDir}\n`);

  // Guardar CSV con la lista
  const csvPath = path.join(outputDir, 'lista-envio.csv');
  const csvContent = [
    'Email,Nombre,Subject,Profesion,Datos Faltantes',
    ...emails.map(e => `"${e.to}","${e.name}","${e.subject}","${e.profession}","${e.dataType}"`)
  ].join('\n');
  
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`✅ Lista CSV generada: ${csvPath}\n`);

  // Instrucciones para envío con SendGrid
  console.log('📧 PRÓXIMOS PASOS PARA ENVIAR:\n');
  console.log('1. Configurar SendGrid:');
  console.log('   npm install @sendgrid/mail');
  console.log('   export SENDGRID_API_KEY="tu-api-key"\n');
  console.log('2. Ejecutar el envío real con SendGrid (ver código comentado)\n');
  console.log('3. O importar lista-envio.csv a tu herramienta de email marketing\n');

  // CÓDIGO PARA ENVÍO REAL (Comentado por seguridad)
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  for (const email of emails) {
    try {
      await sgMail.send({
        to: email.to,
        from: {
          email: 'equipo@sumeeapp.com',
          name: 'Equipo Sumee App'
        },
        subject: email.subject,
        html: email.html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      });
      
      console.log(`✅ Enviado a: ${email.to}`);
      await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
    } catch (error) {
      console.error(`❌ Error enviando a ${email.to}:`, error);
    }
  }
  */

  console.log('🎉 Proceso completado!\n');
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

