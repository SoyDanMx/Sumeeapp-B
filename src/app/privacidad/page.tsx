// src/app/privacidad/page.tsx
import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faInfoCircle, 
  faCookieBite, 
  faUsers, 
  faShareAlt, 
  faExclamationTriangle, 
  faGavel, 
  faSyncAlt, 
  faEnvelope,
  faLock,
  faUserShield,
  faEye,
  faMobile,
  faDatabase,
  faGlobe,
  faQuestionCircle,
  faChartLine,
  faBullhorn
} from '@fortawesome/free-solid-svg-icons';

// Componente para las secciones, para no repetir código
const PolicySection = ({ icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="mt-10">
    <div className="flex items-center">
      <FontAwesomeIcon icon={icon} className="text-2xl text-blue-600 mr-4" />
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="prose prose-lg max-w-none text-gray-700 mt-4 pl-10">
      {children}
    </div>
  </div>
);

export default function PrivacidadPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado Mejorado */}
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
              <FontAwesomeIcon icon={faShieldAlt} className="text-4xl text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Política de Privacidad</h1>
            <p className="text-lg text-gray-600 mt-2">Tu confianza es nuestra prioridad</p>
            <p className="text-sm text-gray-500 mt-4">Última actualización: 19 de julio de 2025</p>
          </div>
          
          {/* Contenido Principal */}
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl leading-relaxed mb-8">
                En <strong>Sumee</strong>, valoramos y respetamos tu privacidad. Esta Política describe cómo recopilamos, 
                utilizamos y protegemos tu información personal conforme a las leyes mexicanas aplicables, 
                incluyendo la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</strong> 
                y el <strong>Reglamento General de Protección de Datos (RGPD)</strong> aplicable.
              </p>
            </div>

            <PolicySection 
              icon={faInfoCircle} 
              title="1. Información que Recopilamos"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Información Personal:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Datos de identificación: nombre completo, correo electrónico, teléfono</li>
                    <li>Información de contacto: dirección física, código postal</li>
                    <li>Datos profesionales: especialidades, experiencia, certificaciones</li>
                    <li>Información financiera: datos de facturación y pago (encriptados)</li>
                    <li>Documentos de verificación: IMSS, identificaciones oficiales</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Información de Uso:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Datos de navegación y comportamiento en la plataforma</li>
                    <li>Historial de servicios solicitados y proporcionados</li>
                    <li>Calificaciones y reseñas de servicios</li>
                    <li>Ubicación geográfica (cuando sea necesario para servicios)</li>
                    <li>Preferencias de comunicación y configuración</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cookies y Tecnologías Similares:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Cookies esenciales para el funcionamiento de la plataforma</li>
                    <li>Cookies de análisis y mejora de la experiencia</li>
                    <li>Cookies de marketing y publicidad (con consentimiento)</li>
                    <li>Pixels de seguimiento para métricas de rendimiento</li>
                  </ul>
                </div>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faUsers} 
              title="2. Uso de la Información"
            >
              <div className="space-y-3">
                <p><strong>Finalidades principales:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Proporcionar y gestionar nuestros servicios de conexión profesional</li>
                  <li>Facilitar la comunicación entre usuarios y profesionales</li>
                  <li>Procesar pagos y gestionar membresías</li>
                  <li>Verificar identidades y credenciales profesionales</li>
                  <li>Personalizar tu experiencia en la plataforma</li>
                  <li>Generar y enviar facturas y comprobantes</li>
                </ul>
                
                <p className="mt-4"><strong>Finalidades secundarias:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Comunicarnos contigo sobre actualizaciones y mejoras</li>
                  <li>Enviar ofertas promocionales y contenido relevante</li>
                  <li>Realizar análisis de mercado y estudios de satisfacción</li>
                  <li>Detectar y prevenir fraudes y actividades maliciosas</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                </ul>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faShareAlt} 
              title="3. Compartición de la Información"
            >
              <div className="space-y-4">
                <p>No compartimos tu información personal con terceros, <strong>excepto</strong> en los siguientes casos:</p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Con proveedores de servicios confiables:</h4>
                  <ul className="list-disc pl-6 text-blue-700 space-y-1">
                    <li>Procesadores de pago (Stripe, PayPal) para transacciones</li>
                    <li>Servicios de comunicación (WhatsApp, Email) bajo confidencialidad</li>
                    <li>Herramientas de análisis (Google Analytics) con datos anonimizados</li>
                    <li>Servicios de hosting y almacenamiento seguro</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Obligaciones legales:</h4>
                  <ul className="list-disc pl-6 text-red-700 space-y-1">
                    <li>Cuando sea requerido por autoridades competentes</li>
                    <li>Para cumplir con órdenes judiciales o procesos legales</li>
                    <li>En caso de emergencias que afecten la seguridad pública</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Con tu consentimiento explícito:</h4>
                  <ul className="list-disc pl-6 text-green-700 space-y-1">
                    <li>Para servicios adicionales que solicitas</li>
                    <li>Para compartir testimonios y casos de éxito</li>
                    <li>Para colaboraciones con empresas asociadas</li>
                  </ul>
                </div>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faLock} 
              title="4. Seguridad de la Información"
            >
              <div className="space-y-4">
                <p>Implementamos múltiples capas de seguridad para proteger tu información:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <FontAwesomeIcon icon={faDatabase} className="text-green-600 mr-2" />
                      Protección de Datos
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Encriptación SSL/TLS en todas las comunicaciones</li>
                      <li>• Almacenamiento encriptado en bases de datos seguras</li>
                      <li>• Acceso restringido con autenticación multi-factor</li>
                      <li>• Copias de seguridad regulares y redundantes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <FontAwesomeIcon icon={faUserShield} className="text-blue-600 mr-2" />
                      Protección de Acceso
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Contraseñas hasheadas con algoritmos seguros</li>
                      <li>• Autenticación de dos factores opcional</li>
                      <li>• Monitoreo de accesos y actividad sospechosa</li>
                      <li>• Actualizaciones regulares de seguridad</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-yellow-800">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    <strong>Advertencia importante:</strong> Aunque implementamos las mejores prácticas de seguridad, 
                    ninguna transmisión por Internet es 100% segura. Te recomendamos usar contraseñas fuertes 
                    y mantener actualizada tu información de contacto.
                  </p>
                </div>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faEye} 
              title="5. Tus Derechos (ARCO y más)"
            >
              <div className="space-y-4">
                <p>Conforme a la legislación mexicana y el RGPD, tienes los siguientes derechos:</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-3">Derechos ARCO:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold mr-2">A</span>
                        <span><strong>Acceder:</strong> Solicitar información sobre tus datos personales</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold mr-2">R</span>
                        <span><strong>Rectificar:</strong> Corregir datos inexactos o incompletos</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold mr-2">C</span>
                        <span><strong>Cancelar:</strong> Eliminar tus datos cuando ya no sean necesarios</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-semibold mr-2">O</span>
                        <span><strong>Oponerte:</strong> Limitar el uso de tus datos personales</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-3">Derechos Adicionales:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Portabilidad:</strong> Obtener tus datos en formato legible</li>
                      <li>• <strong>Limitación:</strong> Restringir el procesamiento de datos</li>
                      <li>• <strong>Revocación:</strong> Retirar el consentimiento en cualquier momento</li>
                      <li>• <strong>No perfilado:</strong> Oponerte a decisiones automatizadas</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-blue-800">
                    <strong>Para ejercer tus derechos:</strong> Envía una solicitud a 
                    <a href="mailto:privacidad@sumeeapp.com" className="text-blue-600 hover:underline ml-1">
                      privacidad@sumeeapp.com
                    </a> 
                    con tu identificación oficial. Te responderemos en máximo 20 días hábiles.
                  </p>
                </div>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faCookieBite} 
              title="6. Cookies y Tecnologías de Seguimiento"
            >
              <div className="space-y-4">
                <p>Utilizamos diferentes tipos de cookies para mejorar tu experiencia:</p>
                
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <FontAwesomeIcon icon={faLock} className="text-green-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-green-800">Cookies Esenciales</h4>
                      <p className="text-sm text-green-700">Necesarias para el funcionamiento básico de la plataforma</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <FontAwesomeIcon icon={faChartLine} className="text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Cookies de Análisis</h4>
                      <p className="text-sm text-blue-700">Para entender cómo usas nuestra plataforma y mejorarla</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <FontAwesomeIcon icon={faBullhorn} className="text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-purple-800">Cookies de Marketing</h4>
                      <p className="text-sm text-purple-700">Para mostrarte contenido relevante (solo con consentimiento)</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Puedes gestionar tus preferencias de cookies desde la configuración de tu navegador 
                  o contactándonos directamente.
                </p>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faGlobe} 
              title="7. Transferencias Internacionales"
            >
              <div className="space-y-3">
                <p>Algunos de nuestros proveedores pueden estar ubicados fuera de México:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Estados Unidos:</strong> Servicios de hosting y procesamiento (con garantías adecuadas)</li>
                  <li><strong>Unión Europea:</strong> Herramientas de análisis (cumplimiento RGPD)</li>
                  <li><strong>Canadá:</strong> Servicios de comunicación segura</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">
                    Garantizamos que todas las transferencias internacionales cumplen con los estándares 
                    de protección de datos aplicables y están respaldadas por cláusulas contractuales 
                    estándar aprobadas por las autoridades competentes.
                  </p>
                </div>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faMobile} 
              title="8. Aplicaciones Móviles"
            >
              <div className="space-y-3">
                <p>Nuestras aplicaciones móviles pueden recopilar información adicional:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ubicación precisa (para servicios de geolocalización)</li>
                  <li>Información del dispositivo (modelo, sistema operativo, versiones)</li>
                  <li>Permisos de cámara y micrófono (para videollamadas técnicas)</li>
                  <li>Notificaciones push (configurables desde la app)</li>
                </ul>
                <p className="text-sm text-gray-600">
                  Toda esta información se utiliza únicamente para proporcionar los servicios 
                  solicitados y mejorar tu experiencia.
                </p>
              </div>
            </PolicySection>

            <PolicySection 
              icon={faSyncAlt} 
              title="9. Cambios a esta Política"
            >
              <div className="space-y-3">
                <p>Nos reservamos el derecho de actualizar esta política cuando sea necesario.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Cambios menores:</strong> Actualizaciones técnicas o correcciones tipográficas</li>
                  <li><strong>Cambios significativos:</strong> Nuevos usos de datos o cambios en la estructura</li>
                </ul>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Te notificaremos sobre cambios importantes a través de:</strong>
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-blue-700 space-y-1">
                    <li>Email a la dirección registrada en tu cuenta</li>
                    <li>Aviso prominente en nuestra plataforma web</li>
                    <li>Notificación push en la aplicación móvil</li>
                  </ul>
                </div>
              </div>
            </PolicySection>
            
            <div className="mt-12 border-t pt-8 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-blue-600 mr-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Contacto y Ejercicio de Derechos</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Datos de Contacto:</h3>
                  <address className="not-italic text-gray-700">
                    <strong>Nuo Networks</strong><br />
                    Atenas 1-1 Col San Alvaro, Azcapotzalco<br />
                    Ciudad de México, C.P. 02090<br />
                    <a href="mailto:privacidad@sumeeapp.com" className="text-blue-600 hover:underline">
                      privacidad@sumeeapp.com
                    </a><br />
                    <a href="tel:+525567283971" className="text-blue-600 hover:underline">
                      +52 55 6728 3971
                    </a>
                  </address>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Horarios de Atención:</h3>
                  <p className="text-gray-700">
                    Lunes a Viernes: 9:00 AM - 6:00 PM (GMT-6)<br />
                    Tiempo de respuesta: 24-48 horas<br />
                    <span className="text-sm text-gray-600">
                      Para solicitudes de ejercicio de derechos ARCO: máximo 20 días hábiles
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-100 rounded-lg">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">¿Tienes dudas sobre esta política?</h3>
                  <p className="text-blue-700 text-sm">
                    Nuestro equipo de privacidad está disponible para ayudarte a entender 
                    cómo protegemos tu información y cómo puedes ejercer tus derechos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
