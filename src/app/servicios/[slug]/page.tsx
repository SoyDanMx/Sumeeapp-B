import { notFound } from 'next/navigation';
import DisciplineAIHelper from '@/components/services/DisciplineAIHelper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faWrench, 
  faThermometerHalf, 
  faShieldAlt,
  faNetworkWired,
  faBroom,
  faBug,
  faCog,
  faBuilding,
  faCheckCircle,
  faStar,
  faClock,
  faShield,
  faUsers,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp as faWhatsappBrand } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const DISCIPLINE_CONFIG = {
  'electricidad': {
    name: 'Electricidad',
    icon: faLightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    gradient: 'from-yellow-400 to-orange-500',
    description: 'Instalaciones eléctricas, reparaciones y mantenimiento con electricistas certificados. Trabajos seguros y garantizados.',
    services: [
      'Instalación de contactos',
      'Reparación de cortocircuitos', 
      'Instalación de luminarias',
      'Cableado eléctrico',
      'Instalación de ventiladores',
      'Reparación de tableros',
      'Instalación de timbres',
      'Mantenimiento eléctrico'
    ],
    benefits: [
      'Electricistas Certificados',
      'Trabajos Seguros',
      'Garantía de Calidad'
    ],
    benefitsDescriptions: [
      'Profesionales con licencia',
      'Cumplimos todas las normas eléctricas',
      'Trabajos garantizados por 1 año'
    ]
  },
  'plomeria': {
    name: 'Plomería',
    icon: faWrench,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-400 to-cyan-500',
    description: 'Reparaciones, instalaciones y mantenimiento de sistemas hidráulicos. Soluciones rápidas y duraderas.',
    services: [
      'Reparación de fugas',
      'Desagües tapados',
      'Instalación de tinacos',
      'Reparación de llaves',
      'Instalación de calentadores',
      'Mantenimiento de cisternas',
      'Reparación de inodoros',
      'Instalación de tuberías'
    ],
    benefits: [
      'Plomeros Certificados',
      'Respuesta Rápida',
      'Garantía Completa'
    ],
    benefitsDescriptions: [
      'Profesionales con licencia',
      'Servicio de emergencia 24/7',
      'Trabajos garantizados por 1 año'
    ]
  },
  'aire-acondicionado': {
    name: 'Aire Acondicionado',
    icon: faThermometerHalf,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    gradient: 'from-green-400 to-teal-500',
    description: 'Instalación, reparación y mantenimiento de sistemas de climatización. Eficiencia energética garantizada.',
    services: [
      'Instalación de equipos',
      'Reparación de compresores',
      'Mantenimiento preventivo',
      'Limpieza de ductos',
      'Recarga de gas',
      'Reparación de termostatos',
      'Optimización energética',
      'Instalación de ventiladores'
    ],
    benefits: [
      'Técnicos Especializados',
      'Eficiencia Energética',
      'Mantenimiento Preventivo'
    ],
    benefitsDescriptions: [
      'Certificados en climatización',
      'Equipos de alta eficiencia',
      'Programas de mantenimiento'
    ]
  },
  'cctv': {
    name: 'CCTV y Seguridad',
    icon: faShieldAlt,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    gradient: 'from-purple-400 to-pink-500',
    description: 'Sistemas de seguridad, cámaras de vigilancia y alarmas. Protección integral para tu hogar o negocio.',
    services: [
      'Instalación de cámaras',
      'Sistemas de alarmas',
      'Monitoreo 24/7',
      'Reparación de equipos',
      'Configuración de redes',
      'Integración con WiFi',
      'Sistemas de acceso',
      'Mantenimiento preventivo'
    ],
    benefits: [
      'Especialistas en Seguridad',
      'Tecnología Avanzada',
      'Monitoreo Continuo'
    ],
    benefitsDescriptions: [
      'Certificados en seguridad',
      'Equipos de última generación',
      'Vigilancia 24/7'
    ]
  }
};

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  
  const config = DISCIPLINE_CONFIG[slug as keyof typeof DISCIPLINE_CONFIG];
  
  if (!config) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${config.gradient} text-white py-16`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <FontAwesomeIcon icon={config.icon} className="text-6xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Servicios de {config.name} en CDMX
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {config.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/client"
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Solicitar Servicio
              </Link>
              <Link 
                href="/tecnicos"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Ver Técnicos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Nuestros Servicios de {config.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.services.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{service}</h3>
                  <div className="w-12 h-1 bg-blue-500 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              ¿Por qué elegir Sumee App?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 ${config.bgColor} ${config.borderColor} border-2 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <FontAwesomeIcon icon={config.icon} className={`text-2xl ${config.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit}</h3>
                  <p className="text-gray-600">{config.benefitsDescriptions[index]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Confianza y Calidad Garantizada
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon={faShield} className="text-4xl text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Técnicos verificados</h3>
                <p className="text-gray-600">Todos nuestros profesionales están certificados</p>
              </div>
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon={faClock} className="text-4xl text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Respuesta en 2 horas</h3>
                <p className="text-gray-600">Servicio rápido y eficiente</p>
              </div>
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon={faStar} className="text-4xl text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">4.8/5 estrellas promedio</h3>
                <p className="text-gray-600">Calificación de nuestros clientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas un {config.name} Ahora?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Solicita tu servicio y recibe respuesta en menos de 2 horas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/client"
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Solicitar Servicio Gratis
              </Link>
              <Link 
                href="/tecnicos"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Ver Técnicos Disponibles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Contáctanos</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+525512345678"
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <FontAwesomeIcon icon={faPhone} />
                <span>Llamar</span>
              </a>
              <a 
                href="https://wa.me/525512345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                <FontAwesomeIcon icon={faWhatsappBrand} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* AI Helper */}
      <DisciplineAIHelper
        discipline={slug}
        disciplineName={config.name}
        disciplineIcon={config.icon}
        disciplineColor={config.color}
        onMembershipRedirect={() => {
          window.location.href = '/membresia';
        }}
      />
    </div>
  );
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const config = DISCIPLINE_CONFIG[slug as keyof typeof DISCIPLINE_CONFIG];
  
  if (!config) {
    return {
      title: 'Servicio no encontrado',
      description: 'El servicio solicitado no está disponible.'
    };
  }

  return {
    title: `Servicios de ${config.name} en CDMX | Sumee App`,
    description: config.description,
    keywords: `${config.name.toLowerCase()}, técnicos, profesionales, CDMX, servicios, reparación, instalación`,
    openGraph: {
      title: `Servicios de ${config.name} en CDMX`,
      description: config.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Servicios de ${config.name} en CDMX`,
      description: config.description,
    },
  };
}