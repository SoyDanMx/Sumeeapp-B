import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server-new';
import { Service, ServiceCategory } from '@/types/supabase';
import ServiceCard from '@/components/services/ServiceCard';
import ServiceSearch from '@/components/services/ServiceSearch';
import AIAdvisor from '@/components/services/AIAdvisor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faFire, 
  faTools, 
  faCog, 
  faLaptop, 
  faBuilding,
  faQuestionCircle,
  faWrench,
  faLightbulb,
  faFan,
  faKey,
  faPaintRoller,
  faBroom,
  faLeaf,
  faHammer,
  faVideo,
  faWifi,
  faBug,
  faHardHat
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp as faWhatsappBrand } from '@fortawesome/free-brands-svg-icons';

// Función para obtener servicios desde Supabase
async function getServices(): Promise<Service[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('is_popular', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data || [];
}

// Componente para categorías principales
function CategoryButtons() {
  const categories = [
    { name: 'Urgencias', icon: faFire, color: 'red', description: 'Problemas urgentes' },
    { name: 'Mantenimiento', icon: faTools, color: 'blue', description: 'Cuidado del hogar' },
    { name: 'Instalaciones', icon: faWrench, color: 'green', description: 'Nuevas instalaciones' },
    { name: 'Proyectos', icon: faBuilding, color: 'purple', description: 'Proyectos grandes' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {categories.map((category) => (
        <button
          key={category.name}
          className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
        >
          <FontAwesomeIcon 
            icon={category.icon} 
            className={`text-3xl mb-3 text-${category.color}-500 group-hover:text-${category.color}-600 transition-colors`}
          />
          <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
          <p className="text-sm text-gray-500">{category.description}</p>
        </button>
      ))}
    </div>
  );
}

// Componente para sección de servicios populares
function PopularServicesSection({ services }: { services: Service[] }) {
  const popularServices = services.filter(service => service.is_popular);

  if (popularServices.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-2xl" />
          <h2 className="text-3xl font-bold text-gray-900">Servicios Más Populares</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Los servicios más solicitados por nuestros clientes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {popularServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

// Componente para sección de urgencias
function EmergencyServicesSection({ services }: { services: Service[] }) {
  const emergencyServices = services.filter(service => 
    service.category === 'Urgencias' && !service.is_popular
  );

  if (emergencyServices.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FontAwesomeIcon icon={faFire} className="text-red-500 text-2xl" />
          <h2 className="text-3xl font-bold text-gray-900">Urgencias del Hogar</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Problemas que requieren atención inmediata
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {emergencyServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

// Componente para sección de mantenimiento
function MaintenanceServicesSection({ services }: { services: Service[] }) {
  const maintenanceServices = services.filter(service => 
    service.category === 'Mantenimiento'
  );

  if (maintenanceServices.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FontAwesomeIcon icon={faTools} className="text-blue-500 text-2xl" />
          <h2 className="text-3xl font-bold text-gray-900">Mantenimiento y Mejoras</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Servicios para mantener y mejorar tu hogar
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {maintenanceServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

// Componente para sección de tecnología
function TechnologyServicesSection({ services }: { services: Service[] }) {
  const techServices = services.filter(service => 
    service.category === 'Tecnología'
  );

  if (techServices.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FontAwesomeIcon icon={faLaptop} className="text-purple-500 text-2xl" />
          <h2 className="text-3xl font-bold text-gray-900">Tecnología y Seguridad</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Soluciones tecnológicas para tu hogar y oficina
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {techServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

// Componente para sección de servicios especializados
function SpecializedServicesSection({ services }: { services: Service[] }) {
  const specializedServices = services.filter(service => 
    service.category === 'Especializado' || service.category === 'Construcción'
  );

  if (specializedServices.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FontAwesomeIcon icon={faBuilding} className="text-green-500 text-2xl" />
          <h2 className="text-3xl font-bold text-gray-900">Servicios Especializados</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Proyectos de construcción y servicios profesionales
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {specializedServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

// Componente CTA inteligente
function IntelligentCTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white text-center">
      <div className="max-w-2xl mx-auto">
        <FontAwesomeIcon icon={faQuestionCircle} className="text-4xl mb-4" />
        <h3 className="text-2xl font-bold mb-4">
          ¿No encuentras tu servicio?
        </h3>
        <p className="text-lg mb-6 opacity-90">
          Describe tu problema y un experto de Sumee te guiará hacia la solución perfecta
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/525512345678?text=Hola, necesito ayuda para encontrar el servicio adecuado para mi problema"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <FontAwesomeIcon icon={faWhatsappBrand} />
            <span>Chatear por WhatsApp</span>
          </a>
          <a
            href="mailto:soporte@sumeeapp.com?subject=Consulta sobre servicios&body=Hola, necesito ayuda para encontrar el servicio adecuado para mi problema:"
            className="inline-flex items-center justify-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <span>Enviar Email</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default async function ServicesPage() {
  const services = await getServices();
  
  // Filtrar servicios populares y el resto
  const popularServices = services.filter(service => service.is_popular);
  const allServices = services.filter(service => !service.is_popular);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* SECCIÓN 1: Buscador Principal */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Todos Nuestros Servicios
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Encuentra la solución perfecta para tu hogar. Desde urgencias hasta proyectos especializados, 
              tenemos el técnico perfecto para ti.
            </p>
            
            {/* Buscador Principal Mejorado */}
            <div className="max-w-3xl mx-auto">
              <ServiceSearch 
                placeholder="¿Qué problema necesitas resolver? (Ej: fuga de agua, instalar lámpara, pintar habitación)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Servicios Populares */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-3xl" />
            <h2 className="text-4xl font-bold text-gray-900">Servicios Populares</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Los servicios más solicitados por nuestros clientes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: Catálogo Completo */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Catálogo Completo</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora todos nuestros servicios organizados por categorías
            </p>
          </div>
          
          {/* Agrupar servicios por categoría */}
          <div className="space-y-16">
            {['Urgencias', 'Mantenimiento', 'Tecnología', 'Especializado', 'Construcción'].map((category) => {
              const categoryServices = allServices.filter(service => service.category === category);
              if (categoryServices.length === 0) return null;
              
              const categoryIcons = {
                'Urgencias': faFire,
                'Mantenimiento': faTools,
                'Tecnología': faLaptop,
                'Especializado': faBuilding,
                'Construcción': faHardHat
              };
              
              const categoryColors = {
                'Urgencias': 'text-red-500',
                'Mantenimiento': 'text-blue-500',
                'Tecnología': 'text-purple-500',
                'Especializado': 'text-green-500',
                'Construcción': 'text-orange-500'
              };
              
              return (
                <div key={category} className="border-b border-gray-200 pb-12 last:border-b-0">
                  <div className="flex items-center space-x-3 mb-8">
                    <FontAwesomeIcon 
                      icon={categoryIcons[category as keyof typeof categoryIcons]} 
                      className={`text-2xl ${categoryColors[category as keyof typeof categoryColors]}`}
                    />
                    <h3 className="text-2xl font-bold text-gray-900">{category}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: CTA de Fallback */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <IntelligentCTA />
      </div>

      {/* Asistente IA Flotante */}
      <AIAdvisor />
    </div>
  );
}