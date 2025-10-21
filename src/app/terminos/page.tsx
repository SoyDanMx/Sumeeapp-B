// src/app/terminos/page.tsx
import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faUsers, 
  faUserShield,
  faExclamationTriangle,
  faCreditCard,
  faShieldAlt,
  faGavel,
  faBan,
  faRocket,
  faPhone,
  faEnvelope,
  faQuestionCircle,
  faHandshake,
  faChartLine,
  faCertificate,
  faClock,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

// Componente para las secciones, para no repetir código
const TermsSection = ({ icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
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

export default function TerminosPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado Mejorado */}
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
              <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Términos de Servicio</h1>
            <p className="text-lg text-gray-600 mt-2">Las reglas para usar nuestra plataforma</p>
            <p className="text-sm text-gray-500 mt-4">Última actualización: 19 de julio de 2025</p>
          </div>
          
          {/* Contenido Principal */}
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl leading-relaxed mb-8">
                Bienvenido a <strong>Sumee App</strong>. Al utilizar nuestros servicios, aceptas estar sujeto a los siguientes 
                términos y condiciones. Por favor, léelos cuidadosamente, ya que constituyen un acuerdo legal vinculante 
                entre tú y Nuo Networks (Sumee App).
              </p>
            </div>

            <TermsSection 
              icon={faUsers} 
              title="1. Definiciones y Naturaleza de la Plataforma"
            >
              <div className="space-y-4">
                <p>
                  <strong>Sumee App</strong> es una plataforma digital que actúa como intermediario para conectar a usuarios 
                  que buscan servicios para el hogar ("<strong>Clientes</strong>") con proveedores de servicios independientes 
                  ("<strong>Profesionales</strong>") en la Ciudad de México y áreas metropolitanas.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Importante:</strong> Los Profesionales son contratistas independientes, no empleados de Sumee App. 
                    No somos responsables por sus acciones, servicios o conducta.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Servicios Incluidos:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Plomería, electricidad, HVAC y carpintería</li>
                    <li>Servicios de emergencia las 24 horas</li>
                    <li>Mantenimiento preventivo y correctivo</li>
                    <li>Instalaciones y reparaciones especializadas</li>
                  </ul>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faUserShield} 
              title="2. Registro y Cuentas de Usuario"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Requisitos de Registro:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Debes tener al menos 18 años de edad</li>
                    <li>Proporcionar información veraz y actualizada</li>
                    <li>Mantener actualizados tus datos de contacto</li>
                    <li>Crear una contraseña segura y confidencial</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Responsabilidades del Usuario:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Proteger la confidencialidad de tu cuenta</li>
                    <li>Notificar inmediatamente cualquier uso no autorizado</li>
                    <li>Ser responsable de todas las actividades en tu cuenta</li>
                    <li>No crear múltiples cuentas fraudulentas</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                    <strong>Violación de Términos:</strong> Nos reservamos el derecho de suspender o terminar 
                    cuentas que violen estos términos sin previo aviso.
                  </p>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faHandshake} 
              title="3. Uso de la Plataforma y Servicios"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Uso Permitido:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Solicitar servicios profesionales para tu hogar</li>
                    <li>Calificar y reseñar servicios recibidos</li>
                    <li>Comunicarte con profesionales a través de la plataforma</li>
                    <li>Acceder a información de servicios y precios</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Uso Prohibido:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-red-700">
                    <li>Solicitar servicios ilegales o peligrosos</li>
                    <li>Contactar profesionales fuera de la plataforma</li>
                    <li>Proporcionar información falsa o engañosa</li>
                    <li>Interferir con el funcionamiento de la plataforma</li>
                    <li>Realizar actividades comerciales no autorizadas</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
                      Buenas Prácticas
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Sé respetuoso y profesional</li>
                      <li>• Proporciona descripciones claras del trabajo</li>
                      <li>• Está disponible para la comunicación</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faBan} className="text-orange-600 mr-2" />
                      Restricciones
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• No solicites servicios fuera de horario apropiado</li>
                      <li>• No canceles servicios repetidamente</li>
                      <li>• Respeta la propiedad del profesional</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faCreditCard} 
              title="4. Pagos, Precios y Facturación"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Estructura de Precios:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Membresía Premium:</strong> Acceso a profesionales verificados y servicios prioritarios</li>
                    <li><strong>Tarifas de Servicio:</strong> Establecidas por los profesionales independientes</li>
                    <li><strong>Comisiones:</strong> Sumee App puede cobrar comisiones por facilitar la conexión</li>
                    <li><strong>Impuestos:</strong> Aplicables según la legislación mexicana vigente</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Métodos de Pago:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Tarjetas de crédito y débito (procesadas por Stripe)</li>
                    <li>PayPal y otras plataformas digitales</li>
                    <li>Transferencias bancarias para membresías</li>
                    <li>Efectivo directamente al profesional (según acuerdo)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Política de Reembolsos:</h4>
                  <p className="text-blue-700 text-sm">
                    Los reembolsos se procesan según la política específica de cada profesional y el tipo de servicio. 
                    Las membresías pueden ser canceladas dentro de los primeros 7 días sin penalización.
                  </p>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faShieldAlt} 
              title="5. Limitaciones de Responsabilidad"
            >
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-yellow-800">
                    <strong>Declaración Importante:</strong> Sumee App actúa únicamente como intermediario entre Clientes y Profesionales.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Limitaciones de Sumee App:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>No somos responsables por la calidad del trabajo de los profesionales</li>
                    <li>No garantizamos la disponibilidad de servicios específicos</li>
                    <li>No asumimos responsabilidad por daños materiales o lesiones</li>
                    <li>No controlamos las tarifas finales establecidas por profesionales</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Responsabilidades del Cliente:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Verificar credenciales y experiencia del profesional</li>
                    <li>Asegurar que el trabajo cumple con normativas locales</li>
                    <li>Mantener seguro el área de trabajo</li>
                    <li>Realizar pagos según los términos acordados</li>
                  </ul>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faCertificate} 
              title="6. Garantías y Estándares de Calidad"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Compromisos de Sumee App:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Verificar credenciales básicas de profesionales registrados</li>
                    <li>Facilitar comunicación entre clientes y profesionales</li>
                    <li>Procesar pagos de forma segura</li>
                    <li>Mantener registros de transacciones</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Garantías del Profesional:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Cumplir con estándares de calidad acordados</li>
                    <li>Usar materiales de calidad apropiada</li>
                    <li>Brindar garantías sobre su trabajo según su política</li>
                    <li>Mantener seguros profesionales actualizados</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Programa de Garantía Sumee:</h4>
                  <p className="text-green-700 text-sm">
                    En caso de disputas, Sumee App puede actuar como mediador y, en circunstancias específicas, 
                    proporcionar garantías limitadas para proyectos elegibles.
                  </p>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faExclamationTriangle} 
              title="7. Suspensión y Terminación"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Causas de Suspensión:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Violación repetida de estos términos de servicio</li>
                    <li>Comportamiento inapropiado con profesionales</li>
                    <li>Proporcionar información fraudulenta</li>
                    <li>No realizar pagos según los términos acordados</li>
                    <li>Actividades que comprometan la seguridad de la plataforma</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Proceso de Terminación:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Aviso:</strong> Notificación previa cuando sea posible</li>
                    <li><strong>Oportunidad de Apelación:</strong> 7 días para disputar la decisión</li>
                    <li><strong>Efecto Inmediato:</strong> En casos de violaciones graves</li>
                    <li><strong>Reactivación:</strong> Bajo ciertas condiciones y proceso de revisión</li>
                  </ul>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faGavel} 
              title="8. Resolución de Disputas"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Proceso de Resolución:</h4>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Comunicación Directa:</strong> Intentar resolver directamente con el profesional</li>
                    <li><strong>Mediación Sumee:</strong> Nuestro equipo puede facilitar la comunicación</li>
                    <li><strong>Revisión Formal:</strong> Proceso estructurado de evaluación de la disputa</li>
                    <li><strong>Procedimientos Legales:</strong> Como último recurso, según la jurisdicción aplicable</li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Jurisdicción y Ley Aplicable:</h4>
                  <p className="text-gray-700 text-sm">
                    Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta en los 
                    tribunales competentes de la Ciudad de México.
                  </p>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faRocket} 
              title="9. Modificaciones de los Términos"
            >
              <div className="space-y-4">
                <p>
                  Nos reservamos el derecho de modificar estos términos de servicio en cualquier momento. 
                  Los cambios significativos serán notificados con al menos 30 días de anticipación.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Notificaciones</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Email a la dirección registrada</li>
                      <li>• Aviso en la plataforma web</li>
                      <li>• Notificación push en la app</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Continuación del Uso</h4>
                    <p className="text-sm text-green-700">
                      El uso continuado de la plataforma después de los cambios constituye 
                      aceptación de los nuevos términos.
                    </p>
                  </div>
                </div>
              </div>
            </TermsSection>

            <TermsSection 
              icon={faChartLine} 
              title="10. Servicios Adicionales y Funcionalidades"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Características de la Plataforma:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>AI Assistant:</strong> Recomendaciones automáticas basadas en tu consulta</li>
                    <li><strong>Geolocalización:</strong> Para encontrar profesionales cercanos</li>
                    <li><strong>Chat en Vivo:</strong> Comunicación directa con profesionales</li>
                    <li><strong>Sistema de Calificaciones:</strong> Revisión y rating de servicios</li>
                    <li><strong>Programación Avanzada:</strong> Reservas y seguimiento de servicios</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Disponibilidad del Servicio:</h4>
                  <p className="text-gray-700">
                    Aunque nos esforzamos por mantener la plataforma disponible 24/7, no garantizamos 
                    un tiempo de actividad del 100%. Puede haber mantenimiento programado o interrupciones 
                    técnicas ocasionales.
                  </p>
                </div>
              </div>
            </TermsSection>
            
            <div className="mt-12 border-t pt-8 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-blue-600 mr-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Contacto y Soporte</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Información de Contacto:</h3>
                  <address className="not-italic text-gray-700">
                    <strong>Nuo Networks (Sumee App)</strong><br />
                    Atenas 1-1 Col San Alvaro, Azcapotzalco<br />
                    Ciudad de México, C.P. 02090<br />
                    <a href="mailto:contacto@sumeeapp.com" className="text-blue-600 hover:underline">
                      contacto@sumeeapp.com
                    </a><br />
                    <a href="tel:+525567283971" className="text-blue-600 hover:underline">
                      +52 55 6728 3971
                    </a>
                  </address>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Horarios de Atención:</h3>
                  <div className="text-gray-700 space-y-1">
                    <p><strong>Cliente:</strong> Lunes a Viernes 8:00 AM - 8:00 PM</p>
                    <p><strong>Emergencias:</strong> 24/7 para servicios críticos</p>
                    <p><strong>Soporte Técnico:</strong> Lunes a Domingo 9:00 AM - 9:00 PM</p>
                    <p className="text-sm text-gray-600">
                      Tiempo de respuesta: 2-4 horas en horario laboral
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-100 rounded-lg">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">¿Tienes preguntas sobre estos términos?</h3>
                  <p className="text-blue-700 text-sm">
                    Nuestro equipo legal está disponible para aclarar cualquier duda sobre estos términos de servicio. 
                    Tu comprensión y cumplimiento de estos términos asegura una experiencia positiva para todos.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p>
                Al utilizar Sumee App, confirmas que has leído, entendido y aceptado estos términos de servicio 
                y nuestra <a href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
