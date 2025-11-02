import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Service } from "@/types/supabase";
import DisciplineAIHelper from "@/components/services/DisciplineAIHelper";
import ScrollToAIHelper from "@/components/services/ScrollToAIHelper";
import AIHelperHashHandler from "@/components/services/AIHelperHashHandler";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faLightbulb,
  faThermometerHalf,
  faShieldAlt,
  faCog,
  faBroom,
  faBuilding,
  faBug,
  faCheckCircle,
  faStar,
  faUsers,
  faClock,
  faShield,
  faTools,
  faCogs,
  faHammer,
  faPaintRoller,
  faLeaf,
  faVideo,
  faWifi,
  faHardHat,
  faSquare,
  faVolumeUp,
  faTint,
  faCouch,
  faFire,
  faKey,
  faInfinity,
  faTrophy,
  faConciergeBell,
  faHistory,
  faQuestionCircle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";

// Configuración estática para disciplinas (sin dependencia de Supabase)
const DISCIPLINE_CONFIG = {
  plomeria: {
    name: "Plomería",
    icon: faWrench,
    gradient: "from-blue-600 to-blue-800",
    specialistRole: "Ingeniero en Sistemas Hidráulicos",
    description:
      "Reparaciones, instalaciones y mantenimiento de sistemas hidráulicos",
    services: [
      "Reparación de fugas",
      "Instalación de tinacos",
      "Desazolve de drenajes",
      "Instalación de calentadores",
      "Reparación de llaves",
      "Instalación de sanitarios",
    ],
  },
  electricidad: {
    name: "Electricidad",
    icon: faLightbulb,
    gradient: "from-yellow-500 to-orange-600",
    specialistRole: "Ingeniero Eléctrico",
    description: "Instalaciones eléctricas, reparaciones y mantenimiento",
    services: [
      "Instalación de contactos",
      "Reparación de cortos circuitos",
      "Instalación de luminarias",
      "Cableado eléctrico",
      "Instalación de ventiladores",
      "Reparación de tableros",
    ],
  },
  "aire-acondicionado": {
    name: "Aire Acondicionado",
    icon: faThermometerHalf,
    gradient: "from-green-500 to-teal-600",
    specialistRole: "Ingeniero en HVAC",
    description:
      "Instalación, reparación y mantenimiento de sistemas de climatización",
    services: [
      "Instalación de minisplits",
      "Mantenimiento preventivo",
      "Reparación de compresores",
      "Limpieza de filtros",
      "Recarga de gas",
      "Instalación de ductos",
    ],
  },
  cctv: {
    name: "CCTV y Seguridad",
    icon: faShieldAlt,
    gradient: "from-purple-600 to-indigo-700",
    specialistRole: "Especialista en Redes y Ciberseguridad",
    description: "Sistemas de seguridad, cámaras de vigilancia y alarmas",
    services: [
      "Instalación de cámaras",
      "Sistemas de alarma",
      "Monitoreo 24/7",
      "Control de acceso",
      "DVR y NVR",
      "Vigilancia remota",
    ],
  },
  carpinteria: {
    name: "Carpintería",
    icon: faHammer,
    gradient: "from-amber-600 to-orange-700",
    specialistRole: "Arquitecto",
    description: "Trabajos en madera, muebles y estructuras",
    services: [
      "Fabricación de muebles",
      "Reparación de puertas",
      "Instalación de ventanas",
      "Trabajos en madera",
      "Restauración",
      "Carpintería fina",
    ],
  },
  limpieza: {
    name: "Limpieza",
    icon: faBroom,
    gradient: "from-pink-500 to-rose-600",
    specialistRole: "Especialista en Servicios Generales",
    description: "Servicios de limpieza residencial y comercial",
    services: [
      "Limpieza residencial",
      "Limpieza comercial",
      "Limpieza profunda",
      "Limpieza post-obra",
      "Limpieza de alfombras",
      "Limpieza de cristales",
    ],
  },
  jardineria: {
    name: "Jardinería",
    icon: faLeaf,
    gradient: "from-green-600 to-emerald-700",
    specialistRole: "Especialista en Servicios Generales",
    description: "Mantenimiento de jardines y áreas verdes",
    services: [
      "Poda de árboles",
      "Mantenimiento de jardines",
      "Instalación de riego",
      "Diseño de jardines",
      "Fertilización",
      "Control de plagas",
    ],
  },
  fumigacion: {
    name: "Fumigación",
    icon: faBug,
    gradient: "from-red-600 to-red-800",
    specialistRole: "Técnico en Fumigación",
    description: "Control de plagas y fumigación profesional",
    services: [
      "Fumigación residencial",
      "Control de cucarachas",
      "Eliminación de roedores",
      "Fumigación comercial",
      "Control de mosquitos",
      "Tratamiento preventivo",
    ],
  },
  pintura: {
    name: "Pintura",
    icon: faPaintRoller,
    gradient: "from-indigo-600 to-purple-700",
    specialistRole: "Arquitecto",
    description: "Pintura interior y exterior, impermeabilización y acabados",
    services: [
      "Pintura interior",
      "Pintura exterior",
      "Impermeabilización",
      "Acabados especiales",
      "Restauración de fachadas",
      "Pintura industrial",
    ],
  },
  wifi: {
    name: "Redes y WiFi",
    icon: faWifi,
    gradient: "from-cyan-600 to-blue-700",
    specialistRole: "Especialista en Redes y Ciberseguridad",
    description: "Instalación y configuración de redes informáticas y WiFi",
    services: [
      "Instalación de WiFi",
      "Configuración de routers",
      "Cableado estructurado",
      "Redes empresariales",
      "Seguridad de red",
      "Optimización de señal",
    ],
  },
  tablaroca: {
    name: "Tablaroca",
    icon: faSquare,
    gradient: "from-gray-600 to-gray-800",
    specialistRole: "Arquitecto",
    description: "Instalación y reparación de sistemas de tablaroca",
    services: [
      "Instalación de tablaroca",
      "Reparación de grietas",
      "Acabados en tablaroca",
      "Instalación de cielos",
      "Muros divisorios",
      "Restauración de tablaroca",
    ],
  },
  construccion: {
    name: "Construcción",
    icon: faHardHat,
    gradient: "from-orange-600 to-red-700",
    specialistRole: "Ingeniero Civil",
    description: "Construcción, remodelación y obras civiles",
    services: [
      "Construcción residencial",
      "Remodelación integral",
      "Obras civiles",
      "Albañilería",
      "Azulejos y pisos",
      "Construcción comercial",
    ],
  },
  arquitectos: {
    name: "Arquitectos & Ingenieros",
    icon: faBuilding,
    gradient: "from-teal-600 to-cyan-700",
    specialistRole: "Arquitecto",
    description: "Servicios de arquitectura, ingeniería y diseño",
    services: [
      "Diseño arquitectónico",
      "Planos y proyectos",
      "Supervisión de obra",
      "Consultoría técnica",
      "Diseño de interiores",
      "Ingeniería estructural",
    ],
  },
};

// 1. OBTENCIÓN DE DATOS SEGURA
async function getServiceData(slug: string): Promise<Service | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      // Imprime el error en los logs del servidor para depuración
      console.error(
        `Error fetching service with slug "${slug}":`,
        error.message
      );
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Exception fetching service with slug "${slug}":`, error);
    return null;
  }
}

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const config = DISCIPLINE_CONFIG[slug as keyof typeof DISCIPLINE_CONFIG];

  if (!config) {
    return {
      title: "Servicio no encontrado - Sumee App",
      description: "El servicio solicitado no está disponible.",
    };
  }

  return {
    title: `${config.name} - Servicios Profesionales en CDMX | Sumee App`,
    description: `${
      config.description
    }. Técnicos verificados y especializados en ${config.name.toLowerCase()}.`,
    keywords: `${config.name.toLowerCase()}, servicios, técnicos, CDMX, reparación, instalación`,
    openGraph: {
      title: `${config.name} - Sumee App`,
      description: config.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.name} - Sumee App`,
      description: config.description,
    },
  };
}

// 2. EL COMPONENTE DE PÁGINA ASÍNCRONO
export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;

  // Validación robusta del slug
  if (!slug || typeof slug !== "string") {
    notFound();
  }

  const config = DISCIPLINE_CONFIG[slug as keyof typeof DISCIPLINE_CONFIG];

  if (!config) {
    notFound();
  }

  // Intentar obtener datos de Supabase, pero no fallar si no están disponibles
  let serviceData = null;
  try {
    serviceData = await getServiceData(slug);
  } catch (error) {
    console.error("Error fetching service data, using static config:", error);
  }

  // Si no hay datos de Supabase, usar la configuración estática
  const service = serviceData || {
    name: config.name,
    description: config.description,
    slug: slug,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Handler para scroll automático cuando hay hash #ai-helper en la URL */}
      <AIHelperHashHandler />

      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${config.gradient} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FontAwesomeIcon
              icon={config.icon}
              className="text-6xl mb-6 text-white opacity-90"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {service.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              {service.description || config.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/dashboard/client"
                className="bg-white text-gray-900 font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                title={`Solicitar servicio de ${service.name.toLowerCase()}`}
              >
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                Solicitar Servicio
              </a>
              <a
                href="/tecnicos"
                className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 inline-flex items-center justify-center"
                title={`Ver técnicos especializados en ${service.name.toLowerCase()}`}
              >
                <FontAwesomeIcon icon={faStar} className="mr-2" />
                Ver Técnicos
              </a>
              <ScrollToAIHelper serviceName={service.name} discipline={slug} />
            </div>
          </div>
        </div>
      </div>

      {/* Servicios Específicos */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios de {service.name}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Técnicos especializados y verificados para todos tus proyectos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.services.map((serviceItem, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <FontAwesomeIcon
                  icon={config.icon}
                  className="text-2xl text-blue-600 mb-3"
                />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {serviceItem}
                </h3>
                <p className="text-sm text-gray-600">
                  Servicio profesional con garantía
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Características del Servicio */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faShield}
                className="text-4xl text-green-600 mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Técnicos Verificados
              </h3>
              <p className="text-gray-600">
                Todos nuestros profesionales pasan por un proceso de
                verificación riguroso
              </p>
            </div>
            <div className="text-center">
              <FontAwesomeIcon
                icon={faClock}
                className="text-4xl text-blue-600 mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Respuesta Rápida
              </h3>
              <p className="text-gray-600">
                Conectamos con el técnico más cercano en menos de 30 minutos
              </p>
            </div>
            <div className="text-center">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-4xl text-purple-600 mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Garantía Total
              </h3>
              <p className="text-gray-600">
                Todos nuestros servicios incluyen garantía de satisfacción
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Helper para esta disciplina específica */}
      <div id="ai-helper" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DisciplineAIHelper
            discipline={slug}
            disciplineName={service.name}
            disciplineIcon={config.icon}
            disciplineColor="blue"
          />
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para resolver tu problema de {service.name.toLowerCase()}?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Conecta con nuestros técnicos especializados y obtén una solución
            profesional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard/client"
              className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
              title={`Solicitar servicio profesional de ${service.name.toLowerCase()}`}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Solicitar Servicio Ahora
            </a>
            <a
              href={`https://wa.me/5215636741156?text=Hola, necesito ayuda con servicios de ${service.name.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center"
              title={`Consultar por WhatsApp sobre ${service.name.toLowerCase()}`}
            >
              <FontAwesomeIcon icon={faWhatsappBrand} className="mr-2" />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
