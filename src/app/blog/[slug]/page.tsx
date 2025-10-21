// src/app/blog/[slug]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCalendarAlt, 
  faClock, 
  faArrowLeft,
  faShare,
  faEye,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
  views?: number;
  tags: string[];
}

// Datos de ejemplo - En producción vendrían de CMS/API
const blogPosts: Record<string, BlogPost> = {
  'consejos-mantener-hogar-excelente-estado': {
    id: '1',
    title: '10 Consejos para Mantener tu Hogar en Excelente Estado',
    content: `
      <p>Mantener tu hogar en excelente estado no es solo cuestión de estética, es una inversión en tu calidad de vida y en el valor de tu propiedad. Aquí te presentamos 10 consejos profesionales que puedes implementar de manera sencilla:</p>
      
      <h3>1. Limpieza Regular y Profunda</h3>
      <p>Establece una rutina de limpieza que incluya tanto tareas diarias como semanales. La limpieza regular previene la acumulación de suciedad y hace que las tareas de mantenimiento sean más sencillas.</p>
      
      <h3>2. Revisión de Sistemas Eléctricos</h3>
      <p>Realiza inspecciones mensuales de tus tomas eléctricas, verifica que no haya cables desgastados y mantén actualizado tu sistema eléctrico. Esto previene accidentes y garantiza el funcionamiento correcto.</p>
      
      <h3>3. Mantenimiento de Plomería</h3>
      <p>Revisa regularmente grifos, tuberías y desagües. Un pequeño problema de plomería puede convertirse en una gran complicación si no se atiende a tiempo.</p>
      
      <h3>4. Ventilación Adecuada</h3>
      <p>Mantén una buena ventilación en todos los espacios para prevenir humedad, moho y problemas de salud. Esto es especialmente importante en baños, cocinas y sótanos.</p>
      
      <h3>5. Revisión de Pintura y Paredes</h3>
      <p>Las paredes requieren atención periódica. Revisa grietas, humedad y el estado de la pintura. Una mano de pintura fresca puede renovar completamente cualquier espacio.</p>
      
      <p>Implementar estos consejos de manera regular te ayudará a mantener tu hogar en excelente estado, creando un ambiente más saludable y agradable para toda tu familia.</p>
    `,
    author: 'Equipo Sumee',
    publishDate: '2024-01-15',
    readTime: '5 min',
    category: 'Mantenimiento',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
    slug: 'consejos-mantener-hogar-excelente-estado',
    views: 1250,
    tags: ['mantenimiento', 'hogar', 'consejos', 'limpieza']
  },
  'elegir-profesional-perfecto-proyecto': {
    id: '2',
    title: 'Cómo Elegir el Profesional Perfecto para tu Proyecto',
    content: `
      <p><strong>Aprende a identificar las cualidades clave que debes buscar al contratar un profesional para tu hogar.</strong></p>
      
      <p>Contratar a alguien para trabajar en tu hogar, ya sea para instalar un minisplit, reparar una fuga o reconfigurar la electricidad, puede generar ansiedad. ¿Será un trabajo de calidad? ¿Será seguro?</p>
      
      <p>Para ayudarte a tomar la mejor decisión, aquí te resumimos las <strong>tres cualidades clave</strong> que todo profesional de confianza debe poseer.</p>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Profesional técnico con certificaciones y herramientas especializadas" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Un técnico profesional con certificaciones y experiencia demostrada</p>
      </div>
      
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
        <h2 style="color: #1e40af; margin-bottom: 1rem; font-size: 1.5rem;">1. Experiencia Comprobable y Especialización</h2>
        <p style="color: #1e3a8a; margin-bottom: 1.5rem;">Un buen técnico no es solo un "todólogo". La calidad se encuentra en la <strong>especialización</strong>.</p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <h3 style="color: #92400e; margin-bottom: 0.5rem;">🔍 Busca la Prueba</h3>
          <p style="color: #92400e;">¿Tiene certificaciones? ¿Puede mostrar trabajos anteriores similares al tuyo? Un electricista con certificación industrial no es la mejor opción para un proyecto residencial de baja escala, a menos que tenga experiencia demostrada en ese nicho.</p>
        </div>
        
        <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <h3 style="color: #065f46; margin-bottom: 0.5rem;">⭐ La Calificación Habla</h3>
          <p style="color: #065f46;">Las reseñas y calificaciones de otros clientes son la <strong>prueba social más fuerte</strong>. Una calificación promedio alta (4.5 estrellas o más) es un buen indicador de consistencia.</p>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Profesional explicando presupuesto detallado y comunicación clara con cliente" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Comunicación clara y transparencia en presupuestos</p>
      </div>
      
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
        <h2 style="color: #15803d; margin-bottom: 1rem; font-size: 1.5rem;">2. Transparencia y Comunicación</h2>
        <p style="color: #15803d; margin-bottom: 1.5rem;">Un profesional de calidad te ofrece más que solo manos; ofrece <strong>claridad y paz mental</strong>.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 1rem; border-radius: 0.5rem;">
            <h3 style="color: #0c4a6e; margin-bottom: 0.5rem;">💰 Estimación Clara</h3>
            <p style="color: #0c4a6e; font-size: 0.9rem;">Antes de iniciar, el profesional debe proporcionarte un presupuesto detallado, explicando los costos de materiales y mano de obra.</p>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 1rem; border-radius: 0.5rem;">
            <h3 style="color: #991b1b; margin-bottom: 0.5rem;">📱 Contacto Directo</h3>
            <p style="color: #991b1b; font-size: 0.9rem;">La capacidad de comunicarte rápidamente con tu técnico a través de canales directos como WhatsApp reduce la incertidumbre y permite resolver dudas inmediatamente.</p>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Documentos de verificación IMSS, certificaciones y seguridad laboral" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Documentos de verificación y seguridad laboral</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border: 1px solid #8b5cf6; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #5b21b6; margin-bottom: 1rem; font-size: 1.5rem;">🛡️ 3. Seguridad y Confianza (El Factor IMSS)</h2>
        <p style="color: #5b21b6; margin-bottom: 1rem;">Este es un factor clave en la profesionalización del sector. Contratar a alguien que puede demostrar su compromiso con la legalidad y la seguridad, como el registro ante el IMSS, te da una <strong>capa adicional de tranquilidad</strong>.</p>
        <p style="color: #5b21b6;">Demuestra que no son trabajadores informales y que tienen un compromiso a largo plazo con su oficio.</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); color: white; padding: 2rem; margin: 2rem 0; border-radius: 1rem; text-align: center;">
        <h2 style="margin-bottom: 1rem; font-size: 1.8rem;">🎯 El Secreto para Contratar Sin Estrés</h2>
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.9;">Elegir al profesional perfecto no tiene que ser una búsqueda interminable.</p>
        
        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p>En <strong>Sumee App</strong>, hacemos el trabajo pesado por ti. Cada técnico en nuestra plataforma pasa por un proceso de verificación de experiencia y especialización. Nuestro sistema te muestra el perfil completo, su calificación promedio en tiempo real, sus áreas de servicio confirmadas y te da acceso a herramientas de contacto directo.</p>
        </div>
        
        <p style="font-weight: 600; font-size: 1.1rem;">No pierdas tiempo buscando. Ve a la fuente de técnicos verificados y transparentes.</p>
      </div>
    `,
    author: 'Equipo Sumee',
    publishDate: '2024-01-20',
    readTime: '5 min',
    category: 'Guía de Contratación',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    slug: 'elegir-profesional-perfecto-proyecto',
    views: 890,
    tags: ['profesional', 'contratación', 'calidad', 'verificación']
  },
  'actualizaciones-seguridad-hogar-2024': {
    id: '3',
    title: 'Actualizaciones de Seguridad en el Hogar: Tendencias 2024',
    content: `
      <p><strong>Mantener tu hogar seguro ya no se trata solo de cerraduras robustas. El año 2024 trae consigo avances tecnológicos que integran la seguridad con la eficiencia y la inteligencia artificial (IA).</strong></p>
      
      <p>Estar al día con estas tendencias no solo protege tu propiedad, sino que te brinda una tranquilidad invaluable. Aquí te mostramos las <strong>tres áreas clave</strong> de actualización en seguridad residencial.</p>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Sistema de seguridad inteligente con IA y cámaras de vigilancia moderna" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Sistemas de seguridad inteligente con tecnología 2024</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); border: 1px solid #f59e0b; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #92400e; margin-bottom: 1rem; font-size: 1.5rem;">🤖 1. La Inteligencia Artificial en Detección Temprana</h2>
        <p style="color: #92400e; margin-bottom: 1.5rem;">Las cámaras de seguridad inteligentes ya no solo graban video. Ahora, los sistemas más avanzados utilizan IA para <strong>filtrar falsas alarmas</strong> y detectar amenazas reales antes de que ocurran.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1rem 0;">
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #d97706; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #92400e; margin-bottom: 0.8rem; font-size: 1.1rem;">🔍 Reconocimiento de Patrones</h3>
            <p style="color: #92400e; font-size: 0.95rem; line-height: 1.5;">Pueden distinguir entre un cartero, una mascota y una persona desconocida, alertando solo ante actividad sospechosa o movimientos erráticos.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #d97706; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #92400e; margin-bottom: 0.8rem; font-size: 1.1rem;">🎵 Análisis de Audio</h3>
            <p style="color: #92400e; font-size: 0.95rem; line-height: 1.5;">Algunos sistemas incluso analizan sonidos para identificar rotura de cristales o ruidos inusuales que podrían indicar una intrusión.</p>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); border-left: 4px solid #d97706; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
          <p style="color: #92400e; font-weight: 600; margin: 0;"><strong>Ventaja Clave:</strong> Se reduce el desgaste de los equipos y se elimina la "fatiga de alarma" que hace que ignoremos las notificaciones constantes.</p>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Cámaras de seguridad inteligentes con reconocimiento facial y análisis en tiempo real" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Cámaras inteligentes con análisis avanzado de patrones</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%); border: 1px solid #3b82f6; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #1e40af; margin-bottom: 1rem; font-size: 1.5rem;">🔐 2. Integración Completa del Hogar Inteligente</h2>
        <p style="color: #1e40af; margin-bottom: 1.5rem;">Los sistemas de seguridad modernos no funcionan de forma aislada. Se integran perfectamente con otros dispositivos inteligentes para crear un <strong>ecosistema de protección completo</strong>.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #2563eb; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #1e40af; margin-bottom: 0.8rem; font-size: 1.1rem;">🏠 Control Centralizado</h3>
            <p style="color: #1e40af; font-size: 0.95rem; line-height: 1.5;">Un solo panel de control para luces, cámaras, sensores y cerraduras, todo sincronizado y accesible desde tu smartphone.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #2563eb; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #1e40af; margin-bottom: 0.8rem; font-size: 1.1rem;">⚡ Respuesta Automática</h3>
            <p style="color: #1e40af; font-size: 0.95rem; line-height: 1.5;">Al detectar una anomalía, el sistema puede encender luces, cerrar puertas automáticamente y notificar a las autoridades.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #2563eb; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #1e40af; margin-bottom: 0.8rem; font-size: 1.1rem;">📱 Monitoreo 24/7</h3>
            <p style="color: #1e40af; font-size: 0.95rem; line-height: 1.5;">Acceso en tiempo real desde cualquier lugar, con notificaciones instantáneas y grabación en la nube.</p>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1556438064-2d7646166914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Hogar inteligente con sistema de seguridad integrado, luces automáticas y sensores" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Hogar inteligente completamente integrado</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #dc2626 100%); border: 1px solid #dc2626; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #991b1b; margin-bottom: 1rem; font-size: 1.5rem;">🛡️ 3. Protección Cibernética y Privacidad</h2>
        <p style="color: #991b1b; margin-bottom: 1.5rem;">Con la digitalización de la seguridad, también surge la necesidad de <strong>proteger tu privacidad</strong> y prevenir ataques cibernéticos a tu red doméstica.</p>
        
        <div style="background: rgba(255,255,255,0.9); border: 1px solid #b91c1c; padding: 1.5rem; border-radius: 0.8rem; margin: 1rem 0;">
          <h3 style="color: #991b1b; margin-bottom: 1rem; font-size: 1.2rem;">🔒 Características de Seguridad Cibernética 2024:</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div>
              <h4 style="color: #991b1b; margin-bottom: 0.5rem; font-weight: 600;">🔐 Encriptación End-to-End</h4>
              <p style="color: #991b1b; font-size: 0.9rem;">Todas las comunicaciones entre dispositivos están completamente encriptadas.</p>
            </div>
            
            <div>
              <h4 style="color: #991b1b; margin-bottom: 0.5rem; font-weight: 600;">🏠 Almacenamiento Local</h4>
              <p style="color: #991b1b; font-size: 0.9rem;">Opción de guardar grabaciones localmente, sin depender de la nube.</p>
            </div>
            
            <div>
              <h4 style="color: #991b1b; margin-bottom: 0.5rem; font-weight: 600;">🛡️ Firewall Integrado</h4>
              <p style="color: #991b1b; font-size: 0.9rem;">Protección automática contra intrusiones cibernéticas.</p>
            </div>
            
            <div>
              <h4 style="color: #991b1b; margin-bottom: 0.5rem; font-weight: 600;">👤 Autenticación Biométrica</h4>
              <p style="color: #991b1b; font-size: 0.9rem;">Acceso mediante huella dactilar o reconocimiento facial.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    author: 'Equipo Sumee',
    publishDate: '2024-01-25',
    readTime: '6 min',
    category: 'Seguridad',
    image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f2c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    slug: 'actualizaciones-seguridad-hogar-2024',
    views: 1240,
    tags: ['seguridad', 'tecnología', 'hogar inteligente', 'IA', '2024']
  },
  'instalacion-bomba-agua-cdmx': {
    id: '4',
    title: 'Instalación de Bomba de Agua en CDMX: Solución al Suministro Irregular',
    content: `
      <p><strong>La escasez de agua en la Ciudad de México es una realidad que todos conocemos. Las instalaciones de bombas de agua se han vuelto una necesidad esencial para mantener el suministro constante en el hogar.</strong></p>
      
      <p>Si vives en CDMX, es probable que hayas experimentado cortes de agua, baja presión o incluso semanas sin suministro. La instalación de una bomba de agua correcta puede transformar esta situación y garantizar que tu familia siempre tenga acceso al agua que necesita.</p>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.pexels.com/photos/259239/pexels-photo-259239.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop" alt="Técnico plomero arrodillado trabajando en bomba de agua con herramientas especializadas" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Técnico plomero trabajando en ensamble y reparación de bomba de agua con herramientas especializadas</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%); border: 1px solid #3b82f6; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #1e40af; margin-bottom: 1rem; font-size: 1.5rem;">💧 1. Tipos de Bombas de Agua para CDMX</h2>
        <p style="color: #1e40af; margin-bottom: 1.5rem;">No todas las bombas son iguales. Elegir el tipo correcto depende de tu situación específica y las características de tu propiedad.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1rem 0;">
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #2563eb; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #1e40af; margin-bottom: 0.8rem; font-size: 1.1rem;">🔄 Bomba Centrífuga</h3>
            <p style="color: #1e40af; font-size: 0.95rem; line-height: 1.5;">Ideal para presurizar el agua que llega con poca fuerza. Perfecta para azoteas y pisos altos donde la presión es insuficiente.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #2563eb; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #1e40af; margin-bottom: 0.8rem; font-size: 1.1rem;">⬆️ Bomba Sumergible</h3>
            <p style="color: #1e40af; font-size: 0.95rem; line-height: 1.5;">Para extraer agua de cisternas o tinacos profundos. Especialmente útil cuando el suministro es intermitente.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #2563eb; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #1e40af; margin-bottom: 0.8rem; font-size: 1.1rem;">🔄 Bomba de Presurización</h3>
            <p style="color: #1e40af; font-size: 0.95rem; line-height: 1.5;">Aumenta la presión del agua existente. Solución perfecta para regaderas que no tienen suficiente fuerza.</p>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); border-left: 4px solid #2563eb; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
          <p style="color: #1e40af; font-weight: 600; margin: 0;"><strong>Importante:</strong> Cada tipo requiere una instalación específica y conocimientos técnicos especializados para funcionar correctamente y de manera segura.</p>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.pexels.com/photos/3807270/pexels-photo-3807270.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop" alt="Diagrama técnico de instalación hidráulica de bomba de agua con componentes etiquetados" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Diagrama técnico detallado de instalación hidráulica con todos los componentes y conexiones</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); border: 1px solid #f59e0b; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #92400e; margin-bottom: 1rem; font-size: 1.5rem;">⚠️ 2. Errores Comunes que Debes Evitar</h2>
        <p style="color: #92400e; margin-bottom: 1.5rem;">Una instalación incorrecta puede causar daños costosos, desperdicio de agua y problemas eléctricos peligrosos.</p>
        
        <div style="background: rgba(255,255,255,0.9); border: 1px solid #d97706; padding: 1.5rem; border-radius: 0.8rem; margin: 1rem 0;">
          <h3 style="color: #92400e; margin-bottom: 1rem; font-size: 1.2rem;">🚨 Errores Más Peligrosos:</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">⚡ Conexiones Eléctricas Incorrectas</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Usar cables inadecuados o conexiones sin protección puede causar cortocircuitos y riesgos de descarga eléctrica.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">🔧 Instalación Sin Válvulas</h4>
              <p style="color: #92400e; font-size: 0.9rem;">La falta de válvulas de retención puede causar retroflujo y contaminación del suministro de agua.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">📍 Ubicación Inadecuada</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Instalar en lugares sin ventilación o con riesgo de inundación puede dañar el equipo permanentemente.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">📏 Dimensionamiento Incorrecto</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Una bomba demasiado pequeña o grande no funcionará eficientemente y puede consumir más energía de la necesaria.</p>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.pexels.com/photos/3807275/pexels-photo-3807275.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop" alt="Instalación completa de bomba de agua con tuberías, válvulas y conexiones profesionales" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Instalación completa de bomba de agua con sistema de tuberías, válvulas y medición profesional</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #10b981 100%); border: 1px solid #10b981; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #065f46; margin-bottom: 1rem; font-size: 1.5rem;">✅ 3. Beneficios de una Instalación Profesional</h2>
        <p style="color: #065f46; margin-bottom: 1.5rem;">Contratar un <strong>plomero certificado</strong> para la instalación de tu bomba de agua no solo garantiza el funcionamiento correcto, sino que también te protege de riesgos futuros.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #059669; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #065f46; margin-bottom: 0.8rem; font-size: 1.1rem;">🛡️ Garantía de Trabajo</h3>
            <p style="color: #065f46; font-size: 0.95rem; line-height: 1.5;">Los profesionales certificados ofrecen garantía en su trabajo, protegiendo tu inversión ante cualquier inconveniente.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #059669; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #065f46; margin-bottom: 0.8rem; font-size: 1.1rem;">⚡ Cumplimiento de Normas</h3>
            <p style="color: #065f46; font-size: 0.95rem; line-height: 1.5;">La instalación cumple con las normativas de CFE y CONAGUA, evitando problemas legales y asegurando eficiencia energética.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #059669; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #065f46; margin-bottom: 0.8rem; font-size: 1.1rem;">🔧 Mantenimiento Preventivo</h3>
            <p style="color: #065f46; font-size: 0.95rem; line-height: 1.5;">Los técnicos te asesoran sobre el mantenimiento correcto y pueden programar revisiones periódicas.</p>
          </div>
        </div>
      </div>
    `,
    author: 'Equipo Sumee',
    publishDate: '2024-01-30',
    readTime: '7 min',
    category: 'Plomería',
    image: 'https://images.pexels.com/photos/259239/pexels-photo-259239.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    slug: 'instalacion-bomba-agua-cdmx',
    views: 1850,
    tags: ['plomería', 'bomba de agua', 'CDMX', 'suministro agua', 'instalación']
  },
  'instalaciones-electricas-riesgos-cdmx': {
    id: '5',
    title: 'Instalaciones Eléctricas Fuera de Norma: Peligros Mortales que Debes Conocer',
    content: `
      <p><strong>Las instalaciones eléctricas improvisadas en CDMX no son solo un problema estético: son un riesgo mortal para tu familia y tu patrimonio.</strong></p>
      
      <p>En la Ciudad de México, es común encontrar casas con instalaciones eléctricas hechas por "técnicos no certificados" que cortan esquinas para ahorrar costos. Estos trabajos aparentemente baratos pueden convertirse en pesadillas costosas: desde incendios eléctricos hasta lesiones permanentes.</p>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Instalación eléctrica profesional vs instalación improvisada peligrosa" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">La diferencia entre una instalación profesional y una improvisada puede salvar vidas</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #dc2626 100%); border: 1px solid #dc2626; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #991b1b; margin-bottom: 1rem; font-size: 1.5rem;">🔥 1. Riesgos Mortales de Instalaciones Improvisadas</h2>
        <p style="color: #991b1b; margin-bottom: 1.5rem;">Los "ahorros" de una instalación barata pueden costarte <strong>infinitamente más</strong> en daños, lesiones y dolor familiar.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1rem 0;">
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #b91c1c; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #991b1b; margin-bottom: 0.8rem; font-size: 1.1rem;">🔥 Incendios Eléctricos</h3>
            <p style="color: #991b1b; font-size: 0.95rem; line-height: 1.5;">Sobrecargas, cortocircuitos y cables inadecuados son la causa del 40% de incendios residenciales en CDMX.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #b91c1c; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #991b1b; margin-bottom: 0.8rem; font-size: 1.1rem;">⚡ Descargas Eléctricas</h3>
            <p style="color: #991b1b; font-size: 0.95rem; line-height: 1.5;">Contacto directo con corriente puede causar desde quemaduras severas hasta paro cardíaco.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #b91c1c; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #991b1b; margin-bottom: 0.8rem; font-size: 1.1rem;">🏠 Daños Estructurales</h3>
            <p style="color: #991b1b; font-size: 0.95rem; line-height: 1.5;">Humo, fuego y agua de los bomberos pueden devastar completamente tu hogar.</p>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); border-left: 4px solid #b91c1c; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
          <p style="color: #991b1b; font-weight: 600; margin: 0;"><strong>Estadística Alarmante:</strong> En CDMX, el 60% de los incendios residenciales están relacionados con instalaciones eléctricas defectuosas o fuera de norma.</p>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Inspección de instalación eléctrica defectuosa con cables expuestos y conexiones peligrosas" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Instalación eléctrica defectuosa con múltiples violaciones de seguridad</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); border: 1px solid #f59e0b; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #92400e; margin-bottom: 1rem; font-size: 1.5rem;">⚠️ 2. Señales de Peligro en tu Instalación</h2>
        <p style="color: #92400e; margin-bottom: 1.5rem;">Si reconoces alguna de estas situaciones en tu hogar, <strong>no esperes más</strong>: tu familia está en riesgo inmediato.</p>
        
        <div style="background: rgba(255,255,255,0.9); border: 1px solid #d97706; padding: 1.5rem; border-radius: 0.8rem; margin: 1rem 0;">
          <h3 style="color: #92400e; margin-bottom: 1rem; font-size: 1.2rem;">🚨 Alertas de Emergencia:</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">⚡ Interruptores que Se Disparan Seguido</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Indica sobrecarga o cortocircuito. No es normal y puede causar incendio.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">🔥 Calentamiento en Contactos</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Si sientes calor en enchufes o interruptores, hay un problema serio.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">💡 Luces que Parpadean</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Conexiones sueltas o cableado defectuoso que puede generar chispas.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">🔌 Cableado Expuesto</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Cables sin protección son un riesgo de descarga eléctrica directa.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">🌩️ Chispas al Conectar Aparatos</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Contactos defectuosos pueden generar incendios instantáneos.</p>
            </div>
            
            <div>
              <h4 style="color: #92400e; margin-bottom: 0.5rem; font-weight: 600;">🏠 Olor a Quemado</h4>
              <p style="color: #92400e; font-size: 0.9rem;">Aislamiento derretido o sobrecalentamiento: evacúa inmediatamente.</p>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 2rem 0;">
        <img src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" alt="Electricista certificado realizando instalación eléctrica segura con herramientas profesionales" style="width: 100%; max-width: 600px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;">Técnico certificado realizando instalación eléctrica segura</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #10b981 100%); border: 1px solid #10b981; padding: 2rem; margin: 2rem 0; border-radius: 1rem;">
        <h2 style="color: #065f46; margin-bottom: 1rem; font-size: 1.5rem;">✅ 3. Por Qué Solo Contratar Electricistas Certificados</h2>
        <p style="color: #065f46; margin-bottom: 1.5rem;">Un <strong>electricista certificado</strong> no es un lujo: es una necesidad absoluta para proteger tu hogar y tu familia.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #059669; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #065f46; margin-bottom: 0.8rem; font-size: 1.1rem;">🏆 Certificación CFE</h3>
            <p style="color: #065f46; font-size: 0.95rem; line-height: 1.5;">Conocen las normativas de la Comisión Federal de Electricidad y las aplican correctamente.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #059669; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #065f46; margin-bottom: 0.8rem; font-size: 1.1rem;">🛡️ Seguro de Responsabilidad</h3>
            <p style="color: #065f46; font-size: 0.95rem; line-height: 1.5;">Están asegurados contra daños, protegiendo tu patrimonio en caso de accidentes.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #059669; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #065f46; margin-bottom: 0.8rem; font-size: 1.1rem;">📋 Materiales de Calidad</h3>
            <p style="color: #065f46; font-size: 0.95rem; line-height: 1.5;">Usan componentes certificados que cumplen estándares de seguridad internacionales.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.8); border: 1px solid #059669; padding: 1.5rem; border-radius: 0.8rem;">
            <h3 style="color: #065f46; margin-bottom: 0.8rem; font-size: 1.1rem;">🔧 Garantía de Trabajo</h3>
            <p style="color: #065f46; font-size: 0.95rem; line-height: 1.5;">Ofrecen garantía en sus instalaciones y están disponibles para mantenimiento.</p>
          </div>
        </div>
      </div>
    `,
    author: 'Equipo Sumee',
    publishDate: '2024-02-05',
    readTime: '8 min',
    category: 'Electricidad',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80',
    slug: 'instalaciones-electricas-riesgos-cdmx',
    views: 2150,
    tags: ['electricidad', 'instalaciones eléctricas', 'seguridad', 'CFE', 'riesgos', 'CDMX']
  }
  // Más posts se agregarían aquí...
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
            <p className="text-gray-600 mb-8">El artículo que buscas no existe o ha sido movido.</p>
            <a 
              href="/blog" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Volver al Blog
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero del artículo */}
        <article className="pb-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
              <a href="/" className="hover:text-indigo-600">Inicio</a>
              <span>/</span>
              <a href="/blog" className="hover:text-indigo-600">Blog</a>
              <span>/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>

            {/* Imagen principal */}
            <div className="relative h-64 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Categoría */}
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold">
                  <FontAwesomeIcon icon={faHashtag} className="mr-2 text-xs" />
                  {post.category}
                </span>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-4xl mx-auto">
              {/* Header del artículo */}
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-b border-gray-200">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                      <span className="text-gray-700">{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                      <span className="text-gray-700">{formatDate(post.publishDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                      <span className="text-gray-700">{post.readTime} de lectura</span>
                    </div>
                    {post.views && (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faEye} className="text-gray-500" />
                        <span className="text-gray-700">{post.views.toLocaleString()} vistas</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Botón compartir */}
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                    <FontAwesomeIcon icon={faShare} />
                    <span>Compartir</span>
                  </button>
                </div>
              </header>

              {/* Contenido del artículo */}
              <div 
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* CTA para el artículo de profesionales */}
              {post.slug === 'elegir-profesional-perfecto-proyecto' && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    ¡Conviértete en Miembro y Encuentra a tu Próximo Pro!
                  </h2>
                  <p className="text-xl text-green-100 mb-8 leading-relaxed">
                    Solicita tu proyecto hoy mismo y recibe cotizaciones de profesionales que cumplen con todos estos estándares.
                  </p>
                  
                  <a 
                    href="/membresia"
                    className="inline-flex items-center bg-white text-green-600 hover:text-green-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="mr-3">🚀</span>
                    ¡Quiero un Técnico Verificado Ahora Mismo!
                  </a>
                  
                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-green-100">
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Técnicos Verificados
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faHashtag} className="mr-2" />
                      Seguro y Confiable
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      Mejores Calificaciones
                    </span>
                  </div>
                </div>
              )}

              {/* CTA para el artículo de seguridad */}
              {post.slug === 'actualizaciones-seguridad-hogar-2024' && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    🛡️ ¡Protege tu Hogar con los Mejores Profesionales!
                  </h2>
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    No dejes la seguridad de tu hogar al azar. Conecta con técnicos especializados en instalación de sistemas de seguridad y automatización del hogar.
                  </p>
                  
                  <a 
                    href="/membresia"
                    className="inline-flex items-center bg-white text-blue-600 hover:text-blue-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="mr-3">🔒</span>
                    ¡Instalar Sistema de Seguridad Ahora!
                  </a>
                  
                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-blue-100">
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Especialistas en Seguridad
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faHashtag} className="mr-2" />
                      Tecnología 2024
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      Instalación Profesional
                    </span>
                  </div>
                </div>
              )}

              {/* CTA para el artículo de bomba de agua */}
              {post.slug === 'instalacion-bomba-agua-cdmx' && (
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    💧 ¡Soluciona tu Problema de Agua con Profesionales!
                  </h2>
                  <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
                    No más cortes de agua ni baja presión. Conecta con plomeros certificados especializados en instalación de bombas de agua para CDMX.
                  </p>
                  
                  <a 
                    href="/membresia"
                    className="inline-flex items-center bg-white text-cyan-600 hover:text-cyan-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="mr-3">💧</span>
                    ¡Instalar Bomba de Agua Ahora!
                  </a>
                  
                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-cyan-100">
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Plomeros Certificados
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faHashtag} className="mr-2" />
                      Suministro Garantizado
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      Instalación Profesional
                    </span>
                  </div>
                </div>
              )}

              {/* CTA para el artículo de instalaciones eléctricas */}
              {post.slug === 'instalaciones-electricas-riesgos-cdmx' && (
                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    ⚡ ¡Salva tu Hogar: Contrata Solo Electricistas Certificados!
                  </h2>
                  <p className="text-xl text-red-100 mb-8 leading-relaxed">
                    Tu familia está en riesgo. No esperes más. Conecta con electricistas certificados por CFE que instalan según las normas de seguridad más estrictas.
                  </p>
                  
                  <a 
                    href="/membresia"
                    className="inline-flex items-center bg-white text-red-600 hover:text-red-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="mr-3">⚡</span>
                    ¡Revisar Instalación Eléctrica Ya!
                  </a>
                  
                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-red-100">
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Electricistas CFE
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faHashtag} className="mr-2" />
                      Seguridad Garantizada
                    </span>
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      Inspección Profesional
                    </span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-8 mb-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiquetas:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
