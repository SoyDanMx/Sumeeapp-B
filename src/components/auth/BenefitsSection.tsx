'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faDollarSign, 
  faUsers, 
  faCalendarAlt,
  faStar,
  faClock,
  faCheckCircle,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

const benefits = [
  {
    icon: faUsers,
    title: 'Acceso a Clientes Verificados',
    description: 'Solo trabajamos con clientes que han sido verificados. No más pérdidas de tiempo con clientes no serios.',
    features: [
      'Clientes con identidad verificada',
      'Historial de pagos confirmado',
      'Proyectos reales y específicos'
    ],
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    icon: faDollarSign,
    title: 'Pagos Seguros y Rápidos',
    description: 'Sumee garantiza tu pago. Recibe tu dinero en 24 horas después de completar el trabajo.',
    features: [
      'Pago garantizado por Sumee',
      'Transferencia en 24 horas',
      'Sin riesgo de impagos'
    ],
    color: 'green',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  {
    icon: faCalendarAlt,
    title: 'Gestiona tu Agenda Fácilmente',
    description: 'Controla cuándo trabajas y cuándo descansas. Acepta solo los trabajos que te convengan.',
    features: [
      'Horarios flexibles',
      'Trabajos cerca de ti',
      'Control total de tu agenda'
    ],
    color: 'purple',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  }
];

const additionalBenefits = [
  {
    icon: faShieldAlt,
    title: 'Protección Total',
    description: 'Seguro de responsabilidad civil incluido'
  },
  {
    icon: faStar,
    title: 'Reputación Digital',
    description: 'Sistema de calificaciones que construye tu reputación'
  },
  {
    icon: faClock,
    title: 'Soporte 24/7',
    description: 'Equipo de soporte disponible cuando lo necesites'
  },
  {
    icon: faChartLine,
    title: 'Crecimiento Constante',
    description: 'Herramientas para hacer crecer tu negocio'
  }
];

export default function BenefitsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir Sumee App?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Somos la plataforma que más se preocupa por el éxito de nuestros profesionales.
            <span className="font-semibold text-blue-600"> Tu crecimiento es nuestro objetivo</span>.
          </p>
        </div>

        {/* Main Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`${benefit.bgColor} ${benefit.borderColor} border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
            >
              {/* Icon */}
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 ${benefit.bgColor} ${benefit.borderColor} border-2 rounded-2xl flex items-center justify-center mr-4`}>
                  <FontAwesomeIcon 
                    icon={benefit.icon} 
                    className={`text-2xl ${benefit.iconColor}`} 
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {benefit.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {benefit.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {benefit.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <FontAwesomeIcon 
                      icon={faCheckCircle} 
                      className={`${benefit.iconColor} mr-3`} 
                    />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Benefits Grid */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Beneficios Adicionales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon 
                    icon={benefit.icon} 
                    className="text-2xl text-blue-600" 
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para hacer crecer tu negocio?
            </h3>
            <p className="text-blue-100 mb-6 text-lg">
              Únete a la red de profesionales más grande de México
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <span>Registro gratuito</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <span>Sin compromisos</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <span>Pago garantizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
