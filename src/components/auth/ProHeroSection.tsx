'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faDollarSign, 
  faShieldAlt, 
  faChartLine,
  faArrowDown,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

interface ProHeroSectionProps {
  onStartRegistration: () => void;
}

export default function ProHeroSection({ onStartRegistration }: ProHeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Más Clientes,
            </span>
            <br />
            <span className="text-gray-800">
              Menos Complicaciones
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Únete a la red de profesionales más grande de México. 
            <span className="font-semibold text-blue-600">Recibe clientes verificados</span> y 
            <span className="font-semibold text-green-600"> recibe tu pago garantizado</span>.
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm text-gray-600 font-medium">Profesionales Activos</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">$2.5M+</div>
              <div className="text-sm text-gray-600 font-medium">En Pagos Procesados</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8★</div>
              <div className="text-sm text-gray-600 font-medium">Calificación Promedio</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="text-3xl font-bold text-orange-600 mb-2">24h</div>
              <div className="text-sm text-gray-600 font-medium">Tiempo de Pago</div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onStartRegistration}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <span>Comenzar Registro</span>
            <FontAwesomeIcon icon={faArrowDown} className="ml-2 animate-bounce" />
          </button>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 mr-2" />
              <span>Pago 100% Garantizado</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 mr-2" />
              <span>Clientes Verificados</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="text-purple-500 mr-2" />
              <span>Sin Comisiones Ocultas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
