'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faBell, 
  faTools, 
  faCreditCard,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

const steps = [
  {
    icon: faUserPlus,
    title: 'Crea tu Perfil',
    description: 'Completa tu información profesional en minutos. Incluye tu experiencia, especialidades y zonas de trabajo.',
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    icon: faBell,
    title: 'Recibe Solicitudes',
    description: 'Los clientes te encontrarán automáticamente. Recibe notificaciones de trabajos en tu zona.',
    color: 'green',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  {
    icon: faTools,
    title: 'Realiza el Trabajo',
    description: 'Contacta al cliente, agenda la cita y realiza el trabajo con total libertad y profesionalismo.',
    color: 'purple',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  {
    icon: faCreditCard,
    title: 'Recibe tu Pago',
    description: 'Sumee garantiza tu pago. Recibe tu dinero en 24 horas después de completar el trabajo.',
    color: 'orange',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200'
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cómo Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un proceso simple y transparente para que te enfoques en lo que mejor sabes hacer: 
            <span className="font-semibold text-blue-600"> tu trabajo</span>.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className={`${step.bgColor} ${step.borderColor} border-2 rounded-2xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                {/* Step Number */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${step.bgColor} ${step.borderColor} border-2 rounded-full flex items-center justify-center`}>
                    <span className="text-lg font-bold text-gray-700">{index + 1}</span>
                  </div>
                  <FontAwesomeIcon 
                    icon={step.icon} 
                    className={`text-2xl ${step.iconColor}`} 
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="bg-white rounded-full p-2 shadow-lg border-2 border-gray-200">
                    <FontAwesomeIcon 
                      icon={faArrowRight} 
                      className="text-gray-400 text-sm" 
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para comenzar?
            </h3>
            <p className="text-gray-600 mb-6">
              Únete a cientos de profesionales que ya están creciendo con Sumee App
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserPlus} className="text-blue-500 mr-2" />
                <span>Registro en 3 minutos</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faBell} className="text-green-500 mr-2" />
                <span>Sin compromisos</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCreditCard} className="text-purple-500 mr-2" />
                <span>Pago garantizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
