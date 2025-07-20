// src/app/privacy/page.tsx
import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faInfoCircle, faCookieBite, faUsers, faShareAlt, faExclamationTriangle, faGavel, faSyncAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';

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

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Encabezado Mejorado */}
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
              <FontAwesomeIcon icon={faShieldAlt} className="text-4xl text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Política de Privacidad</h1>
            <p className="text-md text-gray-500 mt-2">Tu confianza es nuestra prioridad.</p>
            <p className="text-sm text-gray-500 mt-4">Última actualización: 19 de julio de 2025</p>
          </div>
          
          {/* Contenido en Tarjetas */}
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="lead text-xl">
                En Sumee, valoramos y respetamos tu privacidad. Esta Política describe cómo recopilamos, utilizamos y protegemos tu información personal conforme a las leyes mexicanas aplicables, incluyendo la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
              </p>
            </div>

            <PolicySection icon={faInfoCircle} title="Información que Recopilamos">
              <ul>
                <li><strong>Información Personal:</strong> Datos como tu nombre, correo electrónico, teléfono y dirección.</li>
                <li><strong>Información de Uso:</strong> Datos sobre tu interacción con nuestra plataforma.</li>
                <li><strong>Cookies y Tecnologías Similares:</strong> Para mejorar tu experiencia y analizar el tráfico.</li>
              </ul>
            </PolicySection>

            <PolicySection icon={faUsers} title="Uso de la Información">
              <ul>
                <li>Proporcionar y gestionar nuestros servicios.</li>
                <li>Personalizar tu experiencia en la plataforma.</li>
                <li>Comunicarnos contigo y enviarte actualizaciones.</li>
                <li>Mejorar nuestros servicios y funcionalidades.</li>
                <li>Cumplir con obligaciones legales.</li>
              </ul>
            </PolicySection>

            <PolicySection icon={faShareAlt} title="Compartición de la Información">
              <p>No compartimos tu información personal, excepto con:</p>
              <ul>
                <li><strong>Proveedores de Servicios:</strong> Empresas que nos ayudan a operar, bajo confidencialidad.</li>
                <li><strong>Obligaciones Legales:</strong> Si es requerido por ley.</li>
                <li><strong>Tu Consentimiento:</strong> Con tu permiso explícito.</li>
              </ul>
            </PolicySection>

            <PolicySection icon={faExclamationTriangle} title="Seguridad de la Información">
              <p>Implementamos medidas de seguridad para proteger tu información, aunque ninguna transmisión por Internet es 100% segura.</p>
            </PolicySection>

            <PolicySection icon={faGavel} title="Tus Derechos (ARCO)">
              <p>
                Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos. Para ejercerlos, contáctanos en <a href="mailto:sumeeapp.com@gmail.com" className="text-blue-600 hover:underline">sumeeapp.com@gmail.com</a>.
              </p>
            </PolicySection>

            <PolicySection icon={faSyncAlt} title="Cambios a esta Política">
              <p>Nos reservamos el derecho de actualizar esta política. Te notificaremos sobre cambios significativos. Te recomendamos revisarla periódicamente.</p>
            </PolicySection>
            
            <div className="mt-12 border-t pt-8 bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-blue-600 mr-4" />
                    <h2 className="text-2xl font-semibold text-gray-800">Contacto</h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 mt-4 pl-10">
                    <p>Si tienes preguntas o inquietudes, puedes contactarnos en:</p>
                    <address className="not-italic mt-2">
                        <strong>Nuo Networks</strong><br />
                        Atenas 1-1 Col San Alvaro, Azcapotzalco<br />
                        Ciudad de México, C.P. 02090<br />
                        <a href="mailto:sumeeapp.com@gmail.com" className="text-blue-600 hover:underline">Sumeeapp.com@gmail.com</a><br />
                        <a href="tel:+525567283971" className="text-blue-600 hover:underline">+52 55 6728 3971</a>
                    </address>
                </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}